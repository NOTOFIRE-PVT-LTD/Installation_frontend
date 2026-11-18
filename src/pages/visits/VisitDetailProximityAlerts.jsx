import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function VisitDetailProximityAlerts({ canCheckIn, proximity, distance, within, isInitial, radius }) {
  if (!canCheckIn) return null;

  if (proximity?.error) {
    return <Alert severity="warning" sx={{ borderRadius: '8px' }}>{proximity.error}</Alert>;
  }
  if (isInitial) {
    return (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        <strong>First Visit:</strong> Customer coordinates will be registered at your current GPS location upon check-in.
      </Alert>
    );
  }
  if (distance == null) return null;

  if (within) {
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ borderRadius: '8px' }}>
        You are within the allowed location (<strong>{Math.round(distance)} meters</strong> away).
      </Alert>
    );
  }

  return (
    <Alert severity="warning" sx={{ borderRadius: '8px' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        📍 Outside Customer Location ({Math.round(distance)} meters away)
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Allowed radius is {radius} meters. If you are meeting nearby (e.g. coffee shop, client gate) or experiencing GPS drift, you can <strong>Proceed Anyway</strong>.
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Your exact GPS coordinates and photo will be logged, and this visit will be submitted as <strong>Pending Admin Approval</strong>.
      </Typography>
    </Alert>
  );
}