import Chip from '@mui/material/Chip';

const COLOR_MAP = {
  active: 'success',
  inactive: 'default',
  'Not Started': 'default',
  'In Progress': 'info',
  'Installation In Progress': 'info',
  'Installed – Pending Commissioning': 'default',
  Commissioned: 'info',
  'Claim Pending Approval': 'warning',
  'Claim Approved': 'info',
  Completed: 'success',
  'On Hold': 'warning',
  Overdue: 'error',
  Pending: 'warning',
  Verified: 'success',
  Approved: 'info',
  Paid: 'success',
  Passed: 'success',
  Failed: 'error',
  'Not Submitted': 'default',
  'Pending Approval': 'warning',
  Rejected: 'error',
  'Claim Rejected': 'error',
  Delayed: 'error',
};

export default function StatusBadge({ status }) {
  return <Chip label={status} color={COLOR_MAP[status] || 'default'} size="small" sx={{ fontWeight: 600 }} />;
}
