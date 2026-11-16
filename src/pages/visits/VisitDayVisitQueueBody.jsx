import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatPlanTime } from '../../utils/readLocation';

export default function VisitDayVisitQueueBody({ visit, index, isDone }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Chip
          size="small"
          color={isDone ? 'success' : 'primary'}
          label={`Visit #${index + 1}`}
          sx={{ fontWeight: 700 }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {visit.customer?.companyName}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Time: {formatPlanTime(visit.plannedTime)}
        {visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · Purpose: {visit.purpose}
      </Typography>
      {visit.customer?.address && (
        <Typography variant="caption" color="text.secondary" display="block">
          Location: {visit.customer.address} {visit.customer.city ? `(${visit.customer.city})` : ''}
        </Typography>
      )}
      {visit.checkInAt && (
        <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
          ✓ Checked in: {new Date(visit.checkInAt).toLocaleTimeString()} {visit.checkInAddress || ''}
        </Typography>
      )}
      {visit.checkOutAt && (
        <Typography variant="caption" color="success.main" display="block" sx={{ fontWeight: 600 }}>
          ✓ Checked out: {new Date(visit.checkOutAt).toLocaleTimeString()}
          {visit.travelKm != null ? ` · Travel: ${visit.travelKm} km` : ''}
          {visit.outcomeNotes ? ` · Remark: "${visit.outcomeNotes}"` : ''}
        </Typography>
      )}
    </Box>
  );
}