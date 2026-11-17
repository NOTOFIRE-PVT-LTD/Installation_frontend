import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function VisitDayProgressAlert({ day, selected, submitted, onOpenExpense }) {
  return (
    <Alert
      severity={submitted ? 'success' : selected.length && day.remaining === 0 ? 'success' : 'info'}
      sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
      >
        <div>
          <strong>Status: {submitted ? 'Day Completed & Submitted' : 'In Progress'}</strong> · {selected.length} visits
          selected · {day.completed} completed · {day.remaining} remaining
          {day.totalKm ? ` · Total travel ${day.totalKm} km` : ''}
        </div>
        {submitted && day.expense?._id && (
          <Button
            size="small"
            variant="contained"
            startIcon={<ReceiptLongIcon />}
            onClick={onOpenExpense}
            sx={{ alignSelf: 'flex-start' }}
          >
            View Expenses
          </Button>
        )}
      </Stack>
    </Alert>
  );
}