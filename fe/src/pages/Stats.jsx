
import { useEffect, useState } from 'react';
import { Typography, Paper, Box, CircularProgress } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const SIEM_STORAGE_KEY = 'siem-training-incidents';

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalEvaluated, setTotalEvaluated] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIEM_STORAGE_KEY);
      if (!raw) {
        setChartData([]);
        setTotalEvaluated(0);
        return;
      }

      const incidents = JSON.parse(raw);
      if (!Array.isArray(incidents)) {
        setChartData([]);
        setTotalEvaluated(0);
        return;
      }

      const evaluated = incidents.filter(
        (r) => r.aiEval && typeof r.aiEval.verdictOk === 'string'
      );

      const correct = evaluated.filter(
        (r) => r.aiEval.verdictOk === 'Yes'
      ).length;
      const incorrect = evaluated.filter(
        (r) => r.aiEval.verdictOk === 'No'
      ).length;

      setTotalEvaluated(evaluated.length);
      setChartData([
        { label: 'Correct verdicts', count: correct },
        { label: 'Incorrect verdicts', count: incorrect },
      ]);
    } catch (e) {
      console.error('Failed to build stats from localStorage', e);
      setChartData([]);
      setTotalEvaluated(0);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const hasData = totalEvaluated > 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Training statistics
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Verdict accuracy
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {hasData
            ? `You have evaluated ${totalEvaluated} incidents.`
            : 'No evaluated incidents yet. Go to the SIEM tab, pick up alerts and send them for evaluation.'}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 40, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              There is nothing to show yet — the chart will appear once at least
              one incident is evaluated.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
