import { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Paper, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';


const group = rows =>
  rows.reduce((acc, r) => {
    (acc[r.malware] ||= []).push({ location: r.location, count: r.count });
    return acc;
  }, {});

export default function Stats() {
  const [data, setData] = useState(null);
  const [tab,  setTab ] = useState(0);

  useEffect(() => {
    axios.get('/api/stats').then(r => setData(group(r.data)));
  }, []);

  if (!data) return <CircularProgress sx={{ mt: 4 }} />;

  const malwareNames = Object.keys(data);
  const rows = data[malwareNames[tab]];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Infection stats <Typography component="span" color="secondary">by country</Typography>
      </Typography>

      <Tabs value={tab} onChange={(_, i) => setTab(i)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 2 }}>
        {malwareNames.map(name => <Tab key={name} label={name} />)}
      </Tabs>

      <Paper elevation={3} sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={rows} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Victims" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
