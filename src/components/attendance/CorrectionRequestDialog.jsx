import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ATTENDANCE_PHASE, formatIstDate } from '../../utils/attendanceFormat';

export default function CorrectionRequestDialog({ open, day, pending, onClose, onSubmit }) {
  const [requestedPunchIn, setRequestedPunchIn] = useState('09:30');
  const [requestedPunchOut, setRequestedPunchOut] = useState('18:00');
  const [reason, setReason] = useState('');
  const missingIn = day?.phase === ATTENDANCE_PHASE.MISSING || !day?.punchInAt;

  useEffect(() => {
    if (!open) return;
    setRequestedPunchIn('09:30');
    setRequestedPunchOut('18:00');
    setReason('');
  }, [open, day?.date]);

  const canSubmit = Boolean(reason.trim()) && (missingIn ? requestedPunchIn : requestedPunchOut);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Request attendance correction</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {day?.date ? formatIstDate(day.date) : ''} · Admin must approve any missed punch. You cannot edit the timestamp yourself.
        </Typography>
        {missingIn && (
          <TextField
            fullWidth
            type="time"
            label="Requested punch in"
            value={requestedPunchIn}
            onChange={(e) => setRequestedPunchIn(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        )}
        <TextField
          fullWidth
          type="time"
          label="Requested punch out"
          value={requestedPunchOut}
          onChange={(e) => setRequestedPunchOut(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          required
          multiline
          minRows={3}
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={pending || !canSubmit}
          onClick={() =>
            onSubmit({
              attendanceDate: day.date,
              requestedPunchIn: missingIn ? requestedPunchIn : undefined,
              requestedPunchOut: requestedPunchOut || undefined,
              reason: reason.trim(),
            })
          }
        >
          {pending ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
