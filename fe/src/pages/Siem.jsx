import React, { useState } from "react";
import {
  Box, Stack, Typography, Button, Paper, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Collapse
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

const initialIncidents = [
  { id: 1, time: "", name: "", severity: "", status: "", verdict: "", assignee: "", expanded: false },
  { id: 2, time: "", name: "", severity: "", status: "", verdict: "", assignee: "", expanded: false },
  { id: 3, time: "", name: "", severity: "", status: "", verdict: "", assignee: "", expanded: false },
];

export default function Siem() {
  const [rows, setRows] = useState(initialIncidents);

  const toggleExpand = (id) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, expanded: !x.expanded } : x)));

  return (
    <Box>
      {/* Заголовок и зелёная кнопка из темы (secondary) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">SIEM training system</Typography>
        <Button variant="contained" color="secondary">Generate</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Assigned alert</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, border: '1px dashed', borderColor: 'divider', p: 1.2, borderRadius: 1 }}>
          You haven't picked up any alerts! Assign yourself to an alert, move it to "In Progress", and start the triage!
        </Typography>

        <Stack direction="row" sx={{ mt: 2 }}>
          <TextField
            size="small"
            placeholder="Search for an alert"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 320 }}
          />
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 180 }}>Time</TableCell>
              <TableCell>Name</TableCell>
              <TableCell sx={{ width: 120 }}>Severity</TableCell>
              <TableCell sx={{ width: 160 }}>Status</TableCell>
              <TableCell sx={{ width: 140 }}>Verdict</TableCell>
              <TableCell sx={{ width: 160 }}>Assignee</TableCell>
              <TableCell sx={{ width: 110, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow hover>
                  <TableCell>{row.time || "—"}</TableCell>
                  <TableCell>{row.name || "—"}</TableCell>
                  <TableCell>{row.severity || "—"}</TableCell>
                  <TableCell>{row.status || "—"}</TableCell>
                  <TableCell>{row.verdict || "—"}</TableCell>
                  <TableCell>{row.assignee || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton
                      size="small"
                      aria-label="expand"
                      onClick={() => toggleExpand(row.id)}
                      sx={{ transform: row.expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={row.expanded} timeout="auto" unmountOnExit>
                      <Box sx={{ py: 1.5, px: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <strong>Description:</strong>&nbsp;
                        </Typography>
                        {/* сюда позже подставим сгенерированные поля */}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
        Displaying 1 – 3 of 3 records
      </Typography>
    </Box>
  );
}
