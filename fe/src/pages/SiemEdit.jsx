import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Select, MenuItem, FormControl, InputLabel,
  TextField, Button, Typography
} from "@mui/material";

export const STATUS_OPTIONS  = ["New", "In progress", "Closed"];
export const VERDICT_OPTIONS = ["None", "True Positive", "False Positive"];
export const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
export const ASSIGNEE_OPTIONS = ["None", "Me", "L2 analyst"];

export default function SiemEdit({ open, form, setForm, onClose, onSave, onEvaluate }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        Edit Alert
        {form.name ? (
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.7 }}>
            {form.name}
          </Typography>
        ) : null}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Verdict</InputLabel>
              <Select
                label="Verdict"
                value={form.verdict}
                onChange={(e) => setForm(f => ({ ...f, verdict: e.target.value }))}
              >
                {VERDICT_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                label="Severity"
                value={form.severity}
                onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                label="Assignee"
                value={form.assignee}
                onChange={(e) => setForm(f => ({ ...f, assignee: e.target.value }))}
              >
                {ASSIGNEE_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Analyst Comment (5W)"
              placeholder="Who, What, Where, When, Why..."
              multiline
              minRows={4}
              fullWidth
              value={form.comment}
              onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="info" onClick={() => onEvaluate?.(form)}>Evaluate</Button>
        <Button variant="contained" color="secondary" onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
