import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CameraFileInput from '../../components/common/CameraFileInput';
import { VISIT_STATUS } from '../../utils/constants';

export default function VisitDetailCheckOutActions({
  canCheckOut,
  status,
  proximity,
  distance,
  isInitial,
  isOutOfRange,
  radius,
  busy,
  readingLoc,
  remark,
  setRemark,
  outOfRangeReason,
  setOutOfRangeReason,
  onCheckOut,
}) {
  if (!canCheckOut) return null;

  return (
    <Stack spacing={2}>
      <CheckOutProximityAlert proximity={proximity} isOutOfRange={isOutOfRange} distance={distance} radius={radius} isInitial={isInitial} />
      <TextField
        required
        autoFocus
        label="Visit Remark / Meeting Outcome"
        placeholder="e.g. Discussed catalog, customer agreed to order 50 units next Monday"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        multiline
        minRows={3}
        fullWidth
        helperText="Mandatory remark required for check-out"
      />
      {!isOutOfRange ? (
        <CheckOutButton busy={busy} readingLoc={readingLoc} disabled={!remark.trim()} status={status} onFile={onCheckOut} variant="normal" />
      ) : (
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Reason for out-of-location check-out (optional)"
            placeholder="e.g. Met at gate / GPS drift"
            value={outOfRangeReason}
            onChange={(e) => setOutOfRangeReason(e.target.value)}
            fullWidth
          />
          <CheckOutButton
            busy={busy}
            readingLoc={readingLoc}
            disabled={!remark.trim()}
            status={status}
            onFile={(file) => onCheckOut(file, { proceedAnyway: true, explanation: outOfRangeReason })}
            variant="warning"
          />
        </Stack>
      )}
      {!remark.trim() ? (
        <Typography variant="caption" color="error.main" align="center">
          Type your remark above to enable the check-out button
        </Typography>
      ) : null}
    </Stack>
  );
}

function CheckOutProximityAlert({ proximity, isOutOfRange, distance, radius, isInitial }) {
  if (proximity?.error) {
    return <Alert severity="warning" sx={{ borderRadius: '8px' }}>{proximity.error}</Alert>;
  }
  if (isOutOfRange) {
    return (
      <Alert severity="warning" sx={{ borderRadius: '8px' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Outside visit location ({Math.round(distance)}m away)
        </Typography>
        <Typography variant="body2">
          Check-out must be within {radius}m of the customer address. Move closer, or Proceed Anyway for admin approval.
        </Typography>
      </Alert>
    );
  }
  if (distance != null && !isInitial) {
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ borderRadius: '8px' }}>
        Within allowed location (<strong>{Math.round(distance)}m</strong> · limit {radius}m).
      </Alert>
    );
  }
  return null;
}

function CheckOutButton({ busy, readingLoc, disabled, status, onFile, variant }) {
  const label = busy
    ? readingLoc ? 'Reading GPS…' : variant === 'warning' ? 'Submitting…' : 'Checking out…'
    : 'Click Picture & Check Out';

  return (
    <Button
      component="label"
      variant="contained"
      color={variant === 'warning' ? 'warning' : status === VISIT_STATUS.PENDING_APPROVAL ? 'warning' : 'success'}
      size="large"
      disabled={busy || disabled}
      startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
      sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
    >
      {label}
      <CameraFileInput capture="environment" onFile={onFile} />
    </Button>
  );
}