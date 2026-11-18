import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export function VisitDaySubmitCard({ busy, onSubmitDay }) {
  return (
    <Card sx={{ mt: 3, p: 2.5, bgcolor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <div>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#166534' }}>
            🎉 All Selected Visits Completed!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit today&apos;s visits to unlock and submit your travel expense claim.
          </Typography>
        </div>
        <Button
          variant="contained"
          color="success"
          size="large"
          disabled={busy}
          endIcon={<ArrowForwardIcon />}
          onClick={onSubmitDay}
          sx={{ fontWeight: 700, px: 3, py: 1.25, borderRadius: 999 }}
        >
          {busy ? 'Submitting Day…' : 'Submit Day & Enter Expenses'}
        </Button>
      </Stack>
    </Card>
  );
}

export function VisitDaySubmittedExpenseCard({ onOpenExpense }) {
  return (
    <Card sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <div>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Today&apos;s Day Record is Submitted
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can view or update your submitted travel expenses anytime.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<ReceiptLongIcon />} onClick={onOpenExpense} sx={{ fontWeight: 700 }}>
          Open Travel Expense Form
        </Button>
      </Stack>
    </Card>
  );
}