import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { PRIVATE_KM_RATE, TRANSPORT_MODE } from '../../utils/constants';
import ExpenseVisitTransportFields from './ExpenseVisitTransportFields';
import ExpenseVisitTicketActions from './ExpenseVisitTicketActions';

export default function ExpensePerVisitItemCard({ row, index, draft, onPatchItem, onUploadTicket }) {
  const visit = row.visit || {};
  const privateMode = row.transportMode === TRANSPORT_MODE.PRIVATE;

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700 }}>
          Visit {index + 1} — {visit.customer?.companyName || 'Visit'}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1 }}>
          Travel {row.distanceKm || 0} km
          {privateMode ? ` · ₹${PRIVATE_KM_RATE}/km` : ''}
        </Typography>
        <ExpenseVisitTransportFields row={row} draft={draft} privateMode={privateMode} onPatchItem={onPatchItem} />
        <ExpenseVisitTicketActions
          row={row}
          draft={draft}
          privateMode={privateMode}
          onUploadTicket={onUploadTicket}
        />
      </CardContent>
    </Card>
  );
}