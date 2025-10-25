import React, { useState } from "react";
import {
  Box, Stack, Typography, Button, Paper, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Collapse, Alert, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { generateIncidents, evaluateIncident } from "../api";


import SiemEdit, {
  STATUS_OPTIONS, VERDICT_OPTIONS, SEVERITY_OPTIONS, ASSIGNEE_OPTIONS
} from "./SiemEdit";

export default function Siem() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editToken, setEditToken] = useState(null);
  const [form, setForm] = useState({
    name: "",
    status: "New",
    verdict: "None",
    severity: "Medium",
    assignee: "None",
    comment: ""
  });

  const toggleExpand = (token) =>
    setRows((r) => r.map((x) => (x.token === token ? { ...x, expanded: !x.expanded } : x)));

  const onGenerate = async () => {
    setErr("");
    setLoading(true);
    setRows([]);
    try {
      const r = await generateIncidents();
      const incidents = (r?.incidents || []).map((it, idx) => ({
        ...it,
        id: idx + 1,
        expanded: false,
        analystComment: it.analystComment || "",
      }));
      setRows(incidents);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Generation failed";
      setErr(msg.includes("OPENAI_API_KEY") ? "Установи OPENAI_API_KEY на бэкенде." : msg);
    } finally {
      setLoading(false);
    }
  };

  // ===== Edit handlers
  const openEdit = (row) => {
    setEditToken(row.token || row.id);
    setForm({
      name: row.name || "",
      status: STATUS_OPTIONS.includes(row.status) ? row.status : "New", // "Awaiting action" -> "New"
      verdict: VERDICT_OPTIONS.includes(row.verdict) ? row.verdict : "None",
      severity: SEVERITY_OPTIONS.includes(row.severity) ? row.severity : "Medium",
      assignee: ASSIGNEE_OPTIONS.includes(row.assignee) ? row.assignee : "None",
      comment: row.analystComment || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditToken(null);
  };

  const saveEdit = () => {
    if (!editToken) return;
    setRows((prev) =>
      prev.map((x) =>
        (x.token || x.id) === editToken
          ? {
              ...x,
              status: form.status,
              verdict: form.verdict,
              severity: form.severity,
              assignee: form.assignee,
              analystComment: form.comment,
            }
          : x
      )
    );
    closeEdit();
  };

  const evaluateEdit = async (f) => {
    if (!editToken) return;
    try {
      setLoading(true);
      const payload = {
        token: editToken,
        status: f.status,
        verdict: f.verdict,
        severity: f.severity,
        assignee: f.assignee,
        comment: f.comment,
      };
      
      const res = await evaluateIncident(payload);
      setRows(prev => prev.map(x => 
        (x.token || x.id) === editToken
          ? { ...x, aiEval: res, status: f.status, verdict: f.verdict, severity: f.severity, assignee: f.assignee, analystComment: f.comment }
          : x
      ));
      
      setRows(prev => prev.map(x => 
        (x.token || x.id) === editToken ? { ...x, expanded: true } : x
      ));
      setEditOpen(false);
      setEditToken(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Evaluation failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="siem-page">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">SIEM training system</Typography>
        <Button variant="contained" color="secondary" onClick={onGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </Button>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

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
              <TableCell sx={{ width: 220 }}>Time</TableCell>
              <TableCell>Name</TableCell>
              <TableCell sx={{ width: 120 }}>Severity</TableCell>
              <TableCell sx={{ width: 160 }}>Status</TableCell>
              <TableCell sx={{ width: 140 }}>Verdict</TableCell>
              <TableCell sx={{ width: 160 }}>Assignee</TableCell>
              <TableCell sx={{ width: 110, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ opacity: 0.7 }}>
                  Press <strong>Generate</strong> button, to generate 3 incidents.
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => (
              <React.Fragment key={row.token || row.id}>
                <TableRow hover>
                  <TableCell>{row.time || "—"}</TableCell>
                  <TableCell>{row.name || "—"}</TableCell>
                  <TableCell>{row.severity || "—"}</TableCell>
                  <TableCell>{row.status || "—"}</TableCell>
                  <TableCell>{row.verdict || "—"}</TableCell>
                  <TableCell>{row.assignee || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="edit" onClick={() => openEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="expand"
                      onClick={() => toggleExpand(row.token || row.id)}
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
                        <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          <strong>Description:</strong>&nbsp;{row.description || "—"}
                        </Typography>
                        {Array.isArray(row.details) && row.details.length > 0 && (
                          <Box sx={{ mt: 1, display: 'grid', rowGap: '6px' }}>
                            {row.details.map((d, i) => (
                              <div key={i} className="details">
                                <span className="details-label">{d.label}:</span>{" "}
                                <span className="details-value">{d.value}</span>
                              </div>
                            ))}
                          </Box>
                        )}
                        
                        {row.analystComment && (
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Analyst Comment:</strong>&nbsp;{row.analystComment}
                            </Typography>
                          </Box>
                        )}

                        {row.aiEval && (
                          <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              AI Evaluation
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary '}}>
                              <strong>Ground Truth:</strong>&nbsp;{row.aiEval.groundTruth}
                              {row.aiEval.groundTruthReason ? ` — ${row.aiEval.groundTruthReason}` : ""}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                             <strong>Verdict chosen:</strong>&nbsp;{row.aiEval.chosenVerdict}&nbsp;&nbsp;|&nbsp;&nbsp;
                              <strong>Correct?</strong>&nbsp;{row.aiEval.verdictOk}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Report score:</strong>&nbsp;{row.aiEval.reportScore}%
                            </Typography>
                            {row.aiEval.summary && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                <strong>Summary:</strong>&nbsp;{row.aiEval.summary}
                              </Typography>
                            )}
                            {row.aiEval.reportFeedback && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                <strong>Feedback:</strong>&nbsp;{row.aiEval.reportFeedback}
                              </Typography>
                            )}
                          </Box>
                        )}

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
        Displaying {rows.length ? `1 – ${rows.length} of ${rows.length}` : "0 of 0"} records
      </Typography>

      <SiemEdit
        open={editOpen}
        form={form}
        setForm={setForm}
        onClose={closeEdit}
        onSave={saveEdit}
        onEvaluate={evaluateEdit}
      />
    </Box>
  );
}
