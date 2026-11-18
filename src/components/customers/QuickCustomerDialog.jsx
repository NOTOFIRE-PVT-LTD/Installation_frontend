import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { customerApi } from '../../api/customerApi';
import { readLocation } from '../../utils/readLocation';
import { showSnackbar } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../app/hooks';

export default function QuickCustomerDialog({ open, onClose, onCreated }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    city: '',
    address: '',
    locationLat: '',
    locationLng: '',
  });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleCaptureLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const loc = await readLocation();
      if (loc.lat == null) {
        setError(loc.error || 'Could not fetch current GPS location');
        return;
      }
      setForm((prev) => ({
        ...prev,
        locationLat: loc.lat,
        locationLng: loc.lng,
        address: prev.address || loc.address || '',
      }));
      dispatch(showSnackbar({ message: `Location captured: ±${loc.accuracy}m accuracy` }));
    } catch (err) {
      setError(err.message || 'Failed to capture GPS');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const company = String(form.companyName || '').trim();
    if (!company) {
      setError('Customer / Company name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        companyName: company,
        contactPerson: String(form.contactPerson || '').trim(),
        phone: String(form.phone || '').trim(),
        city: String(form.city || '').trim(),
        address: String(form.address || '').trim(),
        locationLat: form.locationLat !== '' ? Number(form.locationLat) : null,
        locationLng: form.locationLng !== '' ? Number(form.locationLng) : null,
      };

      const { data } = await customerApi.create(payload);
      const created = data.data;
      dispatch(showSnackbar({ message: `Customer "${company}" added!` }));
      onCreated?.(created);
      onClose();
      // Reset form
      setForm({
        companyName: '',
        contactPerson: '',
        phone: '',
        city: '',
        address: '',
        locationLat: '',
        locationLng: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not create customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          + Add New Customer
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2} component="form" onSubmit={handleSave}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            required
            label="Company / Customer Name"
            placeholder="e.g. Acme Stores / Ramesh Gupta"
            value={form.companyName}
            onChange={handleChange('companyName')}
            fullWidth
            size="small"
          />
          <TextField
            label="Contact Person"
            placeholder="e.g. Ramesh"
            value={form.contactPerson}
            onChange={handleChange('contactPerson')}
            fullWidth
            size="small"
          />
          <TextField
            label="Phone / Mobile"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={handleChange('phone')}
            fullWidth
            size="small"
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="City"
              placeholder="e.g. Delhi / Noida"
              value={form.city}
              onChange={handleChange('city')}
              fullWidth
              size="small"
            />
          </Stack>
          <TextField
            label="Address"
            placeholder="Street address or area"
            value={form.address}
            onChange={handleChange('address')}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.5,
              borderRadius: '8px',
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <div>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                GPS Location
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {form.locationLat ? `${Number(form.locationLat).toFixed(4)}, ${Number(form.locationLng).toFixed(4)}` : 'Not captured yet'}
              </Typography>
            </div>
            <Button
              size="small"
              variant="outlined"
              startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon fontSize="small" />}
              disabled={locating}
              onClick={handleCaptureLocation}
            >
              {locating ? 'Reading GPS…' : form.locationLat ? 'Update GPS' : 'Set My GPS'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !form.companyName.trim()}>
          {saving ? 'Creating…' : 'Create & Select'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
