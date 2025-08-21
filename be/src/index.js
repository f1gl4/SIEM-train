import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

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

    const system = `You are a SOC incident generator. Produce three highly realistic SIEM alerts for L1 triage.
Return STRICT JSON that matches the schema below, no extra text.
Guidelines:
- Keep them believable and internally consistent (hosts, processes, filenames, IPs, hashes, URLs).
- Vary attack types (e.g., phishing/double-extension, exfiltration, powershell persistence, credential theft, etc.).
- Severity in {"Low","Medium","High","Critical"}.
- Status ALWAYS "Awaiting action"; Verdict ALWAYS "None"; Assignee empty string.
- "time" should be recent (today) in ISO 8601 with minutes precision.
- "details" should be an array of 6–10 key/value pairs tailored to the alert type (Host, Process Name, User, Target File, File MoTW, MD5/SHA256, Destination, Source IP, etc.).
- "description" concise (1–2 sentences).

JSON schema (return exactly this top-level shape):
{
  "incidents": [
    {
      "time": "2025-03-21T13:58:00Z",
      "name": "Name of the incident",
      "severity": "High",
      "status": "Awaiting action",
      "verdict": "None",
      "assignee": "None",
      "description": "…",
      "details": [
        {"label":"Host","value":"…"},
        {"label":"Process Name","value":"…"}
      ]
    }, {…}, {…}
  ]
}`;

    const user = `Generate three incidents now. Return ONLY the JSON described.`;

    // use fetch
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
          { role: 'user', content: user }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      return res.status(502).json({ message: 'OpenAI request failed', detail: errTxt });
    }

    const data = await r.json();
    let incidents;
    try {
      const content = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);
      incidents = (parsed.incidents || []).slice(0, 3).map((x, i) => ({
        id: i + 1,
        expanded: false,
        time: x.time || '',
        name: x.name || '',
        severity: x.severity || 'Medium',
        status: 'Awaiting action',
        verdict: 'None',
        assignee: '',
        description: x.description || '',
        details: Array.isArray(x.details) ? x.details.slice(0, 10) : []
      }));
    } catch (e) {
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    if (incidents.length !== 3) {
      return res.status(500).json({ message: 'AI did not return 3 incidents' });
    }

    res.json({ incidents });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal error' });
  }
});


app.listen(PORT, () => console.log(`API running on localhost:${PORT}`));
