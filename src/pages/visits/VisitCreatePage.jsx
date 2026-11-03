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
import { VISIT_TYPE, ROLES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { peopleApi } from '../../api/peopleApi';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [salespeople, setSalespeople] = useState([]);
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
    if (isAdmin) {
      peopleApi
        .list({ role: ROLES.USER, pageSize: 100 })
        .then(({ data }) => setSalespeople(data?.data || []))
        .catch(() => setSalespeople([]));
    }
  }, [isAdmin]);

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
          date: addDays(newWeekStart, v.dayOffset ?? 0),
        }))
      );
    }
  };

  const addVisitRow = () => {
    const nextId = visits.length ? Math.max(...visits.map((v) => v.id)) + 1 : 1;
    const lastVisit = visits[visits.length - 1];
    let nextStart = '12:00';
    let nextEnd = '14:00';
    if (lastVisit?.endTime) {
      nextStart = lastVisit.endTime;
      const [h, m] = lastVisit.endTime.split(':').map(Number);
      const endH = Math.min(23, h + 2);
      nextEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    const defaultOffset = visits.length % 6;
    setVisits((prev) => [
      ...prev,
      {
        id: nextId,
        date: scope === 'day' ? planDate : addDays(weekStart, defaultOffset),
        dayOffset: defaultOffset,
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

  const updateVisit = (index, field, value) => {
    setVisits((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };
      if (field === 'dayOffset' && scope === 'week') {
        target.date = addDays(weekStart, value);
      }
      next[index] = target;
      return next;
    });
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
    if (isAdmin && !selectedSalesperson) {
      dispatch(showSnackbar({ message: 'Please select a salesperson to assign this visit plan', severity: 'error' }));
      return;
    }
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
          salesperson: isAdmin ? selectedSalesperson : undefined,
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
      dispatch(showSnackbar({ message: `Successfully planned ${visits.length} visit${visits.length > 1 ? 's' : ''}!` }));
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
      <Box sx={{ maxWidth: 840, mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '20px',
            border: '1.5px solid #D4A34E',
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
            boxShadow: '0 6px 24px rgba(36, 20, 4, 0.08)',
          }}
        >
          {/* Admin Salesperson Assignment Dropdown */}
          {isAdmin && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #D4A34E',
                boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
              }}
            >
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Assign to Salesperson *"
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                helperText="Select the salesperson who will execute these customer visits"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFDF8',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.5)' },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select Salesperson</em>
                </MenuItem>
                {salespeople.map((sp) => (
                  <MenuItem key={sp._id} value={sp._id}>
                    {sp.name} ({sp.email || sp.mobileNumber})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {/* Day vs Week Selector */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1.5px solid #D4A34E',
              boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <ToggleButtonGroup
              size="small"
              value={scope}
              exclusive
              onChange={handleScopeChange}
              sx={{
                bgcolor: 'rgba(255, 233, 151, 0.22)',
                borderRadius: '10px',
                p: 0.5,
                border: '1px solid rgba(212, 163, 78, 0.4)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  px: 2.5,
                  py: 0.75,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#583714',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                    color: '#3A230B',
                    boxShadow: '0 2px 6px rgba(88, 55, 20, 0.15)',
                  },
                },
              }}
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
                sx={{
                  width: { xs: '100%', sm: 180 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFDF8',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                  },
                }}
              />
            ) : (
              <TextField
                size="small"
                label="Week Start (Monday)"
                type="date"
                value={weekStart}
                onChange={(e) => handleWeekStartChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFDF8',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                  },
                }}
              />
            )}
          </Box>

          {/* Visits Cards */}
          <Stack spacing={2.5}>
            {visits.map((item, index) => {
              const duration = computeDuration(item.plannedTime, item.endTime);
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: '1.5px solid #D4A34E',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Visit ${index + 1}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                            color: '#3A230B',
                            borderRadius: '8px',
                            border: '1px solid rgba(163, 120, 54, 0.3)',
                            boxShadow: '0 1px 4px rgba(88, 55, 20, 0.1)',
                          }}
                        />
                        {scope === 'week' && (
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#6E4D27' }}>
                            {item.date}
                          </Typography>
                        )}
                      </Stack>
                      {visits.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeVisitRow(index)}
                          title="Remove visit"
                          sx={{
                            color: '#b91c1c',
                            borderRadius: '8px',
                            bgcolor: '#fee2e2',
                            p: 0.5,
                            '&:hover': { bgcolor: '#fecaca' },
                          }}
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
                          sx={{
                            flexWrap: 'wrap',
                            bgcolor: 'rgba(255, 233, 151, 0.18)',
                            borderRadius: '8px',
                            p: 0.25,
                            border: '1px solid rgba(212, 163, 78, 0.35)',
                            '& .MuiToggleButton-root': {
                              border: 'none',
                              borderRadius: '6px !important',
                              py: 0.35,
                              px: 1.25,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#583714',
                              '&.Mui-selected': {
                                background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                                color: '#3A230B',
                              },
                            },
                          }}
                        >
                          {WEEK_DAYS.map((d) => (
                            <ToggleButton key={d.offset} value={d.offset}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFDF8',
                              borderRadius: '10px',
                              '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                            },
                          }}
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
                          sx={{
                            whiteSpace: 'nowrap',
                            px: 1.75,
                            borderRadius: '10px',
                            borderColor: 'rgba(88, 55, 20, 0.35)',
                            color: '#583714',
                            fontWeight: 700,
                            bgcolor: 'rgba(255, 233, 151, 0.15)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 233, 151, 0.35)',
                              borderColor: '#583714',
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFDF8',
                              borderRadius: '10px',
                              '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          label="To Time"
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateVisit(index, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFDF8',
                              borderRadius: '10px',
                              '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                            },
                          }}
                        />
                        {duration && (
                          <Chip
                            size="small"
                            label={duration}
                            sx={{
                              fontWeight: 700,
                              height: 34,
                              px: 1,
                              borderRadius: '8px',
                              bgcolor: duration.includes('End must') ? '#fee2e2' : 'rgba(255, 233, 151, 0.3)',
                              color: duration.includes('End must') ? '#b91c1c' : '#583714',
                              border: duration.includes('End must') ? '1px solid #fca5a5' : '1px solid rgba(212, 163, 78, 0.4)',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        )}
                      </Stack>

                      <TextField
                        size="small"
                        label="Purpose"
                        value={item.purpose}
                        onChange={(e) => updateVisit(index, 'purpose', e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFDF8',
                            borderRadius: '10px',
                            '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                          },
                        }}
                      />
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {COMMON_PURPOSES.map((p) => {
                          const isSel = item.purpose === p;
                          return (
                            <Chip
                              key={p}
                              size="small"
                              label={p}
                              clickable
                              onClick={() => updateVisit(index, 'purpose', p)}
                              sx={{
                                fontSize: '0.6875rem',
                                fontWeight: isSel ? 700 : 600,
                                borderRadius: '999px',
                                background: isSel
                                  ? 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)'
                                  : 'rgba(255, 233, 151, 0.15)',
                                color: isSel ? '#3A230B' : '#583714',
                                border: isSel ? '1px solid #A37836' : '1px solid rgba(212, 163, 78, 0.4)',
                                boxShadow: isSel ? '0 1px 4px rgba(88, 55, 20, 0.15)' : 'none',
                                '&:hover': {
                                  bgcolor: isSel ? undefined : 'rgba(255, 233, 151, 0.35)',
                                },
                              }}
                            />
                          );
                        })}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFDF8',
                            borderRadius: '10px',
                            '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
                          },
                        }}
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
            sx={{
              mt: 2.5,
              py: 1.25,
              border: '1.5px dashed #D4A34E',
              bgcolor: 'rgba(255, 233, 151, 0.22)',
              color: '#452A0E',
              fontWeight: 700,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 233, 151, 0.4)',
                borderColor: '#A37836',
                transform: 'translateY(-1px)',
              },
            }}
          >
            + Add Another Visit (Visit {visits.length + 1})
          </Button>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(212, 163, 78, 0.3)',
            }}
          >
            <Button
              onClick={() => navigate('/visits')}
              disabled={submitting}
              sx={{
                color: '#583714',
                fontWeight: 700,
                px: 2.5,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.2)' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={submitting}
              sx={{
                px: 3.5,
                py: 1,
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                color: '#3A230B',
                boxShadow: '0 4px 14px rgba(88, 55, 20, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                  boxShadow: '0 6px 18px rgba(88, 55, 20, 0.25)',
                },
              }}
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
