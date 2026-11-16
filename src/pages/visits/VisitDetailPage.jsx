import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../components/common/PageHeader';
import MissedVisitDialog from './MissedVisitDialog';
import { useVisitDetailPage } from './useVisitDetailPage';
import { getVisitDetailCapabilities } from './visitDetailCapabilities';
import VisitDetailOverview from './VisitDetailOverview';
import VisitDetailProximityAlerts from './VisitDetailProximityAlerts';
import VisitDetailCheckInActions from './VisitDetailCheckInActions';
import VisitDetailCheckOutActions from './VisitDetailCheckOutActions';

export default function VisitDetailPage() {
  const state = useVisitDetailPage();
  const { visit, proximity, isSalesperson, navigate } = state;

  if (!visit) return null;

  const caps = getVisitDetailCapabilities(visit, proximity, isSalesperson);

  return (
    <>
      <PageHeader
        title={visit.customer?.companyName || 'Customer Visit'}
        subtitle={`Purpose: ${visit.purpose}`}
        actions={
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate(isSalesperson ? '/visits/today' : '/visits')}
          >
            Back to Today's Visits
          </Button>
        }
      />

      <Card sx={{ maxWidth: 640, mx: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <VisitDetailOverview visit={visit} status={caps.status} />
            <VisitDetailProximityAlerts
              canCheckIn={caps.canCheckIn}
              proximity={proximity}
              distance={caps.distance}
              within={caps.within}
              isInitial={caps.isInitial}
              radius={caps.radius}
            />
            <VisitDetailCheckInActions
              canCheckIn={caps.canCheckIn}
              isOutOfRange={caps.isOutOfRange}
              busy={state.busy}
              readingLoc={state.readingLoc}
              outOfRangeReason={state.outOfRangeReason}
              setOutOfRangeReason={state.setOutOfRangeReason}
              onCheckIn={state.handleCheckInWithPhoto}
            />
            <VisitDetailCheckOutActions
              canCheckOut={caps.canCheckOut}
              status={caps.status}
              proximity={proximity}
              distance={caps.distance}
              isInitial={caps.isInitial}
              isOutOfRange={caps.isOutOfRange}
              radius={caps.radius}
              busy={state.busy}
              readingLoc={state.readingLoc}
              remark={state.remark}
              setRemark={state.setRemark}
              outOfRangeReason={state.outOfRangeReason}
              setOutOfRangeReason={state.setOutOfRangeReason}
              onCheckOut={state.handleCheckOutWithPhoto}
            />
            {caps.canMiss ? (
              <Button color="warning" variant="outlined" disabled={state.busy} onClick={() => state.setMissOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                Mark as Missed Visit
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <MissedVisitDialog open={state.missOpen} onClose={() => state.setMissOpen(false)} onSubmit={state.submitMissed} submitting={state.busy} />
    </>
  );
}