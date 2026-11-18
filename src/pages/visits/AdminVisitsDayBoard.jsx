import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AdminVisitsDayBoardFilters from './AdminVisitsDayBoardFilters';
import AdminVisitsDayBoardDayRow from './AdminVisitsDayBoardDayRow';
import { formatDateLabel } from './adminVisitsDayBoardHelpers';
import { useAdminVisitsDayBoard } from './useAdminVisitsDayBoard';

export default function AdminVisitsDayBoard({ onPlanVisit }) {
  const {
    today,
    from,
    setFrom,
    to,
    setTo,
    loading,
    load,
    days,
    onVisitToday,
    openDays,
    toggleDay,
    applyToday,
  } = useAdminVisitsDayBoard();

  return (
    <Box>
      <AdminVisitsDayBoardFilters
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onApplyToday={applyToday}
        onApply={load}
        onPlanVisit={onPlanVisit}
        onVisitToday={onVisitToday}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} sx={{ color: '#D4A34E' }} />
        </Box>
      ) : days.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 3, textAlign: 'center', borderRadius: '14px', border: '1px solid #E2D3BE' }}
        >
          <Typography sx={{ color: '#6E4D27', fontWeight: 600 }}>
            No visits found for{' '}
            {from === to ? formatDateLabel(from) : `${formatDateLabel(from)} → ${formatDateLabel(to)}`}.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {days.map(({ date, items, names }) => (
            <AdminVisitsDayBoardDayRow
              key={date}
              date={date}
              items={items}
              names={names}
              today={today}
              open={openDays.has(date)}
              onToggle={() => toggleDay(date)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}