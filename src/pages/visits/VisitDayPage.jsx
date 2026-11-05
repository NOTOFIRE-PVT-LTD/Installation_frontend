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
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { DAY_VISIT_STATUS, VISIT_STATUS, VISIT_TYPE } from '../../utils/constants';

function visitLabel(visit) {
  return `${visit.customer?.companyName || 'Visit'} · ${formatPlanTime(visit.plannedTime)}${
    visit.endTime ? `–${formatPlanTime(visit.endTime)}` : ''
  } · ${visit.purpose}`;
}

function stateLabel(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'Completed';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'In Progress';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'Missed (approved)';
  if (visit.status === VISIT_STATUS.PENDING_APPROVAL) {
    if (visit.fieldClosed && !visit.checkOutAt) return 'Missed (pending admin)';
    return visit.checkOutAt ? 'Pending Approval (Done)' : 'Pending Approval (Out of range)';
  }
  return 'Upcoming';
}

function stateColor(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'success';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'primary';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'default';
  if (visit.status === VISIT_STATUS.PENDING_APPROVAL) return 'warning';
  return 'default';
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

  const selectAll = () => {
    if (!day?.planned) return;
    setPicked(day.planned.map((v) => v._id));
  };

  const deselectAll = () => {
    setPicked([]);
  };

  const saveSelection = async () => {
    if (!picked.length) {
      dispatch(showSnackbar({ message: 'Please select at least one visit for today', severity: 'warning' }));
      return;
    }
    setBusy(true);
    try {
      const { data } = await visitApi.selectDay({ visitIds: picked });
      setDay(data.data);
      dispatch(showSnackbar({ message: `${picked.length} visits confirmed for today!` }));
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
      dispatch(showSnackbar({ message: 'Day submitted! Please complete travel expenses below.' }));
      if (data.data?.expense?._id) {
        navigate(`/expenses/${data.data.expense._id}`);
      }
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
      visit.status === VISIT_STATUS.APPROVED_MISSED ||
      visit.status === VISIT_STATUS.PENDING_APPROVAL
  );

  return (
    <>
      <PageHeader
        title="Today's Visits"
        subtitle="Select today's visits, check in & out at each location with a selfie, and submit your travel expenses."
        actions={
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate('/visits')}
          >
            Open Visit Plan
          </Button>
        }
      />

      {/* Progress summary banner */}
      <Alert
        severity={submitted ? 'success' : selected.length && day.remaining === 0 ? 'success' : 'info'}
        sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
          <div>
            <strong>Status: {submitted ? 'Day Completed & Submitted' : 'In Progress'}</strong> ·{' '}
            {selected.length} visits selected · {day.completed} completed · {day.remaining} remaining
            {day.totalKm ? ` · Total travel ${day.totalKm} km` : ''}
          </div>
          {submitted && day.expense?._id && (
            <Button
              size="small"
              variant="contained"
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate(`/expenses/${day.expense._id}`)}
              sx={{ alignSelf: 'flex-start' }}
            >
              View Expenses
            </Button>
          )}
        </Stack>
      </Alert>

      {/* Selection Box: Pick which visits to execute today */}
      {!submitted && (
        <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <div>
                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Pick Visits for Today ({day.date})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose the visits you will be performing today from your plan
                </Typography>
              </div>
              {!selectionLocked && planned.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={selectAll}>Select All</Button>
                  <Button size="small" onClick={deselectAll}>Clear</Button>
                </Stack>
              )}
            </Stack>

            <Stack spacing={0.5}>
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
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {visit.customer?.companyName || 'Customer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · {visit.purpose}
                        {visit.customer?.city ? ` · ${visit.customer.city}` : ''}
                      </Typography>
                    </Box>
                  }
                />
              ))}
              {!planned.length && (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    No visits planned for today yet.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/visits')}
                  >
                    Go to Visit Plan to Add Visits
                  </Button>
                </Box>
              )}
            </Stack>

            {!selectionLocked && planned.length > 0 && (
              <Button
                variant="contained"
                sx={{ mt: 2, fontWeight: 700 }}
                disabled={busy || !picked.length}
                onClick={saveSelection}
              >
                Confirm Today's Visits ({picked.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Visits Queue */}
      <Stack spacing={2}>
        {selected.map((visit, index) => {
          const isDone =
            visit.fieldClosed ||
            visit.status === VISIT_STATUS.COMPLETED ||
            visit.status === VISIT_STATUS.APPROVED_MISSED ||
            (visit.status === VISIT_STATUS.PENDING_APPROVAL && Boolean(visit.checkOutAt));
          const needsCheckOut =
            !isDone &&
            (visit.status === VISIT_STATUS.IN_PROGRESS ||
              (visit.status === VISIT_STATUS.PENDING_APPROVAL && Boolean(visit.checkInAt) && !visit.checkOutAt));
          return (
            <Card
              key={visit._id}
              variant="outlined"
              sx={{
                border: '1px solid',
                borderColor: isDone ? 'success.light' : 'divider',
                borderRadius: '8px',
                bgcolor: isDone ? 'action.hover' : 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Chip
                        size="small"
                        color={isDone ? 'success' : 'primary'}
                        label={`Visit #${index + 1}`}
                        sx={{ fontWeight: 700 }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {visit.customer?.companyName}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Time: {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''} · Purpose: {visit.purpose}
                    </Typography>

                    {visit.customer?.address && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Location: {visit.customer.address} {visit.customer.city ? `(${visit.customer.city})` : ''}
                      </Typography>
                    )}

                    {visit.checkInAt && (
                      <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                        ✓ Checked in: {new Date(visit.checkInAt).toLocaleTimeString()} {visit.checkInAddress || ''}
                      </Typography>
                    )}
                    {visit.checkOutAt && (
                      <Typography variant="caption" color="success.main" display="block" sx={{ fontWeight: 600 }}>
                        ✓ Checked out: {new Date(visit.checkOutAt).toLocaleTimeString()}
                        {visit.travelKm != null ? ` · Travel: ${visit.travelKm} km` : ''}
                        {visit.outcomeNotes ? ` · Remark: "${visit.outcomeNotes}"` : ''}
                      </Typography>
                    )}
                  </Box>

                  <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} justifyContent="center">
                    <Chip size="small" color={stateColor(visit)} label={stateLabel(visit)} sx={{ fontWeight: 600 }} />
                    {!submitted && (
                      <Button
                        variant={needsCheckOut ? 'contained' : isDone ? 'outlined' : 'contained'}
                        color={needsCheckOut ? 'warning' : 'primary'}
                        onClick={() => navigate(`/visits/${visit._id}`)}
                        sx={{ fontWeight: 700 }}
                      >
                        {needsCheckOut ? 'Check Out →' : isDone ? 'View Details' : 'Check In →'}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Submit Day Button & Expense Flow */}
      {day.canSubmit && (
        <Card sx={{ mt: 3, p: 2.5, bgcolor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#166534' }}>
                🎉 All Selected Visits Completed!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submit today's visits to unlock and submit your travel expense claim.
              </Typography>
            </div>
            <Button
              variant="contained"
              color="success"
              size="large"
              disabled={busy}
              endIcon={<ArrowForwardIcon />}
              onClick={submitDay}
              sx={{ fontWeight: 700, px: 3, py: 1.25, borderRadius: 999 }}
            >
              {busy ? 'Submitting Day…' : 'Submit Day & Enter Expenses'}
            </Button>
          </Stack>
        </Card>
      )}

      {submitted && day.expense?._id && (
        <Card sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Today's Day Record is Submitted
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can view or update your submitted travel expenses anytime.
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate(`/expenses/${day.expense._id}`)}
              sx={{ fontWeight: 700 }}
            >
              Open Travel Expense Form
            </Button>
          </Stack>
        </Card>
      )}
    </>
  );
}
