import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpenseSummaryLines from './ExpenseSummaryLines';

export default function ExpenseSummarySection({
  expense,
  itemsLength,
  liveTotalKm,
  perVisitMode,
  privateKm,
  privateAmount,
  publicAmount,
  dayTotalAmount,
  gstAmount,
  liveTotal,
  draft,
  isAdmin,
  expenseGstRaw,
  onGstChange,
}) {
  return (
    <Card sx={{ mt: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Expense summary</Typography>
        <Typography>Date: {expense.date}</Typography>
        <Typography>Total visits: {itemsLength}</Typography>
        <Typography>Total kilometers: {liveTotalKm}</Typography>
        <ExpenseSummaryLines
          perVisitMode={perVisitMode}
          privateKm={privateKm}
          privateAmount={privateAmount}
          publicAmount={publicAmount}
          dayTotalAmount={dayTotalAmount}
        />
        {draft && !isAdmin ? (
          <TextField
            size="small"
            type="number"
            label="GST ₹ (optional)"
            value={expenseGstRaw || ''}
            onChange={(e) => onGstChange(e.target.value)}
            sx={{ mt: 1.5, maxWidth: 220 }}
          />
        ) : (
          <Typography>GST: ₹{gstAmount.toLocaleString('en-IN')}</Typography>
        )}
        <Typography sx={{ fontWeight: 700, mt: 1 }}>Grand total: ₹{liveTotal.toLocaleString('en-IN')}</Typography>
      </CardContent>
    </Card>
  );
}