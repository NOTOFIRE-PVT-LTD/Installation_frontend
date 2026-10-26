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
  cadDrawing: 'Cad Drawing (inside Projects)',
  claimApprovals: 'Claim Approvals + WhatsApp alerts',
  tenders: 'Tender',
  tenderWhatsappAlerts: 'Tender WhatsApp alerts',
  inspections: 'Inspection',
  financialDocuments: 'Financial Document',
  bgWhatsappAlerts: 'BG Deadline WhatsApp alerts',
  accounts: 'Accounts (BG Application)',
  stockItems: 'Stock Items',
  bom: 'BOM',
  itemsMaster: 'Items Master',
  billing: 'Billing',
  quotations: 'Quotations',
  quotationsOwnOnly:
    'Quotation user',
  proformaInvoices: 'Proforma Invoices',
  deliveryChallans: 'Delivery Challans',
  atlantaPayments: 'Atlanta Payments',
  atlantaPaymentsOwnOnly: 'Atlanta Payments user (own records only)',
  auditLogs: 'Audit Logs',
};

const INSTALLER_PERMISSION_KEYS = ['projects', 'reports', 'cadDrawing', 'atlantaPayments', 'atlantaPaymentsOwnOnly'];

export default function PermissionsDialog({ open, user, onClose, onSubmit, submitting }) {
  const isAdmin = user?.role === ROLES.ADMIN;
  const keys = isAdmin ? PERMISSION_KEYS : INSTALLER_PERMISSION_KEYS;
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open) {
      setValues(
        keys.reduce((acc, key) => {
          if (!isAdmin) {
            if (['atlantaPayments', 'atlantaPaymentsOwnOnly'].includes(key)) {
              acc[key] = Boolean(user?.permissions?.[key]);
            } else {
              acc[key] = user?.permissions ? user.permissions[key] !== false : true;
            }
          } else {
            acc[key] = Boolean(user?.permissions?.[key]);
          }
          return acc;
        }, {})
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const handleCheckboxChange = (key, checked) => {
    setValues((prev) => {
      const next = { ...prev, [key]: checked };
      if (key === 'atlantaPaymentsOwnOnly' && checked) {
        next.atlantaPayments = true;
      }
      if (key === 'atlantaPayments' && !checked) {
        next.atlantaPaymentsOwnOnly = false;
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Permissions — {user?.name}</DialogTitle>
      <DialogContent>
        {!isAdmin && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Installers can use Projects and Reports by default. For Atlanta Payments, enable <b>Atlanta Payments</b> and{' '}
            <b>Atlanta Payments user (own records only)</b> so they can only view and manage their own payment records.
          </Typography>
        )}
        {isAdmin && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable <b>Claim Approvals + WhatsApp alerts</b> for claim notifications, <b>Tender WhatsApp alerts</b> for
            tender-created notifications, and <b>BG Deadline WhatsApp alerts</b> for BG reminders (14 days after LOA
            Date). For a <b>quotation user</b>, tick only <b>Quotations</b> and <b>Quotation user</b>. For an{' '}
            <b>Atlanta Payments user (own records only)</b>, tick <b>Atlanta Payments</b> and{' '}
            <b>Atlanta Payments user (own records only)</b>.
          </Typography>
        )}
        <FormGroup>
          {keys.map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={values[key] || false}
                  onChange={(e) => handleCheckboxChange(key, e.target.checked)}
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
