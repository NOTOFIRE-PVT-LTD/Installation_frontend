import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import { adminVisitsDayBoardFieldSx } from './adminVisitsDayBoardHelpers';
import AdminVisitsDayBoardTodayChips from './AdminVisitsDayBoardTodayChips';

export default function AdminVisitsDayBoardFilters({
  from,
  to,
  onFromChange,
  onToChange,
  onApplyToday,
  onApply,
  onPlanVisit,
  onVisitToday,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        mb: 2,
        borderRadius: '14px',
        border: '1.5px solid #D4A34E',
        bgcolor: '#FFFDF8',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          size="small"
          type="date"
          label="From"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={adminVisitsDayBoardFieldSx}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={adminVisitsDayBoardFieldSx}
        />
        <Button
          variant="outlined"
          onClick={onApplyToday}
          sx={{ textTransform: 'none', fontWeight: 700, color: '#583714', borderColor: '#D4A34E' }}
        >
          Today
        </Button>
        <Button variant="contained" onClick={onApply} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Apply
        </Button>
        {onPlanVisit ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onPlanVisit}
            sx={{ textTransform: 'none', fontWeight: 700, ml: { sm: 'auto' } }}
          >
            Plan Visits
          </Button>
        ) : null}
      </Stack>
      <AdminVisitsDayBoardTodayChips onVisitToday={onVisitToday} />
    </Paper>
  );
}