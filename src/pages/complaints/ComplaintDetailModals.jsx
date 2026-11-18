import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { STATUS_CONFIG } from './complaintUtils';

export function AssignModal({ open, onClose, assignees, assigneeId, setAssigneeId, reason, setReason, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Assign Field Engineer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select fullWidth size="small" label="Select Engineer" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            {assignees.map((eng) => (
              <MenuItem key={eng._id || eng.id} value={eng._id || eng.id}>{eng.name} ({eng.jobRole || 'Engineer'})</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth multiline minRows={2} size="small" label="Assignment Reason / Remarks" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !assigneeId}>Assign</Button>
      </DialogActions>
    </Dialog>
  );
}

export function StatusModal({ open, onClose, currentStatus, nextStatus, setNextStatus, reason, setReason, onSubmit, loading }) {
  const allowed = ['IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Transition Ticket Status</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select fullWidth size="small" label="Next Status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            {allowed.map((st) => (
              <MenuItem key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth multiline minRows={2} size="small" label="Reason for Status Change" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !nextStatus}>Update Status</Button>
      </DialogActions>
    </Dialog>
  );
}

export function WorkLogModal({ open, onClose, form, setForm, onSubmit, loading }) {
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Record Site Investigation / Work Log</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}><TextField fullWidth required multiline minRows={2} size="small" label="Work Performed *" value={form.workPerformed} onChange={(e) => setField('workPerformed', e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Findings" value={form.findings} onChange={(e) => setField('findings', e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Action Taken" value={form.actionTaken} onChange={(e) => setField('actionTaken', e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Parts Used" value={form.partsUsed} onChange={(e) => setField('partsUsed', e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="date" label="Next Follow-up Date" value={form.followUpDate} onChange={(e) => setField('followUpDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !form.workPerformed.trim()}>Save Work Log</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ResolveModal({ open, onClose, form, setForm, onSubmit, loading }) {
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Mark Complaint as Resolved</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}><TextField fullWidth required size="small" label="Root Cause / Reason *" value={form.resolutionReason} onChange={(e) => setField('resolutionReason', e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth required size="small" label="Action Taken / Corrective Measures *" value={form.resolutionActionTaken} onChange={(e) => setField('resolutionActionTaken', e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth required multiline minRows={2} size="small" label="Resolution Summary *" value={form.resolutionSummary} onChange={(e) => setField('resolutionSummary', e.target.value)} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !form.resolutionReason || !form.resolutionActionTaken || !form.resolutionSummary}>Resolve Complaint</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ReopenModal({ open, onClose, reason, setReason, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Reopen Complaint Ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField fullWidth multiline minRows={3} size="small" label="Justification for Reopening *" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={onSubmit} disabled={loading || !reason.trim()}>Reopen Ticket</Button>
      </DialogActions>
    </Dialog>
  );
}

