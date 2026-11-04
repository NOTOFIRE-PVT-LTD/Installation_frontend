import { useEffect, useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { ADMIN_TYPES, PERMISSION_KEYS, ROLES } from '../../utils/constants';

const USER_PERMISSION_KEYS = [
  'complaints',
  'attendance',
  'projects',
  'reports',
  'cadDrawing',
  'customers',
  'atlantaPayments',
  'atlantaPaymentsOwnOnly',
  'shipping',
  'importControl',
];

const USER_LABELS = {
  complaints: 'Complaint Resolution (Field Engineer)',
  attendance: 'Attendance (Field Sales / Visits)',
  projects: 'Projects & Installation',
  reports: 'Reports',
  cadDrawing: 'CAD Drawings (inside Projects)',
  customers: 'Customers Directory',
  atlantaPayments: 'Atlanta Payments',
  atlantaPaymentsOwnOnly: 'Atlanta Payments (Own Records Only)',
  shipping: 'Shipping Control',
  importControl: 'Import Control',
};

const ADMIN_LABELS = {
  complaints: 'Complaint Resolution (Admin / Coordinator)',
  salespersonTracking: 'Attendance & Salesperson Tracking (Admin)',
  dashboard: 'Installation Dashboard',
  users: 'User Management',
  projects: 'Projects',
  reports: 'Reports',
  claimApprovals: 'Claim & Expense Approvals',
  tenders: 'Tenders Management',
  tenderWhatsappAlerts: 'Tender WhatsApp Alerts',
  accounts: 'Accounts (BG Application)',
  bgWhatsappAlerts: 'BG Deadline WhatsApp Alerts',
  stockItems: 'Stock Items',
  bom: 'BOM',
  itemsMaster: 'Items Master',
  billing: 'Billing',
  quotations: 'Quotations',
  quotationsOwnOnly: 'Quotation User (Own Records)',
  proformaInvoices: 'Proforma Invoices',
  deliveryChallans: 'Delivery Challans',
  atlantaPayments: 'Atlanta Payments',
  atlantaPaymentsOwnOnly: 'Atlanta Payments (Own Records Only)',
  numbers: 'Numbers Directory',
  auditLogs: 'Audit Logs',
  shipping: 'Shipping Control',
  importControl: 'Import Control',
};

export default function PermissionsDialog({ open, user, onClose, onSubmit, submitting }) {
  const isAdmin = user?.role === ROLES.ADMIN;
  const isSuperAdmin = user?.adminType === ADMIN_TYPES.SUPER_ADMIN;

  const keys = useMemo(() => {
    return isAdmin
      ? PERMISSION_KEYS.filter((key) => key !== 'customers' && key !== 'attendance')
      : USER_PERMISSION_KEYS;
  }, [isAdmin]);

  const [values, setValues] = useState({});

  useEffect(() => {
    if (open) {
      setValues(
        keys.reduce((acc, key) => {
          // Admin + User: missing flag = off (opt-in RBAC). Super Admin account is all-on.
          if (isAdmin && isSuperAdmin) {
            acc[key] = true;
          } else {
            acc[key] = Boolean(user?.permissions?.[key]);
          }
          return acc;
        }, {})
      );
    }
  }, [open, user, isAdmin, isSuperAdmin, keys]);

  const handleCheckboxChange = (key, checked) => {
    setValues((prev) => {
      const next = { ...prev, [key]: checked };
      if (key === 'atlantaPaymentsOwnOnly' && checked) {
        next.atlantaPayments = true;
      }
      if (key === 'atlantaPayments' && !checked) {
        next.atlantaPaymentsOwnOnly = false;
      }
      if (key === 'salespersonTracking') {
        next.customers = checked;
        next.attendance = checked;
      }
      return next;
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '1.5px solid #D4A34E',
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF0DF 100%)',
          boxShadow: '0 12px 32px rgba(36, 20, 4, 0.2)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #E2D3BE' }}>
        <Typography variant="h6" fontWeight={800} color="#241404">
          Permissions — {user?.name}
        </Typography>
        <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            size="small"
            label={isAdmin ? 'Role: Admin' : 'Role: User (Field Operations)'}
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: isAdmin ? '#f3e8ff' : '#e0f7fa',
              color: isAdmin ? '#7c3aed' : '#0891b2',
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="caption" sx={{ color: '#7C6752', display: 'block', mb: 1.5, fontWeight: 600 }}>
          {isAdmin
            ? 'Opt-in only — grant the modules for this Admin’s app. Leave other apps unchecked so access stays unmixed.'
            : 'Select workspace apps this User can access:'}
        </Typography>

        <FormGroup sx={{ gap: 0.5 }}>
          {keys.map((key) => {
            const label = isAdmin
              ? ADMIN_LABELS[key] || key
              : USER_LABELS[key] || key;
            return (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={values[key] || false}
                    disabled={key === 'complaints' && isSuperAdmin}
                    onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                    sx={{
                      color: '#D4A34E',
                      '&.Mui-checked': {
                        color: '#9E7432',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#3A230B', fontSize: '0.8125rem' }}>
                    {label}
                  </Typography>
                }
                sx={{
                  m: 0,
                  p: 0.5,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.08)' },
                }}
              />
            );
          })}
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #E2D3BE' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, color: '#583714' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            onSubmit(
              isAdmin
                ? { ...values, customers: Boolean(values.salespersonTracking), attendance: Boolean(values.salespersonTracking) }
                : values
            )
          }
          disabled={submitting}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
            color: '#3A230B',
            borderRadius: '10px',
            px: 2.5,
            boxShadow: '0 2px 8px rgba(88, 55, 20, 0.25)',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
            },
          }}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
