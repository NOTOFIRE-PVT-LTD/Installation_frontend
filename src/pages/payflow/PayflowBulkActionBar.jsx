import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  BULK_STATUS_ACTIONS,
  MAX_BULK_SELECTION,
  allowedSourceStatusesFor,
  buildBulkButtonSx,
  partitionBulkSelection,
} from './payflowRequestConfig';

const CLEAR_BTN_SX = {
  '&&&': {
    minHeight: '34px !important',
    padding: '6px 14px !important',
    borderRadius: '8px !important',
    fontSize: '0.8rem !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
    background: '#ffffff !important',
    color: '#1e293b !important',
    border: '1px solid #cbd5e1 !important',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05) !important',
  },
  '&&&::before': { display: 'none' },
  '&&&:hover': {
    background: '#f8fafc !important',
    borderColor: '#94a3b8 !important',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1) !important',
  },
};

function buildButtonLabel(action, eligibleCount, totalCount) {
  if (eligibleCount > 0 && eligibleCount < totalCount) return `${action.label} (${eligibleCount})`;
  return action.label;
}

function buildTooltip(action, eligibleCount, totalCount) {
  if (eligibleCount === 0) {
    const sources = allowedSourceStatusesFor(action.status).join(', ');
    return `Only ${sources} requests can be moved to ${action.status}`;
  }
  if (eligibleCount < totalCount) {
    return `${eligibleCount} of ${totalCount} selected requests can move to ${action.status}`;
  }
  return '';
}

function BulkActionButton({ action, eligibleCount, totalCount, busy, onSelect }) {
  const isDisabled = busy || eligibleCount === 0;
  const tip = buildTooltip(action, eligibleCount, totalCount);
  const btn = (
    <Button
      size="small"
      variant="contained"
      disableElevation
      disabled={isDisabled}
      onClick={() => onSelect(action.status)}
      sx={buildBulkButtonSx(action)}
    >
      {buildButtonLabel(action, eligibleCount, totalCount)}
    </Button>
  );
  return tip ? <Tooltip title={tip}><span>{btn}</span></Tooltip> : btn;
}

export default function PayflowBulkActionBar({ selectedRows, busy = false, onSelectStatus, onClear }) {
  if (!selectedRows.length) return null;
  const totalCount = selectedRows.length;
  const actions = BULK_STATUS_ACTIONS.map((action) => ({
    action,
    eligibleCount: partitionBulkSelection(selectedRows, action.status).eligible.length,
  })).filter(({ action, eligibleCount }) => action.alwaysShow || eligibleCount > 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%) !important',
        border: '1px solid #bfdbfe !important',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="baseline" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {totalCount} payment{totalCount === 1 ? '' : 's'} selected
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 500 }}>
            Max {MAX_BULK_SELECTION} selections allowed
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {actions.map(({ action, eligibleCount }) => (
            <BulkActionButton
              key={action.status}
              action={action}
              eligibleCount={eligibleCount}
              totalCount={totalCount}
              busy={busy}
              onSelect={onSelectStatus}
            />
          ))}
          <Button size="small" variant="outlined" disabled={busy} onClick={onClear} sx={CLEAR_BTN_SX}>
            Clear Selection
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
