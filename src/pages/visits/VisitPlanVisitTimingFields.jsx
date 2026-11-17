import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { visitPlanFieldSx } from './visitPlanMuiSx';
import { computeDuration } from './visitPlanHelpers';

function durationChipSx(duration) {
  const invalid = duration.includes('End must');
  return {
    fontWeight: 700,
    height: 34,
    px: 1,
    borderRadius: '8px',
    bgcolor: invalid ? '#fee2e2' : 'rgba(255, 233, 151, 0.3)',
    color: invalid ? '#b91c1c' : '#583714',
    border: invalid ? '1px solid #fca5a5' : '1px solid rgba(212, 163, 78, 0.4)',
    whiteSpace: 'nowrap',
  };
}

export default function VisitPlanVisitTimingFields({ item, pageLayout, onUpdate }) {
  const duration = computeDuration(item.plannedTime, item.endTime);
  const direction = pageLayout ? { xs: 'column', sm: 'row' } : 'row';

  return (
    <Stack direction={direction} spacing={1.5} alignItems="center">
      <TextField
        size="small"
        label="From Time"
        type="time"
        value={item.plannedTime}
        onChange={(e) => onUpdate('plannedTime', e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        sx={visitPlanFieldSx}
      />
      <TextField
        size="small"
        label="To Time"
        type="time"
        value={item.endTime}
        onChange={(e) => onUpdate('endTime', e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        sx={visitPlanFieldSx}
      />
      {duration ? <Chip size="small" label={duration} sx={durationChipSx(duration)} /> : null}
    </Stack>
  );
}