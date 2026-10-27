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
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../components/common/PageHeader';
import CameraFileInput from '../../components/common/CameraFileInput';
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
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);
  const [missOpen, setMissOpen] = useState(false);
  const [readingLoc, setReadingLoc] = useState(false);

  const load = useCallback(async () => {
    const { data } = await visitApi.getById(id);
    setVisit(data.data);
    return data.data;
  }, [id]);

  const refreshProximity = useCallback(async () => {
    try {
      const loc = await readLocation();
      if (loc.lat == null) {
        setProximity(loc.error ? { error: loc.error } : null);
        return;
      }
      const { data } = await visitApi.proximity(id, { lat: loc.lat, lng: loc.lng });
      setProximity(data.data);
    } catch {
      // Ignore background refresh errors
    }
  }, [id]);

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Visit not found', severity: 'error' }));
      navigate(isSalesperson ? '/visits/today' : '/salesperson-tracking?tab=visits');
    });
  }, [load, dispatch, navigate, isSalesperson]);

  useEffect(() => {
    if (!visit || !isSalesperson) return undefined;
    refreshProximity();
    const timer = setInterval(refreshProximity, 10000);
    return () => clearInterval(timer);
  }, [visit, isSalesperson, refreshProximity]);

  const handleCheckInWithPhoto = async (photoFile) => {
    if (!photoFile) return;
    setBusy(true);
    setReadingLoc(true);
    try {
      const loc = await readLocation();
      if (loc.lat == null) throw new Error(loc.error || 'GPS location is required');
      const form = new FormData();
      form.append('lat', String(loc.lat));
      form.append('lng', String(loc.lng));
      if (loc.address) form.append('address', loc.address);
      form.append('photo', photoFile);

      const { data } = await visitApi.checkIn(id, form);
      setVisit(data.data);
      dispatch(showSnackbar({ message: 'Checked in successfully!' }));
      if (isSalesperson) {
        navigate('/visits/today');
        return;
      }
      await refreshProximity();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || err.message || 'Check-in failed',
          severity: 'error',
        })
      );
    } finally {
      setBusy(false);
      setReadingLoc(false);
    }
  };

  const handleCheckOutWithPhoto = async (photoFile) => {
    if (!photoFile) return;
    const cleanRemark = String(remark || '').trim();
    if (!cleanRemark) {
      dispatch(showSnackbar({ message: 'Please enter a visit remark before checking out', severity: 'warning' }));
      return;
    }

    setBusy(true);
    setReadingLoc(true);
    try {
      const loc = await readLocation();
      if (loc.lat == null) throw new Error(loc.error || 'GPS location is required');
      const form = new FormData();
      form.append('lat', String(loc.lat));
      form.append('lng', String(loc.lng));
      if (loc.address) form.append('address', loc.address);
      form.append('photo', photoFile);
      form.append('outcomeNotes', cleanRemark);

      const { data } = await visitApi.checkOut(id, form);
      setVisit(data.data);
      dispatch(showSnackbar({ message: 'Checked out successfully!' }));
      if (isSalesperson) {
        navigate('/visits/today');
        return;
      }
      await refreshProximity();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || err.message || 'Check-out failed',
          severity: 'error',
        })
      );
    } finally {
      setBusy(false);
      setReadingLoc(false);
    }
  };

  const submitMissed = async (payload) => {
    setBusy(true);
    try {
      const { data } = await visitApi.reportMissed(id, payload);
      setVisit(data.data);
      setMissOpen(false);
      dispatch(showSnackbar({ message: data.message || 'Visit marked as missed' }));
      navigate('/visits/today');
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  if (!visit) return null;

  const status = visit.status;
  const distance = proximity?.distanceM;
  const within = proximity?.withinGeofence ?? true;
  const isInitial = proximity?.isInitialSetup;
  const radius = visit.allowedRadiusMeters || 100;
  const canCheckIn = isSalesperson && (status === VISIT_STATUS.PLANNED || status === VISIT_STATUS.REJECTED) && !visit.checkInAt;
  const canCheckOut = isSalesperson && status === VISIT_STATUS.IN_PROGRESS;
  const canMiss =
    isSalesperson &&
    [VISIT_STATUS.PLANNED, VISIT_STATUS.IN_PROGRESS, VISIT_STATUS.REJECTED].includes(status);

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
            {/* Status & Timing */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Chip
                label={status.replaceAll('_', ' ')}
                color={status === VISIT_STATUS.COMPLETED ? 'success' : status === VISIT_STATUS.IN_PROGRESS ? 'info' : 'default'}
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · {visit.visitDate}
              </Typography>
            </Stack>

            {/* Customer Details */}
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

            {/* Check-In Details if completed */}
            {visit.checkInAt && (
              <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ✓ Checked In: {new Date(visit.checkInAt).toLocaleTimeString()}
                </Typography>
                {visit.checkInAddress && (
                  <Typography variant="caption" color="text.secondary">
                    {visit.checkInAddress}
                  </Typography>
                )}
                {visit.checkInPhotoUrl && (
                  <Box
                    component="img"
                    src={visit.checkInPhotoUrl}
                    alt="Check-in photo"
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', mt: 1 }}
                  />
                )}
              </Box>
            )}

            {/* Check-Out Details if completed */}
            {visit.checkOutAt && (
              <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ✓ Checked Out: {new Date(visit.checkOutAt).toLocaleTimeString()}
                </Typography>
                {visit.visitDurationMin != null && (
                  <Typography variant="body2">
                    Duration: {visit.visitDurationMin} mins {visit.travelKm != null ? `· Travel: ${visit.travelKm} km` : ''}
                  </Typography>
                )}
                {visit.outcomeNotes && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    Remark: {visit.outcomeNotes}
                  </Typography>
                )}
                {visit.checkOutPhotoUrl && (
                  <Box
                    component="img"
                    src={visit.checkOutPhotoUrl}
                    alt="Check-out photo"
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', mt: 1 }}
                  />
                )}
              </Box>
            )}

            {/* Proximity / GPS distance alerts */}
            {isSalesperson && canCheckIn && (
              <>
                {proximity?.error ? (
                  <Alert severity="warning">{proximity.error}</Alert>
                ) : isInitial ? (
                  <Alert severity="info">
                    <strong>First Visit:</strong> Customer coordinates will be registered at your current GPS location upon check-in.
                  </Alert>
                ) : distance != null ? (
                  within ? (
                    <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
                      You are within the allowed location (<strong>{Math.round(distance)} meters</strong> away).
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      You are outside the allowed customer location (<strong>{Math.round(distance)} meters</strong> away). Move within {radius} meters to check in.
                    </Alert>
                  )
                ) : null}
              </>
            )}

            {/* Actions for Salesperson */}
            {canCheckIn && (
              <Stack spacing={1.5}>
                <Button
                  component="label"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={busy || (!within && !isInitial)}
                  startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                  sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
                >
                  {busy ? (readingLoc ? 'Reading GPS…' : 'Checking in…') : 'Click Picture & Check In'}
                  <CameraFileInput capture="environment" onFile={handleCheckInWithPhoto} />
                </Button>
                <Typography variant="caption" color="text.secondary" align="center">
                  Takes a picture of the customer/site and automatically records GPS and time
                </Typography>
              </Stack>
            )}

            {canCheckOut && (
              <Stack spacing={2}>
                <TextField
                  required
                  autoFocus
                  label="Visit Remark / Meeting Outcome"
                  placeholder="e.g. Discussed catalog, customer agreed to order 50 units next Monday"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                  helperText="Mandatory remark required for check-out"
                />

                <Button
                  component="label"
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={busy || !remark.trim()}
                  startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                  sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
                >
                  {busy ? (readingLoc ? 'Reading GPS…' : 'Checking out…') : 'Click Picture & Check Out'}
                  <CameraFileInput capture="environment" onFile={handleCheckOutWithPhoto} />
                </Button>
                {!remark.trim() && (
                  <Typography variant="caption" color="error.main" align="center">
                    Type your remark above to enable the check-out button
                  </Typography>
                )}
              </Stack>
            )}

            {/* Report missed visit option */}
            {canMiss && (
              <Button
                color="warning"
                variant="outlined"
                disabled={busy}
                onClick={() => setMissOpen(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Mark as Missed Visit
              </Button>
            )}

            {status === VISIT_STATUS.COMPLETED && (
              <Alert severity="success">Visit completed successfully!</Alert>
            )}
            {status === VISIT_STATUS.APPROVED_MISSED && (
              <Alert severity="info">Visit approved as missed ({visit.missedReason}).</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      <MissedVisitDialog
        open={missOpen}
        onClose={() => setMissOpen(false)}
        onSubmit={submitMissed}
        submitting={busy}
      />
    </>
  );
}
