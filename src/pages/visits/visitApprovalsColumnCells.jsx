import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function VisitApprovalKindCell({ value }) {
  const isOutOfRange = value === 'OUT_OF_RANGE';
  return (
    <Chip
      size="small"
      label={isOutOfRange ? 'OUT OF RANGE' : value || 'MISSED'}
      color={isOutOfRange ? 'warning' : 'default'}
      sx={{ fontWeight: 700 }}
    />
  );
}

export function VisitApprovalReasonCell({ row }) {
  const dist = row.visit?.checkInDistanceM;
  return (
    <Stack spacing={0.25} sx={{ py: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {row.missedReason || (row.kind === 'OUT_OF_RANGE' ? 'Outside Location Exception' : 'Missed Visit')}
      </Typography>
      {dist != null && dist > 0 && (
        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
          📍 {dist} meters away from customer
        </Typography>
      )}
      {row.missedExplanation && (
        <Typography variant="caption" color="text.secondary">
          {row.missedExplanation}
        </Typography>
      )}
    </Stack>
  );
}

export function VisitApprovalStatusCell({ value }) {
  return (
    <Chip
      size="small"
      label={value}
      color={value === 'REJECTED' ? 'error' : 'primary'}
      variant={value === 'PENDING' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 700 }}
    />
  );
}

export function VisitApprovalViewCell({ visit, onNavigate }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {visit?.checkInPhotoUrl && (
        <Box
          component="img"
          src={visit.checkInPhotoUrl}
          alt="Selfie"
          sx={{ width: 32, height: 32, borderRadius: '4px', objectFit: 'cover' }}
        />
      )}
      {visit?._id && (
        <Button size="small" onClick={() => onNavigate(`/visits/${visit._id}`)}>
          View
        </Button>
      )}
    </Stack>
  );
}

export function VisitApprovalDecideCell({ row, onApprove, onReject }) {
  if (row.decision !== 'PENDING') {
    return <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>—</Typography>;
  }
  return (
    <Stack direction="row" spacing={0.75} onClick={(e) => e.stopPropagation()}>
      <Button size="small" variant="contained" onClick={() => onApprove(row)}>
        Approve
      </Button>
      <Button size="small" color="error" variant="outlined" onClick={() => onReject(row)}>
        Reject
      </Button>
    </Stack>
  );
}