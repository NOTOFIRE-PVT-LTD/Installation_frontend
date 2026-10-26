import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import PageHeader from '../../components/common/PageHeader';
import MissedVisitDialog from './MissedVisitDialog';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { readLocation, formatPlanTime } from '../../utils/readLocation';
import { VISIT_STATUS } from '../../utils/constants';

export default function VisitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isSalesperson } = useAuth();
  const [visit, setVisit] = useState(null);
  const [proximity, setProximity] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [missOpen, setMissOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await visitApi.getById(id);
    setVisit(data.data);
    return data.data;
  }, [id]);

  const refreshProximity = useCallback(async () => {
    const loc = await readLocation();
    if (loc.lat == null) {
      setProximity(loc.error ? { error: loc.error } : null);
      return;
    }
    const { data } = await visitApi.proximity(id, { lat: loc.lat, lng: loc.lng });
    setProximity(data.data);
  }, [id]);

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Visit not found', severity: 'error' }));
      navigate(isSalesperson ? '/visits' : '/salesperson-tracking?tab=visits');
    });
  }, [load, dispatch, navigate, isSalesperson]);

  useEffect(() => {
    if (!visit || !isSalesperson) return undefined;
    refreshProximity();
    const timer = setInterval(refreshProximity, 8000);
    return () => clearInterval(timer);
  }, [visit, isSalesperson, refreshProximity]);

  const postPhotoAction = async (kind) => {
    if (!photo) {
      dispatch(showSnackbar({ message: 'Take a photo first', severity: 'error' }));
      return;
    }
    setBusy(true);
    try {
      const loc = await readLocation();
      if (loc.lat == null) throw new Error(loc.error || 'GPS location is required');
      const form = new FormData();
      form.append('lat', String(loc.lat));
      form.append('lng', String(loc.lng));
      if (loc.address) form.append('address', loc.address);
      form.append('photo', photo);
      if (kind === 'out') {
        const remark = String(notes || '').trim();
        if (!remark) throw new Error('Remark is required to check out');
        form.append('outcomeNotes', remark);
      }
      const { data } = kind === 'in' ? await visitApi.checkIn(id, form) : await visitApi.checkOut(id, form);
      setVisit(data.data);
      setPhoto(null);
      dispatch(showSnackbar({ message: data.message }));
      if (isSalesperson) {
        navigate('/visits/today');
        return;
      }
      await refreshProximity();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || err.message || 'Failed', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const submitMissed = async (payload) => {
    setBusy(true);
    try {
      const { data } = await visitApi.reportMissed(id, payload);
      setVisit(data.data);
      setMissOpen(false);
      dispatch(showSnackbar({ message: data.message }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  if (!visit) return null;

  const status = visit.status;
  const distance = proximity?.distanceM;
  const within = proximity?.withinGeofence;
  const radius = visit.allowedRadiusMeters || 100;
  const canCheckIn = isSalesperson && (status === VISIT_STATUS.PLANNED || status === VISIT_STATUS.REJECTED) && !visit.checkInAt;
  const canCheckOut = isSalesperson && status === VISIT_STATUS.IN_PROGRESS;
  const canMiss =
    isSalesperson &&
    [VISIT_STATUS.PLANNED, VISIT_STATUS.IN_PROGRESS, VISIT_STATUS.REJECTED].includes(status);

  return (
    <>
      <PageHeader title={visit.customer?.companyName || 'Visit'} subtitle={visit.purpose} />
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Chip
              label={status.replaceAll('_', ' ')}
              color={status === VISIT_STATUS.COMPLETED ? 'success' : status === VISIT_STATUS.IN_PROGRESS ? 'info' : 'default'}
              sx={{ alignSelf: 'flex-start' }}
            />
            <Typography color="text.secondary">
              {visit.customer?.city || visit.location?.address || ''}
              {visit.customer?.state ? `, ${visit.customer.state}` : ''}
            </Typography>
            <Typography>
              {formatPlanTime(visit.plannedTime)} · {visit.visitDate}
            </Typography>
            <Typography>Purpose: {visit.purpose}</Typography>

            {visit.checkInAt && (
              <Typography>
                Checked in: {new Date(visit.checkInAt).toLocaleTimeString()}
                {visit.checkInAddress ? ` · ${visit.checkInAddress}` : ''}
                {visit.checkInPhotoUrl ? ' · photo saved' : ''}
              </Typography>
            )}
            {visit.checkOutAt && (
              <Typography>
                Check-out: {new Date(visit.checkOutAt).toLocaleTimeString()}
                {visit.visitDurationMin != null ? ` · Duration: ${visit.visitDurationMin} minutes` : ''}
                {visit.travelKm != null ? ` · Travel: ${visit.travelKm} km` : ''}
              </Typography>
            )}
            {visit.outcomeNotes && <Typography>Remark: {visit.outcomeNotes}</Typography>}

            {isSalesperson && canCheckIn && (
              <>
                {proximity?.error ? (
                  <Alert severity="warning">{proximity.error}</Alert>
                ) : distance == null ? (
                  <Alert severity="warning">GPS is required to check in.</Alert>
                ) : within ? (
                  <Alert severity="success">
                    You are within the allowed location ({Math.round(distance)} meters).
                  </Alert>
                ) : (
                  <Alert severity="warning">
                    You are outside the allowed visit location ({Math.round(distance)} meters). Move within {radius}{' '}
                    meters of the customer to check in.
                  </Alert>
                )}
              </>
            )}

            {status === VISIT_STATUS.PENDING_APPROVAL && (
              <Alert severity="info">PENDING ADMIN APPROVAL — {visit.missedReason}</Alert>
            )}
            {status === VISIT_STATUS.APPROVED_MISSED && (
              <Alert severity="success">Approved as missed. {visit.missedReason}</Alert>
            )}
            {status === VISIT_STATUS.REJECTED && (
              <Alert severity="error">Missed-visit request rejected. You can check in or submit again.</Alert>
            )}
            {status === VISIT_STATUS.COMPLETED && <Alert severity="success">Visit completed.</Alert>}

            {(canCheckIn || canCheckOut) && (
              <Button component="label" variant="outlined">
                {photo ? photo.name : canCheckOut ? 'Take photo & check out' : 'Take photo'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </Button>
            )}

            {canCheckOut && (
              <TextField
                required
                label="Remark"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
                helperText="Required for check-out"
              />
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {canCheckIn && (
                <Button variant="contained" disabled={busy || !within || !photo} onClick={() => postPhotoAction('in')}>
                  {busy ? 'Checking in…' : 'Take photo & check in'}
                </Button>
              )}
              {canCheckOut && (
                <Button
                  variant="contained"
                  disabled={busy || !within || !photo || !String(notes).trim()}
                  onClick={() => postPhotoAction('out')}
                >
                  {busy ? 'Checking out…' : 'Take photo & check out'}
                </Button>
              )}
              {canMiss && (
                <Button color="warning" disabled={busy} onClick={() => setMissOpen(true)}>
                  Report missed visit
                </Button>
              )}
              <Button onClick={() => navigate(isSalesperson ? '/visits/today' : '/salesperson-tracking?tab=visits')}>Back</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <MissedVisitDialog open={missOpen} onClose={() => setMissOpen(false)} onSubmit={submitMissed} submitting={busy} />
    </>
  );
}
