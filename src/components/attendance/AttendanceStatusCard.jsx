import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLiveDuration } from '../../hooks/useLiveDuration';
import { placeNameFromCoords } from '../../utils/readLocation';
import {
  ATTENDANCE_PHASE,
  PHASE_LABELS,
  formatDuration,
  formatIstDate,
  formatIstTime,
} from '../../utils/attendanceFormat';

function Side({ title, action, children }) {
  return (
    <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{title}</Typography>
      {children}
      {action}
    </Stack>
  );
}

function Meta({ label, value }) {
  return (
    <Stack spacing={0.15} sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main' }}>{value || '—'}</Typography>
    </Stack>
  );
}

function PlaceName({ address, lat, lng }) {
  const [place, setPlace] = useState(address || null);
  const [tried, setTried] = useState(Boolean(address) || lat == null);
  useEffect(() => {
    if (address) {
      setPlace(address);
      setTried(true);
      return undefined;
    }
    let live = true;
    placeNameFromCoords(lat, lng).then((name) => {
      if (!live) return;
      setPlace(name);
      setTried(true);
    });
    return () => {
      live = false;
    };
  }, [address, lat, lng]);
  if (address || lat != null) return place || (tried ? 'Location unavailable' : 'Finding place…');
  return '—';
}

export default function AttendanceStatusCard({
  today,
  pending = false,
  punching = false,
  photo,
  onPhoto,
  onPunchIn,
  onPunchOut,
}) {
  const record = today?.record;
  const phase = today?.phase || (today?.canIn ? ATTENDANCE_PHASE.NOT_STARTED : today?.canOut ? ATTENDANCE_PHASE.WORKING : ATTENDANCE_PHASE.COMPLETED);
  const live = useLiveDuration(record?.punchInAt, record?.punchOutAt);
  const loading = !today;
  const dateLabel = today?.attendanceDate ? formatIstDate(today.attendanceDate) : '—';
  const canPunchIn = !loading && (phase === ATTENDANCE_PHASE.NOT_STARTED || phase === ATTENDANCE_PHASE.COMPLETED);
  const needsSelfie = canPunchIn || phase === ATTENDANCE_PHASE.WORKING;

  return (
    <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        {loading && <Typography color="text.secondary">Loading attendance…</Typography>}
        {!loading && (
          <Stack spacing={2}>
            {needsSelfie && (
              <Button component="label" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                {photo ? photo.name : 'Take selfie'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => onPhoto?.(e.target.files?.[0] || null)}
                />
              </Button>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider flexItem orientation="vertical" />}>
            <Side
              title="Punch In"
              action={
                canPunchIn ? (
                  <Button variant="contained" disabled={pending || punching || !photo} onClick={onPunchIn} sx={{ alignSelf: 'flex-start' }}>
                    {punching ? 'Punching in…' : 'Punch In'}
                  </Button>
                ) : null
              }
            >
              {record?.punchInAt ? (
                <>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Meta label="Time" value={formatIstTime(record.punchInAt)} />
                    <Meta label="Date" value={dateLabel} />
                    <Meta
                      label="Location"
                      value={
                        <PlaceName address={record.punchInAddress} lat={record.punchInLat} lng={record.punchInLng} />
                      }
                    />
                  </Stack>
                  {record.punchInPhotoUrl && (
                    <Box component="img" src={record.punchInPhotoUrl} alt="Punch in selfie" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1 }} />
                  )}
                  {phase === ATTENDANCE_PHASE.WORKING && (
                    <Chip size="small" label={`Active · ${live}`} sx={{ alignSelf: 'flex-start', fontWeight: 700 }} color="primary" />
                  )}
                </>
              ) : (
                <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  Take a selfie, then punch in to capture time and location.
                </Typography>
              )}
            </Side>
            <Side
              title="Punch Out"
              action={
                phase === ATTENDANCE_PHASE.WORKING ? (
                  <Button variant="contained" disabled={pending || punching || !photo} onClick={onPunchOut} sx={{ alignSelf: 'flex-start' }}>
                    {punching ? 'Punching out…' : 'Punch Out'}
                  </Button>
                ) : phase === ATTENDANCE_PHASE.NOT_STARTED ? (
                  <Button variant="contained" disabled sx={{ alignSelf: 'flex-start' }}>
                    Punch Out
                  </Button>
                ) : null
              }
            >
              {record?.punchOutAt ? (
                <>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Meta label="Time" value={formatIstTime(record.punchOutAt)} />
                    <Meta label="Date" value={dateLabel} />
                    <Meta
                      label="Location"
                      value={
                        <PlaceName address={record.punchOutAddress} lat={record.punchOutLat} lng={record.punchOutLng} />
                      }
                    />
                    <Meta label="Duration" value={formatDuration(record.durationMin)} />
                  </Stack>
                  {record.punchOutPhotoUrl && (
                    <Box component="img" src={record.punchOutPhotoUrl} alt="Punch out selfie" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1 }} />
                  )}
                </>
              ) : (
                <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {phase === ATTENDANCE_PHASE.WORKING
                    ? 'Take a selfie, then punch out to save time, date, and location.'
                    : 'Available after punch in.'}
                </Typography>
              )}
            </Side>
            </Stack>
          </Stack>
        )}
        {!loading && phase === ATTENDANCE_PHASE.PENDING && (
          <Typography sx={{ mt: 1.5, fontSize: '0.75rem', fontWeight: 600, color: '#B45309' }}>
            A correction is waiting for admin approval.
          </Typography>
        )}
        {!loading && phase === ATTENDANCE_PHASE.COMPLETED && (
          <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
            {today.blockedReason || 'Punched out. Punch in again if that was a mistake.'}
          </Typography>
        )}
        {!loading && ![ATTENDANCE_PHASE.NOT_STARTED, ATTENDANCE_PHASE.WORKING, ATTENDANCE_PHASE.COMPLETED, ATTENDANCE_PHASE.PENDING].includes(phase) && (
          <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
            {today.blockedReason || PHASE_LABELS[phase] || phase}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
