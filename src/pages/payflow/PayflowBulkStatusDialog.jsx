import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { BULK_STATUS_ACTIONS, buildBulkButtonSx, formatInr, partitionBulkSelection } from './payflowRequestConfig';

function formatSrList(rows) {
  return rows.map((r) => `#${r.srNo}`).join(', ');
}

function SkippedNotice({ skipped, targetStatus }) {
  if (!skipped.length) return null;
  const noun = skipped.length === 1 ? 'request' : 'requests';
  return (
    <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
      {skipped.length} selected {noun} ({formatSrList(skipped)}) cannot move to <b>{targetStatus}</b> and will be skipped.
    </Alert>
  );
}

function DialogBody({ eligible, skipped, action, remark, onRemarkChange }) {
  const totalAmount = eligible.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const noun = eligible.length === 1 ? 'payment request' : 'payment requests';
  return (
    <DialogContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <b>{eligible.length}</b> {noun} ({formatInr(totalAmount)}) will be marked as <b>{action.status}</b>.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        SR No: {formatSrList(eligible)}
      </Typography>
      <SkippedNotice skipped={skipped} targetStatus={action.status} />
      <TextField
        autoFocus
        fullWidth
        multiline
        minRows={2}
        size="small"
        label={action.needsRemark ? 'Remark (required)' : 'Remark (optional)'}
        value={remark}
        onChange={(e) => onRemarkChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 500 } }}
      />
    </DialogContent>
  );
}

export default function PayflowBulkStatusDialog({
  status,
  selectedRows,
  remark,
  saving,
  onRemarkChange,
  onConfirm,
  onClose,
}) {
  const action = BULK_STATUS_ACTIONS.find((a) => a.status === status);
  if (!action) return null;

  const { eligible, skipped } = partitionBulkSelection(selectedRows, status);
  const confirmDisabled = saving || eligible.length === 0 || (action.needsRemark && !remark.trim());

  return (
    <Dialog open={Boolean(status)} onClose={() => !saving && onClose()} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {action.label} ({eligible.length})?
      </DialogTitle>
      <DialogBody eligible={eligible} skipped={skipped} action={action} remark={remark} onRemarkChange={onRemarkChange} />
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => onConfirm(eligible.map((r) => r._id))}
          disabled={confirmDisabled}
          sx={buildBulkButtonSx(action)}
        >
          {saving ? 'Updating…' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
