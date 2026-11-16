import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { formatPlanTime } from '../../utils/readLocation';

export default function VisitDayPlannedVisitOption({ visit, checked, disabled, onToggle }) {
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} disabled={disabled} onChange={onToggle} />}
      label={
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {visit.customer?.companyName || 'Customer'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatPlanTime(visit.plannedTime)}
            {visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · {visit.purpose}
            {visit.customer?.city ? ` · ${visit.customer.city}` : ''}
          </Typography>
        </Box>
      }
    />
  );
}