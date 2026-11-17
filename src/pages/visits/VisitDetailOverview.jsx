import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { VISIT_STATUS } from '../../utils/constants';
import { formatPlanTime } from '../../utils/readLocation';

export default function VisitDetailOverview({ visit, status }) {
  return (
  <>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Chip
        label={status === VISIT_STATUS.PENDING_APPROVAL ? 'PENDING ADMIN APPROVAL' : status.replaceAll('_', ' ')}
        color={
          status === VISIT_STATUS.COMPLETED ? 'success' : status === VISIT_STATUS.IN_PROGRESS ? 'info' : status === VISIT_STATUS.PENDING_APPROVAL ? 'warning' : 'default'
        }
        sx={{ fontWeight: 700 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · {visit.visitDate}
      </Typography>
    </Stack>

    <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {visit.customer?.companyName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {visit.customer?.contactPerson ? `Contact: ${visit.customer.contactPerson} · ` : ''}
        {visit.customer?.phone || ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {visit.customer?.address || visit.customer?.city || ''}
        {visit.customer?.state ? `, ${visit.customer.state}` : ''}
      </Typography>
    </Box>

    {visit.checkInAt ? <VisitCheckInSummary visit={visit} radius={visit.allowedRadiusMeters || 100} /> : null}
    {visit.checkOutAt ? <VisitCheckOutSummary visit={visit} /> : null}
    {status === VISIT_STATUS.PENDING_APPROVAL ? <VisitPendingApprovalAlert visit={visit} /> : null}
    {status === VISIT_STATUS.COMPLETED ? <Alert severity="success" sx={{ borderRadius: '8px' }}>Visit completed successfully!</Alert> : null}
    {status === VISIT_STATUS.APPROVED_MISSED ? (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>Visit approved as missed ({visit.missedReason}).</Alert>
    ) : null}
  </>
  );
}

function VisitCheckInSummary({ visit, radius }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
        ✓ Checked In: {new Date(visit.checkInAt).toLocaleTimeString()}
        {visit.checkInDistanceM != null && visit.checkInDistanceM > radius ? ` (${visit.checkInDistanceM}m away)` : ''}
      </Typography>
      {visit.checkInAddress ? (
        <Typography variant="caption" color="text.secondary">{visit.checkInAddress}</Typography>
      ) : null}
      {visit.checkInPhotoUrl ? (
        <Box component="img" src={visit.checkInPhotoUrl} alt="Check-in photo" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', mt: 1 }} />
      ) : null}
    </Box>
  );
}

function VisitCheckOutSummary({ visit }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
        ✓ Checked Out: {new Date(visit.checkOutAt).toLocaleTimeString()}
      </Typography>
      {visit.visitDurationMin != null ? (
        <Typography variant="body2">
          Duration: {visit.visitDurationMin} mins {visit.travelKm != null ? `· Travel: ${visit.travelKm} km` : ''}
        </Typography>
      ) : null}
      {visit.outcomeNotes ? (
        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>Remark: {visit.outcomeNotes}</Typography>
      ) : null}
      {visit.checkOutPhotoUrl ? (
        <Box component="img" src={visit.checkOutPhotoUrl} alt="Check-out photo" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', mt: 1 }} />
      ) : null}
    </Box>
  );
}

function VisitPendingApprovalAlert({ visit }) {
  return (
    <Alert severity="warning" sx={{ borderRadius: '8px' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>⏳ Pending Admin Approval</Typography>
      <Typography variant="body2">
        {visit.checkOutAt
          ? 'Visit is completed and submitted for Admin approval due to location exception.'
          : 'Check-in was recorded outside the allowed customer location. It has been submitted to your Admin for approval. You can proceed with your meeting and check out below when done.'}
      </Typography>
      {visit.missedExplanation ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Note: {visit.missedExplanation}
        </Typography>
      ) : null}
    </Alert>
  );
}