import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { MISSED_VISIT_REASONS } from '../../utils/constants';

export default function MissedVisitDialog({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');

  const submit = () => {
    onSubmit({ reason, explanation });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{
        onExited: () => {
          setReason('');
          setExplanation('');
        },
      }}
    >
      <DialogTitle>Report Missed Visit</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mt: 1 }}
        >
          {MISSED_VISIT_REASONS.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label={reason === 'Other' ? 'Explanation (required)' : 'Additional explanation'}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          multiline
          minRows={3}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !reason}>
          {submitting ? 'Submitting…' : 'Submit for Approval'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
