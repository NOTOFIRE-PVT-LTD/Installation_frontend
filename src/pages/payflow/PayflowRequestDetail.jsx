import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import {
  ACTION_ORDER,
  PRIORITY_STYLES,
  REQUEST_STATUS_STYLES,
  STATUS_ACTIONS,
  formatInr,
} from './payflowRequestConfig';

const fmtDate = (d, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', opts) : '—';

export function StatusPill({ status }) {
  const style = REQUEST_STATUS_STYLES[status] || REQUEST_STATUS_STYLES.Postponed;
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, height: 22, fontSize: '0.72rem' }}
    />
  );
}

function Row({ label, value, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={strong ? { fontWeight: 700, color: 'text.primary' } : undefined}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 600, textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
      {children}
    </Typography>
  );
}

export default function PayflowRequestDetail({ requestId, onBack, onChanged }) {
  const dispatch = useAppDispatch();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowRequestApi.get(requestId);
      setRequest(data.data);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load payment request', severity: 'error' }));
      onBack();
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (status) => {
    setRemark('');
    setPendingStatus(status);
  };

  const confirmStatus = async () => {
    setSaving(true);
    try {
      const { data } = await payflowRequestApi.changeStatus(requestId, { status: pendingStatus, remark });
      setRequest(data.data);
      dispatch(showSnackbar({ message: data.message }));
      setPendingStatus(null);
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !request) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!request) return null;

  const priority = PRIORITY_STYLES[request.priority] || PRIORITY_STYLES.Medium;
  const balance = Math.max((request.totalOutstanding || 0) - (request.amount || 0), 0);
  const actions = ACTION_ORDER.filter((s) => request.allowedStatuses?.includes(s));
  const pendingAction = pendingStatus ? STATUS_ACTIONS[pendingStatus] : null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
        <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={onBack} sx={{ fontWeight: 600 }}>
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Payment Details
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, maxWidth: 900 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Box>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2 }}>{request.vendor}</Typography>
            <Box sx={{ mt: 0.75 }}>
              <StatusPill status={request.status} />
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                SR No. {request.srNo}
              </Typography>
            </Box>
          </Box>
          <Stack alignItems="flex-end" spacing={0.75}>
            <Chip label={`${request.priority} Priority`} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 700 }} />
            <Typography variant="body2" color="text.secondary">
              {fmtDate(request.requestDate, { month: 'short', day: '2-digit', year: 'numeric' })}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <SectionTitle>Item Description</SectionTitle>
        <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 1.5, mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {request.description || '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box>
            <SectionTitle>Payment Details</SectionTitle>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 1.5 }}>
              <Row label="Vendor Name:" value={request.vendor} />
              <Row label="Category:" value={request.category} />
              <Row label="Subcategory:" value={request.subcategory} />
              <Row label="Item Type:" value={request.itemType} />
              <Row label="Company/Branch:" value={`${request.company}, ${request.branch}`} />
              <Row label="Total Outstanding:" value={formatInr(request.totalOutstanding)} />
              <Row label="Pay Against:" value={request.payAgainst} />
              <Row label="Bank Name:" value={request.bankName} />
              <Row label="Payment Mode:" value={request.paymentMode} />
              <Row label="Payment Amount:" value={formatInr(request.amount)} strong />
              <Divider sx={{ my: 0.75 }} />
              <Row label="Balance Amount:" value={formatInr(balance)} />
            </Box>
          </Box>
          <Box>
            <SectionTitle>Bill Information</SectionTitle>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 1.5 }}>
              <Row label="Bill Number:" value={request.billNumber} />
              <Row label="Bill Date:" value={request.billDate ? fmtDate(request.billDate) : '—'} />
            </Box>
          </Box>
        </Box>

        {request.priceCheckBy?.name && (
          <Box sx={{ mt: 3 }}>
            <SectionTitle>Additional Details</SectionTitle>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
              <Paper sx={{ p: 2, borderRadius: 2, maxWidth: 320 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Price Check Guaranteed By
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{request.priceCheckBy.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.priceCheckBy.email}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <SectionTitle>Requested By</SectionTitle>
        <Typography variant="body2">{request.requestedBy?.name || '—'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {request.requestedBy?.email}
        </Typography>

        {request.history?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <SectionTitle>Status History</SectionTitle>
            <Stack spacing={1}>
              {[...request.history].reverse().map((h, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="baseline" flexWrap="wrap">
                  <StatusPill status={h.to} />
                  <Typography variant="caption" color="text.secondary">
                    {fmtDate(h.at, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {h.by?.name ? ` · ${h.by.name}` : ''}
                  </Typography>
                  {h.remark && <Typography variant="body2">— {h.remark}</Typography>}
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 4 }}>
          {actions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              This request is {request.status.toLowerCase()} — no further actions available.
            </Typography>
          ) : (
            actions.map((s) => {
              const a = STATUS_ACTIONS[s];
              return (
                <Button
                  key={s}
                  variant="contained"
                  disableElevation
                  onClick={() => openAction(s)}
                  sx={{ bgcolor: a.color, color: a.textColor || '#fff', fontWeight: 600, '&:hover': { bgcolor: a.color, filter: 'brightness(0.92)' } }}
                >
                  {a.label}
                </Button>
              );
            })
          )}
        </Stack>
      </Paper>

      <Dialog open={Boolean(pendingStatus)} onClose={() => !saving && setPendingStatus(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {pendingAction?.label} request #{request.srNo}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Status will change from <b>{request.status}</b> to <b>{pendingStatus}</b>.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            size="small"
            label={pendingAction?.needsRemark ? 'Remark (required)' : 'Remark (optional)'}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingStatus(null)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmStatus}
            disabled={saving || (pendingAction?.needsRemark && !remark.trim())}
          >
            {saving ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
