import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

export default function ComplaintReassignDialog({
  confirmDialog,
  setConfirmDialog,
  onConfirm,
}) {
  const handleClose = () => {
    if (confirmDialog.loading) return;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const isFirst = !confirmDialog.fromEngineerName || confirmDialog.fromEngineerName === 'Unassigned';

  return (
    <Dialog open={confirmDialog.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#241404' }}>
        {isFirst ? 'Confirm Ticket Assignment' : 'Confirm Engineer Reassignment'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="#583714">
            Ticket: <strong>{confirmDialog.ticketNo}</strong> ({confirmDialog.customerName})
          </Typography>
          <Typography variant="body2" color="#241404">
            {isFirst ? (
              <>Assign to <strong>{confirmDialog.toEngineerName}</strong>?</>
            ) : (
              <>Reassign from <strong>{confirmDialog.fromEngineerName}</strong> to <strong>{confirmDialog.toEngineerName}</strong>?</>
            )}
          </Typography>
          <TextField
            label="Reason / Remark for Reassignment"
            placeholder="e.g. Requires Railway S&T specialist on site"
            multiline
            minRows={2}
            size="small"
            value={confirmDialog.reason}
            onChange={(e) => setConfirmDialog((prev) => ({ ...prev, reason: e.target.value }))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={confirmDialog.loading} sx={{ textTransform: 'none', color: '#583714' }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={confirmDialog.loading}
          sx={{
            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)',
            color: '#3A230B',
            fontWeight: 800,
            textTransform: 'none',
          }}
        >
          {confirmDialog.loading ? <CircularProgress size={18} color="inherit" /> : 'Confirm Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
