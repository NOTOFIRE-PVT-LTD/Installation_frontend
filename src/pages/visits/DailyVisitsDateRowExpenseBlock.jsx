import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { formatDateDisplay, expenseStatusColor } from './dailyVisitsSummaryHelpers';

export default function DailyVisitsDateRowExpenseBlock({ row, isToday, onNavigate }) {
  const exp = row.expense;

  return (
    <Card variant="outlined" sx={{ borderRadius: '16px', p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
        <div>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Travel Expense Claim ({formatDateDisplay(row.date)})
            </Typography>
            {exp ? (
              <Chip size="small" label={exp.status} color={expenseStatusColor(exp.status)} sx={{ fontWeight: 700, height: 20, fontSize: '0.6875rem' }} />
            ) : null}
          </Stack>
          {exp ? (
            <Typography variant="body2" color="text.secondary">
              Claimed: <strong>₹{Number(exp.totalAmount || 0).toLocaleString('en-IN')}</strong> · Travel:{' '}
              <strong>{exp.totalKm || 0} km</strong> ({exp.itemCount || 0} legs)
              {exp.adminComment ? ` · Note: "${exp.adminComment}"` : ''}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No expense form has been created for this day yet.
            </Typography>
          )}
        </div>
        <ExpenseBlockAction exp={exp} isToday={isToday} onNavigate={onNavigate} />
      </Stack>
    </Card>
  );
}

function ExpenseBlockAction({ exp, isToday, onNavigate }) {
  if (exp?._id) {
    return (
      <Button
        size="small"
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={() => onNavigate(`/expenses/${exp._id}`)}
        sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
      >
        Open Expense Claim
      </Button>
    );
  }
  if (isToday) {
    return (
      <Button
        size="small"
        variant="outlined"
        onClick={() => onNavigate('/visits/today')}
        sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
      >
        Complete Day in Today's Visits
      </Button>
    );
  }
  return null;
}