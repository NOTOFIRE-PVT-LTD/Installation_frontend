import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RouteIcon from '@mui/icons-material/Route';
import { formatDateDisplay, expenseStatusColor } from './dailyVisitsSummaryHelpers';
import DailyVisitsDateRowDetails from './DailyVisitsDateRowDetails';

export default function DailyVisitsDateRow({ row, isOpen, isToday, onToggle, onPhotoClick, onNavigate }) {
  const exp = row.expense;

  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          bgcolor: isToday ? '#FFFBF5' : isOpen ? '#FCFAFA' : 'inherit',
          '& > *': { borderBottom: isOpen ? 'none !important' : undefined },
        }}
      >
        <TableCell sx={{ p: 1, textAlign: 'center' }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatDateDisplay(row.date)}
            </Typography>
            {isToday ? (
              <Chip size="small" label="Today" color="primary" sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }} />
            ) : null}
          </Stack>
        </TableCell>
        <DateRowVisitSummary row={row} />
        <DateRowTravelCell row={row} />
        <DateRowExpenseCell exp={exp} />
        <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <Button
            size="small"
            variant="text"
            endIcon={isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            sx={{ fontWeight: 700 }}
          >
            {isOpen ? 'Hide Details' : 'View Details'}
          </Button>
        </TableCell>
      </TableRow>
      <DailyVisitsDateRowDetails row={row} isOpen={isOpen} isToday={isToday} onPhotoClick={onPhotoClick} onNavigate={onNavigate} />
    </>
  );
}

function DateRowVisitSummary({ row }) {
  return (
    <TableCell>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.totalVisits} {row.totalVisits === 1 ? 'Visit' : 'Visits'}
        </Typography>
        {row.completedCount > 0 ? (
          <Chip size="small" color="success" icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />} label={`${row.completedCount} Done`} sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }} />
        ) : null}
        {row.inProgressCount > 0 ? (
          <Chip size="small" color="info" label={`${row.inProgressCount} In Progress`} sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }} />
        ) : null}
        {row.missedCount > 0 ? (
          <Chip size="small" color="warning" label={`${row.missedCount} Missed`} sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }} />
        ) : null}
      </Stack>
    </TableCell>
  );
}

function DateRowTravelCell({ row }) {
  return (
    <TableCell sx={{ whiteSpace: 'nowrap' }}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <RouteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.totalTravelKm > 0 ? `${row.totalTravelKm} km` : '—'}
        </Typography>
      </Stack>
    </TableCell>
  );
}

function DateRowExpenseCell({ exp }) {
  return (
    <TableCell sx={{ whiteSpace: 'nowrap' }}>
      {exp ? (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
            ₹{Number(exp.totalAmount || 0).toLocaleString('en-IN')}
          </Typography>
          <Chip size="small" label={exp.status} color={expenseStatusColor(exp.status)} sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }} />
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No claim filed
        </Typography>
      )}
    </TableCell>
  );
}