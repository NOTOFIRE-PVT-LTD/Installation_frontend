import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { PERMISSION_KEYS, ROLES } from '../../utils/constants';

const LABELS = {
  dashboard: 'Dashboard',
  users: 'Users',
  projects: 'Projects',
  reports: 'Reports',
  payments: 'Payments',
  numbers: 'Numbers',
  cadDrawing: 'Cad Drawing',
  claimApprovals: 'Claim Approvals + WhatsApp alerts',
};

const INSTALLER_PERMISSION_KEYS = ['projects', 'reports', 'cadDrawing'];

export default function PermissionsDialog({ open, user, onClose, onSubmit, submitting }) {
  const isAdmin = user?.role === ROLES.ADMIN;
  const keys = isAdmin ? PERMISSION_KEYS : INSTALLER_PERMISSION_KEYS;
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open) {
      setValues(
        keys.reduce((acc, key) => {
          // Admins default to no access with no doc; Installers default to full access (matches backend).
          acc[key] = user?.permissions ? user.permissions[key] !== false : !isAdmin;
          return acc;
        }, {})
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Permissions — {user?.name}</DialogTitle>
      <DialogContent>
        {!isAdmin && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Installers can use Projects, Reports, and Cad Drawing unless restricted here.
          </Typography>
        )}
        {isAdmin && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable <b>Claim Approvals + WhatsApp alerts</b> for admins who should receive a WhatsApp message
            when an installer submits a payment request. The admin must have a valid mobile number saved on their
            profile ({user?.mobileNumber || 'not set'}).
          </Typography>
        )}
        <FormGroup>
          {keys.map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={values[key] || false}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
              }
              label={LABELS[key]}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSubmit(values)} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
