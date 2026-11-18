import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { VISIT_STATUS } from '../../utils/constants';
import { formatPlanTime } from '../../utils/readLocation';
import { visitStatusColor } from './dailyVisitsSummaryHelpers';
import DailyVisitsSummaryVisitCheckBox from './DailyVisitsSummaryVisitCheckBox';

export default function DailyVisitsSummaryVisitCard({ visit, index, onPhotoClick, onNavigate }) {
  const isPending = visit.status === VISIT_STATUS.PENDING_APPROVAL;
  const isMissed = visit.status === VISIT_STATUS.APPROVED_MISSED || (isPending && !visit.checkInAt);

  return (
    <Card variant="outlined" sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2 } }}>
      <Stack spacing={1.5}>
        <VisitCardHeader visit={visit} index={index} isPending={isPending} />
        <Typography variant="body2" color="text.secondary">
          <strong>Purpose:</strong> {visit.purpose}
          {visit.customer?.address ? ` · Location: ${visit.customer.address}` : ''}
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <DailyVisitsSummaryVisitCheckBox
            title="Check-In Details"
            titleColor="primary.main"
            visit={visit}
            kind="in"
            isMissed={isMissed}
            onPhotoClick={onPhotoClick}
          />
          <DailyVisitsSummaryVisitCheckBox
            title="Check-Out Details"
            titleColor="success.main"
            visit={visit}
            kind="out"
            isMissed={isMissed}
            onPhotoClick={onPhotoClick}
          />
        </Stack>

        {visit.outcomeNotes ? <VisitOutcomeNotes text={visit.outcomeNotes} /> : null}
        {visit.missedReason || visit.missedExplanation ? (
          <VisitMissedNotes reason={visit.missedReason} explanation={visit.missedExplanation} />
        ) : null}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
          <Button size="small" variant="text" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate(`/visits/${visit._id}`)} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
            Open Full Visit Record
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}

function VisitCardHeader({ visit, index, isPending }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip size="small" label={`Visit #${index + 1}`} color={visitStatusColor(visit.status)} sx={{ fontWeight: 700, height: 22 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {visit.customer?.companyName || 'Customer'}
        </Typography>
        {visit.customer?.city ? (
          <Typography variant="caption" color="text.secondary">
            ({visit.customer.city})
          </Typography>
        ) : null}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''}
        </Typography>
        <Chip
          size="small"
          label={isPending ? 'PENDING APPROVAL' : visit.status.replaceAll('_', ' ')}
          color={visitStatusColor(visit.status)}
          variant="outlined"
          sx={{ fontWeight: 700, height: 22, fontSize: '0.6875rem' }}
        />
      </Stack>
    </Stack>
  );
}

function VisitOutcomeNotes({ text }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: '#FFF8F8', borderLeft: '3px solid', borderColor: 'primary.main' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
        Meeting Remark / Outcome:
      </Typography>
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#1E293B', mt: 0.25 }}>
        "{text}"
      </Typography>
    </Box>
  );
}

function VisitMissedNotes({ reason, explanation }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: '#FFFBEB', borderLeft: '3px solid', borderColor: '#F59E0B' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#B45309', display: 'block' }}>
        Exception / Missed Details:
      </Typography>
      <Typography variant="body2" sx={{ color: '#92400E', mt: 0.25 }}>
        {reason} {explanation ? `— "${explanation}"` : ''}
      </Typography>
    </Box>
  );
}