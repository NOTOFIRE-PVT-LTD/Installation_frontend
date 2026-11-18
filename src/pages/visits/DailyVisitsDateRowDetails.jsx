import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { formatDateDisplay } from './dailyVisitsSummaryHelpers';
import DailyVisitsSummaryVisitCard from './DailyVisitsSummaryVisitCard';
import DailyVisitsDateRowExpenseBlock from './DailyVisitsDateRowExpenseBlock';

export default function DailyVisitsDateRowDetails({ row, isOpen, isToday, onPhotoClick, onNavigate }) {
  const hasVisits = row.visits?.length > 0;

  return (
    <TableRow sx={{ bgcolor: isToday ? '#FFFBF5' : '#FCFAFA' }}>
      <TableCell colSpan={6} sx={{ py: 0, px: { xs: 1, sm: 3 } }}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.dark' }}>
                  Customer Visits on {formatDateDisplay(row.date)} ({row.totalVisits})
                </Typography>
                {hasVisits ? (
                  <Stack spacing={1.5}>
                    {row.visits.map((v, index) => (
                      <DailyVisitsSummaryVisitCard
                        key={v._id}
                        visit={v}
                        index={index}
                        onPhotoClick={onPhotoClick}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No customer visits scheduled for this date.
                  </Typography>
                )}
              </div>
              <DailyVisitsDateRowExpenseBlock row={row} isToday={isToday} onNavigate={onNavigate} />
            </Stack>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}