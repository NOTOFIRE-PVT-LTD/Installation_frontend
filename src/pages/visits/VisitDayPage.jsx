import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { DAY_VISIT_STATUS, VISIT_STATUS, VISIT_TYPE } from '../../utils/constants';

function visitLabel(visit) {
  return `${visit.customer?.companyName || 'Visit'} · ${formatPlanTime(visit.plannedTime)}`;
}

function stateLabel(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'Completed';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'In Progress';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'Missed (approved)';
  return 'Upcoming';
}

function stateColor(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'success';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'primary';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'default';
  return 'warning';
}

export default function VisitDayPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await visitApi.getDay();
    const payload = data.data;
    setDay(payload);
    setPicked((payload.selected || []).map((v) => v._id));
  };

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not load today', severity: 'error' }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
  };

  const saveSelection = async () => {
    setBusy(true);
    try {
      const { data } = await visitApi.selectDay({ visitIds: picked });
      setDay(data.data);
      dispatch(showSnackbar({ message: 'Today’s visits saved' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not save selection', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const submitDay = async () => {
    setBusy(true);
    try {
      const { data } = await visitApi.submitDay();
      setDay(data.data);
      dispatch(showSnackbar({ message: 'Day submitted. Continue to expenses.' }));
      if (data.data?.expense?._id) navigate(`/expenses/${data.data.expense._id}`);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Cannot submit day', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  if (!day) return null;
  const selected = day.selected || [];
  const planned = day.planned || [];
  const submitted = day.status === DAY_VISIT_STATUS.SUBMITTED;
  const selectionLocked = selected.some(
    (visit) =>
      visit.status === VISIT_STATUS.IN_PROGRESS ||
      visit.status === VISIT_STATUS.COMPLETED ||
      visit.status === VISIT_STATUS.APPROVED_MISSED
  );
  const active =
    selected.find((v) => v.status === VISIT_STATUS.IN_PROGRESS) ||
    selected.find((v) => v.status === VISIT_STATUS.PLANNED || v.status === VISIT_STATUS.REJECTED);

  return (
    <>
      <PageHeader title="Today's visits" subtitle="Select the visits you are doing, then check in and out in order." />
      <Alert severity={submitted ? 'success' : 'info'} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
        Day status: {day.status}. {selected.length} selected · {day.completed} completed · {day.remaining} remaining.
        {day.totalKm ? ` Travel so far ${day.totalKm} km.` : ''}
      </Alert>

      {!submitted && (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Today’s planned visits</Typography>
            <Stack>
              {planned.map((visit) => (
                <FormControlLabel
                  key={visit._id}
                  control={
                    <Checkbox
                      checked={picked.includes(visit._id)}
                      disabled={selectionLocked}
                      onChange={() => toggle(visit._id)}
                    />
                  }
                  label={visitLabel(visit)}
                />
              ))}
              {!planned.length && <Typography color="text.secondary">No visits cover today. Create one first.</Typography>}
            </Stack>
            <Button variant="contained" sx={{ mt: 1 }} disabled={busy || !picked.length || selectionLocked} onClick={saveSelection}>
              Use selected visits
            </Button>
          </CardContent>
        </Card>
      )}

      <Stack spacing={1.25}>
        {selected.map((visit, index) => (
          <Card key={visit._id} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <div>
                  <Typography sx={{ fontWeight: 700 }}>
                    Visit {index + 1} — {visit.customer?.companyName}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                    {visit.visitType === VISIT_TYPE.TOUR
                      ? `Tour ${visit.visitDate} → ${visit.visitDateTo || visit.visitDate}`
                      : `${visit.visitDate} · ${formatPlanTime(visit.plannedTime)}${visit.endTime ? `–${formatPlanTime(visit.endTime)}` : ''}`}
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}>{visit.purpose}</Typography>
                  {visit.checkInAt && (
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      In {new Date(visit.checkInAt).toLocaleTimeString()} {visit.checkInAddress || ''}
                    </Typography>
                  )}
                  {visit.checkOutAt && (
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      Out {new Date(visit.checkOutAt).toLocaleTimeString()} {visit.travelKm != null ? `· ${visit.travelKm} km` : ''}
                    </Typography>
                  )}
                </div>
                <Stack spacing={1} alignItems={{ sm: 'flex-end' }}>
                  <Chip size="small" color={stateColor(visit)} label={stateLabel(visit)} />
                  {active && active._id === visit._id && !submitted && (
                    <Button variant="contained" onClick={() => navigate(`/visits/${visit._id}`)}>
                      {visit.status === VISIT_STATUS.IN_PROGRESS ? 'Check out' : 'Check in'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {day.canSubmit && (
        <Button variant="contained" sx={{ mt: 2 }} disabled={busy} onClick={submitDay}>
          Submit day
        </Button>
      )}
      {submitted && day.expense?._id && (
        <Button variant="contained" sx={{ mt: 2, ml: 1 }} onClick={() => navigate(`/expenses/${day.expense._id}`)}>
          Open expenses
        </Button>
      )}
    </>
  );
}
