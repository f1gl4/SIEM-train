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
app.listen(PORT, () => console.log(`API running on localhost:${PORT}`));
