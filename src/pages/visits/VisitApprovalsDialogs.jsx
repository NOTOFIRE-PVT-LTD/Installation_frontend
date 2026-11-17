import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function VisitApprovalsDialogs({
  approveRow,
  rejectRow,
  rejectionReason,
  busy,
  onCloseApprove,
  onCloseReject,
  onRejectionReasonChange,
  onConfirmApprove,
  onConfirmReject,
}) {
  const isApproveOutOfRange = approveRow?.kind === 'OUT_OF_RANGE';

  return (
    <>
      <ConfirmDialog
        open={Boolean(approveRow)}
        title={isApproveOutOfRange ? 'Approve Out-of-Range Visit' : 'Approve Missed Visit'}
        message={
          isApproveOutOfRange
            ? 'This approves the location exception for this visit. The visit will be verified and marked as Completed.'
            : 'This keeps the original plan and records the missed reason. It will not mark the visit completed.'
        }
        confirmLabel="Approve"
        onClose={onCloseApprove}
        onConfirm={onConfirmApprove}
        loading={busy}
      />
      <Dialog open={Boolean(rejectRow)} onClose={onCloseReject} maxWidth="xs" fullWidth>
        <DialogTitle>Reject visit request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseReject}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy || !rejectionReason.trim()}
            onClick={onConfirmReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}