import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { visitPlanFieldSx, visitPlanScopeToggleSx } from './visitPlanMuiSx';

export default function VisitPlanScopeControls({
  compact,
  pageLayout,
  scope,
  planDate,
  weekStart,
  onScopeChange,
  onPlanDateChange,
  onWeekStartChange,
}) {
  const boxSx = compact
    ? {
        p: 1.75,
        mb: 2,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #D4A34E',
        boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }
    : {
        p: 2,
        mb: 3,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #D4A34E',
        boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      };

  return (
    <Box sx={boxSx}>
      <ToggleButtonGroup
        size="small"
        value={scope}
        exclusive
        onChange={onScopeChange}
        sx={{
          ...visitPlanScopeToggleSx,
          ...(pageLayout
            ? { '& .MuiToggleButton-root': { ...visitPlanScopeToggleSx['& .MuiToggleButton-root'], px: 2.5 } }
            : {}),
        }}
      >
        <ToggleButton value="day">Single Day</ToggleButton>
        <ToggleButton value="week">Whole Week</ToggleButton>
      </ToggleButtonGroup>
      {scope === 'day' ? (
        <TextField
          size="small"
          label="Plan Date"
          type="date"
          value={planDate}
          onChange={(e) => onPlanDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: { xs: '100%', sm: 180 },
            ...visitPlanFieldSx,
          }}
        />
      ) : (
        <TextField
          size="small"
          label="Week Start (Monday)"
          type="date"
          value={weekStart}
          onChange={(e) => onWeekStartChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: { xs: '100%', sm: 200 },
            ...visitPlanFieldSx,
          }}
        />
      )}
    </Box>
  );
}