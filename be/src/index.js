import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { getRandomKev } from './kev.js';
import { getTwoDistinctMispSeeds } from './misp.js';

const siemTruthStore = new Map(); // key: token(UUID) -> { groundTruth: boolean, reason: string, full: any }
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// CRUD for Malware
app.get('/api/malware', async (req, res) => {
  const data = await prisma.malware.findMany({ select: { id: true, name: true, type: true, severity: true } });
  res.json(data);
});

app.post('/api/malware', async (req, res) => {
  const malware = await prisma.malware.create({ 
    data: { ...req.body, firstSeen: new Date(req.body.firstSeen) },
   });
  res.status(201).json(malware);
});

app.get('/api/malware/:id', async (req, res) => {
  const malware = await prisma.malware.findUnique({
    where: { id: Number(req.params.id) },
    include: { incidents: true },
  });
  if (!malware) return res.status(404).json({ message: 'Not found' });
  res.json(malware);
});

// update | delete malware

app.put('/api/malware/:id', async (req, res) => {
  try {
    const malware = await prisma.malware.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body, firstSeen: new Date(req.body.firstSeen) },
    });
    res.json(malware);
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
});

app.delete('/api/malware/:id', async (req, res) => {
  try {
    await prisma.malware.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
});

// CRUD for Incidents
// create | delete incident

app.post('/api/malware/:id/incidents', async (req, res) => {
  try {
    const incident = await prisma.incident.create({
      data: {
        malwareId: Number(req.params.id),
        ...req.body,
        occurredAt: new Date(req.body.occurredAt),
        victims: Number(req.body.victims || 1),
      },
    });
    res.status(201).json(incident);
  } catch (e) {
    res.status(400).json({ message: 'Bad request' });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await prisma.incident.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
});

// Stats

app.get('/api/stats', async (req, res, next) => {
  try {
    const raw = await prisma.incident.groupBy({
      by: ['malwareId', 'location'],
      //_count: { _all: true },
      _sum: { victims: true },
    });

    const malwareMap = Object.fromEntries(
      (await prisma.malware.findMany({ select: { id: true, name: true } }))
        .map(m => [m.id, m.name]),
    );

    const stats = raw.map(r => ({
      malware: malwareMap[r.malwareId] || 'Unknown',
      location: r.location || 'Unknown',
      count: r._sum.victims,
    }));

    res.json(stats);
  } catch (e) {
    next(e);
  }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, _next) => {
  console.error(err)
  if (res.headersSent) return
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 4000;

// === SIEM: generate AI incidents ===

app.post('/api/siem/generate', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(401).json({ message: 'Missing OPENAI_API_KEY' });

    // seeds
    let kev = null, mispSeeds = [];
    try { kev = await getRandomKev(); } catch (_) { kev = null; }
    try { mispSeeds = await getTwoDistinctMispSeeds(); } catch (_) { mispSeeds = []; }

    // PROMPTS
    const kevSection = kev ? `
A real-world CVE seed is supplied below. You MUST base exactly one of the three incidents on it (choose a random position; do NOT reveal which one).
MASKING RULES for that incident:
- NEVER include the CVE ID, the words "CISA" or "KEV", or advisory links.
- AVOID brand/product names; use generic nouns (e.g., "popular email client", "virtualization management console").
- Describe only observable behavior/telemetry/impact consistent with the CVE (process chain, service restarts, crash + DLL sideloading, exploit payload indicators, outbound callbacks, privilege change, etc.).
- Set "ground_truth": true and "ground_truth_reason": "real-world exploitation pattern inferred from public CVE".` : `
No KEV seed available.`;

    const mispSection = mispSeeds.length === 2 ? `
Two MISP Galaxy seeds are supplied below. You MUST base the other two incidents on them (one incident per seed, random positions; do NOT reveal which seed you used).
MASKING RULES for these two:
- Do NOT mention family names (e.g., no "Remcos", "AgentTesla", "Conti") — use generic roles like "commercial remote administration tool", "credential stealer", "banking trojan", "backdoor", etc.
- Focus on host/user/process/log artifacts and network telemetry.
- Of the two MISP-based incidents, set **exactly one** "ground_truth": false and craft a believable benign/noisy scenario (e.g., legitimate remote support session, backup/sync, vulnerability scanner, admin script). The other must be a true positive.` : `
No MISP seeds available; produce remaining incidents as usual.`;

    const system = `You are a SOC incident generator. Produce three highly realistic SIEM alerts for L1 triage.

Return STRICT JSON that matches the schema below, no extra text.

Guidelines:
- Each incident in the same batch MUST be a different attack type.
- Keep them believable and internally consistent (hosts, processes, filenames, IPs, hashes, URLs, etc.).
- Always randomize hostnames, users, filenames, IPs, hashes, and URLs so results are never repeated.
- Severity in {"Low","Medium","High","Critical"}.
- Status ALWAYS "Awaiting action"; Verdict ALWAYS "None"; Assignee ALWAYS "None".
- "time" must be today, formatted as 'Mon DDth YYYY at HH:MM' (UTC).
- "details" must be an array of 5–10 label/value pairs tailored to the specific alert type.
- "description" concise (1–2 sentences).
- Include a HIDDEN field "ground_truth" (true|false) and "ground_truth_reason" (short sentence).
- If KEV and MISP seeds are provided: base exactly one incident on KEV and exactly two on MISP (one per seed), in random order.
${kevSection}
${mispSection}

JSON schema (return exactly this top-level shape):
{
  "incidents": [
    {
      "time": "Mon DDth YYYY at HH:MM",
      "name": "Name of the incident",
      "severity": "High",
      "status": "Awaiting action",
      "verdict": "None",
      "assignee": "None",
      "description": "…",
      "details": [
        {"label":"Host","value":"…"},
        {"label":"Process Name","value":"…"}
      ],
      "ground_truth": true,
      "ground_truth_reason": "short system-only note"
    }, {…}, {…}
  ]
}
`;

    // 
    const user = {
      generate: "Produce exactly three incidents and ONLY the JSON described.",
      kev_seed: kev || null,
      misp_seed_1: mispSeeds[0] || null,
      misp_seed_2: mispSeeds[1] || null,
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(user, null, 2) }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      return res.status(502).json({ message: 'OpenAI request failed', detail: errTxt });
    }

    const data = await r.json();

    // parse - answer - ground_truth
    const publicIncidents = [];
    try {
      const content = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);
      const items = (parsed.incidents || []).slice(0, 3);

      // at least 1 false positive
      let falseCount = items.filter(x => x.ground_truth === false).length;

      items.forEach((x, i) => {
        const token = randomUUID();

        let isTP = typeof x.ground_truth === 'boolean' ? x.ground_truth : true;

        // TODO - сейчас последний записывает как FP для баланса 
        if (i === items.length - 1 && falseCount === 0) {
          isTP = false;
          falseCount = 1;
        }

        siemTruthStore.set(token, {
          groundTruth: isTP,
          reason: x.ground_truth_reason || (isTP
            ? (kev ? 'Based on real-world seed(s)' : 'Likely malicious pattern')
            : 'Benign/noisy pattern by design'),
          full: x,
        });

        publicIncidents.push({
          id: i + 1,
          token,
          expanded: false,
          time: x.time || '',
          name: x.name || '',
          severity: x.severity || 'Medium',
          status: 'Awaiting action',
          verdict: 'None',
          assignee: 'None',
          description: x.description || '',
          details: Array.isArray(x.details) ? x.details.slice(0, 10) : [],
        });
      });

    } catch (e) {
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    if (publicIncidents.length !== 3) {
      return res.status(500).json({ message: 'AI did not return 3 incidents' });
    }

    res.json({ incidents: publicIncidents });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal error' });
  }
});



// === SIEM: evaluate verdict ===
app.post('/api/siem/evaluate', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(401).json({ message: 'Missing OPENAI_API_KEY' });

    const { token, verdict, status, severity, assignee, comment } = req.body || {};
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const stored = siemTruthStore.get(token);
    if (!stored) return res.status(404).json({ message: 'Incident token not found' });

    // generation data
    const full = stored.full || {};
    const gtBool = !!stored.groundTruth;
    const gtLabel = gtBool ? 'True Positive' : 'False Positive';

    const verdictMap = {
      'True Positive': true,
      'False Positive': false,
      'None': null,
    };
    const chosenBool = verdictMap[verdict] ?? null;

    // heck verdict
    const verdictCorrect = (chosenBool !== null) ? (chosenBool === gtBool) : false;

    const system = `You are an L2 SOC evaluator. You will receive:

    - the original alert (context),
    - the analyst selection (status, verdict, severity, assignee),
    - the analyst's 5W comment,
    - and the hidden ground truth.

    Task:
    1) Assess the quality of the 5W comment for an L1 SOC triage (Who/What/Where/When/Why quality, accuracy, conciseness, actionability).
    2) Write 2–4 sentences of constructive feedback tailored to L1.
    3) Provide a 0–100 integer score (0=useless, 100=excellent).
    4) Provide a 1–2 sentence summary of the incident and triage.
    Return STRICT JSON with keys:
    {
      "report_score": 0-100 (integer),
      "report_feedback": "2-4 sentences",
      "summary": "1-2 sentences"
    }
    Do NOT include extra keys or text.`;

    const user = {
      alert: {
        time: full.time,
        name: full.name,
        severity_original: full.severity,
        description: full.description,
        details: full.details,
      },
      analyst_selection: { status, verdict, severity, assignee },
      analyst_comment_5w: comment || "",
      ground_truth: { value: gtBool, label: gtLabel, reason: stored.reason || "" }
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(user, null, 2) }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      return res.status(502).json({ message: 'OpenAI request failed', detail: errTxt });
    }

    // parse and feedback
    let ai = { report_score: 0, report_feedback: '', summary: '' };
    try {
      const data = await r.json();
      const content = data?.choices?.[0]?.message?.content ?? '{}';
      ai = JSON.parse(content);
    } catch (_) {  }

    // make answer
    res.json({
      token,
      chosenVerdict: verdict || 'None',
      groundTruth: gtLabel,
      groundTruthReason: stored.reason || '',
      verdictOk: verdictCorrect ? 'Yes' : 'No',
      reportScore: Number.isInteger(ai.report_score) ? Math.max(0, Math.min(100, ai.report_score)) : 0,
      reportFeedback: ai.report_feedback || '',
      summary: ai.summary || ''
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal error' });
  }
});


app.listen(PORT, () => console.log(`API running on localhost:${PORT}`));
