import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CameraFileInput from '../../components/common/CameraFileInput';

export default function VisitDetailCheckInActions({
  canCheckIn,
  isOutOfRange,
  busy,
  readingLoc,
  outOfRangeReason,
  setOutOfRangeReason,
  onCheckIn,
}) {
  if (!canCheckIn) return null;

  return (
    <Stack spacing={1.5}>
      {!isOutOfRange ? (
        <CheckInButton busy={busy} readingLoc={readingLoc} onFile={onCheckIn} variant="primary" />
      ) : (
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Reason for out-of-location visit (optional)"
            placeholder="e.g. Met client at nearby cafe / GPS signal drift"
            value={outOfRangeReason}
            onChange={(e) => setOutOfRangeReason(e.target.value)}
            fullWidth
          />
          <CheckInButton
            busy={busy}
            readingLoc={readingLoc}
            onFile={(file) => onCheckIn(file, { proceedAnyway: true, explanation: outOfRangeReason })}
            variant="warning"
          />
        </Stack>
      )}
      <Typography variant="caption" color="text.secondary" align="center">
        Takes a picture of the customer/site and automatically records GPS and time
      </Typography>
    </Stack>
  );
}

function CheckInButton({ busy, readingLoc, onFile, variant }) {
  const label = busy
    ? readingLoc ? 'Reading GPS…' : variant === 'warning' ? 'Submitting…' : 'Checking in…'
  : variant === 'warning'
    ? 'Proceed Anyway & Check In (Admin Approval)'
    : 'Click Picture & Check In';

  return (
    <Button
      component="label"
      variant="contained"
      color={variant === 'warning' ? 'warning' : 'primary'}
      size="large"
      disabled={busy}
      startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
      sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
    >
      {label}
      <CameraFileInput capture="environment" onFile={onFile} />
    </Button>
  );
}