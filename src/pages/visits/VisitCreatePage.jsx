import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PageHeader from '../../components/common/PageHeader';
import QuickCustomerDialog from '../../components/customers/QuickCustomerDialog';
import { customerApi } from '../../api/customerApi';
import { visitApi } from '../../api/visitApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../app/hooks';
import { VISIT_TYPE } from '../../utils/constants';

function computeDuration(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = String(start).split(':').map(Number);
  const [eh, em] = String(end).split(':').map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return '';
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return 'End must be after start';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim() || '0m';
}

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const COMMON_PURPOSES = ['Site Inspection', 'Product Demo', 'Order Collection', 'Payment Follow-up', 'Routine Check'];

const WEEK_DAYS = [
  { label: 'Mon', offset: 0 },
  { label: 'Tue', offset: 1 },
  { label: 'Wed', offset: 2 },
  { label: 'Thu', offset: 3 },
  { label: 'Fri', offset: 4 },
  { label: 'Sat', offset: 5 },
  { label: 'Sun', offset: 6 },
];

export default function VisitCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [scope, setScope] = useState('day');
  const [planDate, setPlanDate] = useState(todayStr);
  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [customers, setCustomers] = useState([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [activeVisitIndex, setActiveVisitIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [visits, setVisits] = useState([
    {
      id: 1,
      date: todayStr,
      dayOffset: 0,
      customer: '',
      plannedTime: '09:30',
      endTime: '11:30',
      purpose: 'Site Inspection',
      notes: '',
    },
  ]);

  const loadCustomers = async () => {
    try {
      const { data } = await customerApi.list({ pageSize: 100, active: 'true' });
      setCustomers(data.data || []);
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleScopeChange = (_e, newScope) => {
    if (!newScope) return;
    setScope(newScope);
    setVisits((prev) =>
      prev.map((v, i) => ({
        ...v,
        date: newScope === 'day' ? planDate : addDays(weekStart, v.dayOffset ?? (i % 6)),
      }))
    );
  };

  const handlePlanDateChange = (newDate) => {
    setPlanDate(newDate);
    if (scope === 'day') {
      setVisits((prev) => prev.map((v) => ({ ...v, date: newDate })));
    }
  };

  const handleWeekStartChange = (newWeekStart) => {
    setWeekStart(newWeekStart);
    if (scope === 'week') {
      setVisits((prev) =>
        prev.map((v) => ({
          ...v,
          date: addDays(newWeekStart, v.dayOffset || 0),
        }))
      );
    }
  };

  const updateVisit = (index, field, value) => {
    setVisits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      if (field === 'dayOffset' && scope === 'week') {
        copy[index].date = addDays(weekStart, Number(value));
      }
      return copy;
    });
  };

  const addVisitRow = () => {
    const last = visits[visits.length - 1];
    let nextStart = '14:00';
    let nextEnd = '16:00';
    let nextOffset = 0;

    if (last?.endTime) {
      const [h, m] = String(last.endTime).split(':').map(Number);
      if (!Number.isNaN(h)) {
        const startH = (h + 1) % 24;
        const endH = (startH + 2) % 24;
        nextStart = `${String(startH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
        nextEnd = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
      }
    }
    if (scope === 'week' && last) {
      nextOffset = last.dayOffset || 0;
    }

    setVisits((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: scope === 'day' ? planDate : addDays(weekStart, nextOffset),
        dayOffset: nextOffset,
        customer: '',
        plannedTime: nextStart,
        endTime: nextEnd,
        purpose: 'Site Inspection',
        notes: '',
      },
    ]);
  };

  const removeVisitRow = (index) => {
    if (visits.length <= 1) return;
    setVisits((prev) => prev.filter((_, i) => i !== index));
  };

  const openCustomerModal = (index) => {
    setActiveVisitIndex(index);
    setCustomerModal(true);
  };

  const handleCustomerCreated = (newCust) => {
    setCustomers((prev) => [newCust, ...prev]);
    if (activeVisitIndex !== null) {
      updateVisit(activeVisitIndex, 'customer', newCust._id);
    }
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < visits.length; i++) {
      const v = visits[i];
      if (!v.customer) {
        dispatch(showSnackbar({ message: `Please select a customer for Visit #${i + 1}`, severity: 'error' }));
        return;
      }
      if (!v.date) {
        dispatch(showSnackbar({ message: `Please pick a date for Visit #${i + 1}`, severity: 'error' }));
        return;
      }
      if (!v.purpose?.trim()) {
        dispatch(showSnackbar({ message: `Please enter a purpose for Visit #${i + 1}`, severity: 'error' }));
        return;
      }
    }

    setSubmitting(true);
    try {
      const promises = visits.map((v) =>
        visitApi.create({
          customer: v.customer,
          visitType: VISIT_TYPE.HOURLY,
          visitDate: v.date,
          plannedTime: v.plannedTime?.slice(0, 5) || '09:30',
          endTime: v.endTime?.slice(0, 5) || '11:30',
          purpose: v.purpose.trim(),
          notes: (v.notes || '').trim(),
        })
      );
      await Promise.all(promises);
      dispatch(showSnackbar({ message: `Saved ${visits.length} visit${visits.length > 1 ? 's' : ''} to your plan!` }));
      navigate('/visits');
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || err.message || 'Could not save visit plan',
          severity: 'error',
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Plan Visits"
        subtitle="Plan a single day or whole week with multiple customer stops in a single form"
      />
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Day vs Week Selector */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '8px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ToggleButtonGroup
              size="small"
              value={scope}
              exclusive
              onChange={handleScopeChange}
              sx={{ '& .MuiToggleButton-root': { px: 2.5, fontWeight: 700 } }}
            >
              <ToggleButton value="day">Single Day</ToggleButton>
              <ToggleButton value="week">Whole Week</ToggleButton>
            </ToggleButtonGroup>

            {scope === 'day' ? (
              <TextField
                size="small"
                label="Plan Date"
                type="date"
                value={planDate}
                onChange={(e) => handlePlanDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: '100%', sm: 180 } }}
              />
            ) : (
              <TextField
                size="small"
                label="Week Start (Monday)"
                type="date"
                value={weekStart}
                onChange={(e) => handleWeekStartChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            )}
          </Stack>

          {/* Visits Cards */}
          <Stack spacing={2.5}>
            {visits.map((item, index) => {
              const duration = computeDuration(item.plannedTime, item.endTime);
              return (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Visit ${index + 1}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, px: 0.5 }}
                        />
                        {scope === 'week' && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {item.date}
                          </Typography>
                        )}
                      </Stack>
                      {visits.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeVisitRow(index)}
                          title="Remove visit"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <Stack spacing={2}>
                      {scope === 'week' && (
                        <ToggleButtonGroup
                          size="small"
                          exclusive
                          value={item.dayOffset}
                          onChange={(_e, val) => val !== null && updateVisit(index, 'dayOffset', val)}
                          sx={{ flexWrap: 'wrap' }}
                        >
                          {WEEK_DAYS.map((d) => (
                            <ToggleButton key={d.offset} value={d.offset} sx={{ py: 0.25, px: 1.5, fontSize: '0.8rem' }}>
                              {d.label}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      )}

                      <Stack direction="row" spacing={1}>
                        <TextField
                          select
                          required
                          fullWidth
                          size="small"
                          label="Customer"
                          value={item.customer}
                          onChange={(e) => updateVisit(index, 'customer', e.target.value)}
                        >
                          <MenuItem value="" disabled>
                            <em>Select Customer</em>
                          </MenuItem>
                          {customers.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
                              {c.companyName} {c.city ? `(${c.city})` : ''}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddAlt1Icon />}
                          onClick={() => openCustomerModal(index)}
                          sx={{ whiteSpace: 'nowrap', px: 1.5 }}
                        >
                          New
                        </Button>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                        <TextField
                          size="small"
                          label="From Time"
                          type="time"
                          value={item.plannedTime}
                          onChange={(e) => updateVisit(index, 'plannedTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="To Time"
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateVisit(index, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        {duration && (
                          <Chip
                            size="small"
                            variant="outlined"
                            color={duration.includes('End must') ? 'error' : 'default'}
                            label={duration}
                            sx={{ fontWeight: 600, height: 32, px: 0.5, whiteSpace: 'nowrap' }}
                          />
                        )}
                      </Stack>

                      <TextField
                        size="small"
                        label="Purpose"
                        value={item.purpose}
                        onChange={(e) => updateVisit(index, 'purpose', e.target.value)}
                        fullWidth
                      />
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {COMMON_PURPOSES.map((p) => (
                          <Chip
                            key={p}
                            size="small"
                            label={p}
                            clickable
                            variant={item.purpose === p ? 'filled' : 'outlined'}
                            color={item.purpose === p ? 'primary' : 'default'}
                            onClick={() => updateVisit(index, 'purpose', p)}
                            sx={{ fontSize: '0.6875rem' }}
                          />
                        ))}
                      </Stack>

                      <TextField
                        size="small"
                        label="Notes (Optional)"
                        placeholder="Agenda, contact person, or discussion notes"
                        value={item.notes}
                        onChange={(e) => updateVisit(index, 'notes', e.target.value)}
                        fullWidth
                        multiline
                        minRows={1}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addVisitRow}
            sx={{ mt: 2.5, py: 1.25, borderStyle: 'dashed', borderRadius: 999 }}
          >
            Add Another Visit (Visit {visits.length + 1})
          </Button>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => navigate('/visits')} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={submitting}
              sx={{ px: 3, fontWeight: 700 }}
            >
              {submitting ? 'Saving Plan…' : `Save Visit Plan (${visits.length})`}
            </Button>
          </Stack>
        </Paper>
      </Box>

      <QuickCustomerDialog
        open={customerModal}
        onClose={() => setCustomerModal(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}
