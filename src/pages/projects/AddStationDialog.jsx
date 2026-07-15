import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { SITE_TYPES } from '../../utils/constants';

export default function AddStationDialog({ open, onClose, onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(SITE_TYPES[0]);
  const [installationAmount, setInstallationAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setType(SITE_TYPES[0]);
      setInstallationAmount('');
      setError('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Station name is required');
      return;
    }
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('type', type);
    formData.append('installationAmount', installationAmount || 0);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Station</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Name of Station / Site"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            autoFocus
            fullWidth
          />
          <TextField select label="Site Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
            {SITE_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Installation Amount Allocated (₹)"
            type="number"
            value={installationAmount}
            onChange={(e) => setInstallationAmount(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Add Station'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
