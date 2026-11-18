import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function ExpenseDayTotalSection({
  draft,
  isAdmin,
  itemsLength,
  liveTotalKm,
  dayTotalAmount,
  expenseDayTotalRaw,
  onDayTotalChange,
}) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Day total expense</Typography>
        <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8125rem' }}>
          One amount for all {itemsLength} visits today ({liveTotalKm || 0} km travelled).
        </Typography>
        {draft && !isAdmin ? (
          <TextField
            size="small"
            type="number"
            label="Total amount ₹"
            value={expenseDayTotalRaw || ''}
            onChange={(e) => onDayTotalChange(e.target.value)}
            sx={{ maxWidth: 220 }}
          />
        ) : (
          <Typography sx={{ fontWeight: 700 }}>₹{dayTotalAmount.toLocaleString('en-IN')}</Typography>
        )}
      </CardContent>
    </Card>
  );
}