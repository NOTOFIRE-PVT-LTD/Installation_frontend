import { useEffect, useState, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faRoute,
  faWallet,
  faCalendarCheck,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import { attendanceApi } from '../../api/attendanceApi';
import { visitApi } from '../../api/visitApi';
import { formatDuration, formatIstTime } from '../../utils/attendanceFormat';
import { ADMIN_TYPE_LABELS, ROLES } from '../../utils/constants';

function getMonthBounds(yearMonthStr) {
  // yearMonthStr is "YYYY-MM"
  const [y, m] = yearMonthStr.split('-').map(Number);
  const startDate = `${yearMonthStr}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${yearMonthStr}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

function formatMonthLabel(yearMonthStr) {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

export default function SalespersonActivityDrawer({
  open,
  onClose,
  salesperson,
  onPlanVisits,
}) {
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [visitsRecords, setVisitsRecords] = useState([]);
  const [expensesRecords, setExpensesRecords] = useState([]);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const nextStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextStr);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextStr);
  };

  const loadActivityData = async () => {
    if (!salesperson?._id) return;
    setLoading(true);
    const { startDate, endDate } = getMonthBounds(selectedMonth);

    try {
      const [attRes, visitsRes, summaryRes] = await Promise.allSettled([
        attendanceApi.list({
          salesperson: salesperson._id,
          from: startDate,
          to: endDate,
          pageSize: 100,
        }),
        visitApi.list({
          salesperson: salesperson._id,
          startDate,
          endDate,
          pageSize: 100,
        }),
        visitApi.dailySummary({
          salesperson: salesperson._id,
          startDate,
          endDate,
        }),
      ]);

      if (attRes.status === 'fulfilled') {
        setAttendanceRecords(attRes.value.data?.data || []);
      } else {
        setAttendanceRecords([]);
      }

      if (visitsRes.status === 'fulfilled') {
        const vData = visitsRes.value.data?.data;
        setVisitsRecords(Array.isArray(vData) ? vData : vData?.items || []);
      } else {
        setVisitsRecords([]);
      }

      if (summaryRes.status === 'fulfilled') {
        const summaryDays = summaryRes.value.data?.data || [];
        const extractedExpenses = [];
        summaryDays.forEach((day) => {
          if (day.expense) {
            extractedExpenses.push({
              date: day.date,
              ...day.expense,
            });
          }
        });
        setExpensesRecords(extractedExpenses);
      } else {
        setExpensesRecords([]);
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && salesperson) {
      loadActivityData();
    }
  }, [open, salesperson?._id, selectedMonth]);

  // Aggregate monthly stats
  const totalDaysPunched = attendanceRecords.length;
  const totalDurationMin = attendanceRecords.reduce((sum, r) => sum + (Number(r.durationMin) || 0), 0);
  const totalHoursFormatted = formatDuration(totalDurationMin);
  const completedVisits = visitsRecords.filter((v) => v.status === 'COMPLETED').length;
  const totalExpensesAmount = expensesRecords.reduce((sum, exp) => sum + (Number(exp.totalAmount) || 0), 0);

  const isAdmin = salesperson?.role === ROLES.ADMIN;
  const roleLabel = isAdmin
    ? `Admin · ${ADMIN_TYPE_LABELS[salesperson.adminType] || 'Coordinator'}`
    : 'Field Salesperson';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 650, md: 780 },
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          borderLeft: '1.5px solid #D4A34E',
          boxShadow: '-6px 0 28px rgba(36, 20, 4, 0.15)',
        },
      }}
    >
      <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5, pb: 1, borderBottom: '1px solid rgba(212, 163, 78, 0.25)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={salesperson?.profileImage?.url}
              sx={{
                width: 46,
                height: 46,
                fontSize: '1.25rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)',
                color: '#3A230B',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(88, 55, 20, 0.2)',
              }}
            >
              {salesperson?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#241404', lineHeight: 1.2 }}>
                {salesperson?.name || 'Staff Member'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                <Chip
                  size="small"
                  label={roleLabel}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    height: 20,
                    bgcolor: isAdmin ? 'rgba(88, 55, 20, 0.12)' : 'rgba(212, 163, 78, 0.25)',
                    color: isAdmin ? '#583714' : '#8A5D18',
                    border: '1px solid rgba(212, 163, 78, 0.4)',
                  }}
                />
                {salesperson?.mobileNumber && (
                  <Typography variant="caption" sx={{ color: '#583714', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                    <PhoneIcon sx={{ fontSize: 13 }} /> {salesperson.mobileNumber}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {onPlanVisits && !isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddLocationAltIcon />}
                onClick={() => onPlanVisits(salesperson)}
                sx={{
                  background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                  color: '#3A230B',
                  fontWeight: 800,
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 2,
                  boxShadow: '0 2px 8px rgba(88, 55, 20, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                  },
                }}
              >
                + Plan Visits
              </Button>
            )}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(212, 163, 78, 0.4)',
                borderRadius: '8px',
                color: '#583714',
                '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.3)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Month Picker Control Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1.5px solid #D4A34E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(56, 32, 10, 0.04)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#583714' }} title="Previous Month">
              <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#241404', minWidth: 140, textAlign: 'center' }}>
              {formatMonthLabel(selectedMonth)}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#583714' }} title="Next Month">
              <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              size="small"
              label="Month"
              value={Number(selectedMonth.split('-')[1])}
              onChange={(e) => {
                const y = selectedMonth.split('-')[0];
                setSelectedMonth(`${y}-${String(e.target.value).padStart(2, '0')}`);
              }}
              sx={{
                minWidth: 128,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFDF8',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.45)' },
                },
              }}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ].map((label, i) => (
                <MenuItem key={label} value={i + 1}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Year"
              value={Number(selectedMonth.split('-')[0])}
              onChange={(e) => {
                const m = selectedMonth.split('-')[1];
                setSelectedMonth(`${e.target.value}-${m}`);
              }}
              sx={{
                minWidth: 96,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFDF8',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.45)' },
                },
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {/* Month Summary KPI Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(212, 163, 78, 0.4)',
              boxShadow: '0 2px 6px rgba(56, 32, 10, 0.03)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6E4D27', fontWeight: 700, textTransform: 'uppercase' }}>
              Days Present
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#241404', mt: 0.25 }}>
              {totalDaysPunched}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(212, 163, 78, 0.4)',
              boxShadow: '0 2px 6px rgba(56, 32, 10, 0.03)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6E4D27', fontWeight: 700, textTransform: 'uppercase' }}>
              Working Hours
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#241404', mt: 0.25 }}>
              {totalHoursFormatted}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(212, 163, 78, 0.4)',
              boxShadow: '0 2px 6px rgba(56, 32, 10, 0.03)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6E4D27', fontWeight: 700, textTransform: 'uppercase' }}>
              Visits Done
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#241404', mt: 0.25 }}>
              {completedVisits} <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>/ {visitsRecords.length}</Typography>
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(212, 163, 78, 0.4)',
              boxShadow: '0 2px 6px rgba(56, 32, 10, 0.03)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6E4D27', fontWeight: 700, textTransform: 'uppercase' }}>
              Travel Expenses
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#241404', mt: 0.25 }}>
              ₹{totalExpensesAmount.toLocaleString('en-IN')}
            </Typography>
          </Paper>
        </Box>

        {/* Tabs for Attendance, Visits, Expenses */}
        <Box sx={{ borderBottom: '1px solid rgba(212, 163, 78, 0.3)', mb: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={(_e, v) => setTabIndex(v)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                minHeight: 40,
                color: '#6E4D27',
                '&.Mui-selected': { color: '#3A230B' },
              },
            }}
          >
            <Tab icon={<FontAwesomeIcon icon={faClock} style={{ marginRight: 6 }} />} iconPosition="start" label={`1. Attendance (${attendanceRecords.length})`} />
            <Tab icon={<FontAwesomeIcon icon={faRoute} style={{ marginRight: 6 }} />} iconPosition="start" label={`2. Visits & Check-Ins (${visitsRecords.length})`} />
            <Tab icon={<FontAwesomeIcon icon={faWallet} style={{ marginRight: 6 }} />} iconPosition="start" label={`3. Expenses (${expensesRecords.length})`} />
          </Tabs>
        </Box>

        {/* Content Body */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#D4A34E' }} />
            </Box>
          ) : (
            <>
              {/* TAB 1: Attendance Logs */}
              {tabIndex === 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1.5px solid #D4A34E', bgcolor: '#FFFFFF' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#FDF7EB' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Punch In</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Punch Out</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No attendance punches recorded for {formatMonthLabel(selectedMonth)}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((att) => (
                          <TableRow key={att._id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#241404' }}>{att.attendanceDate}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatIstTime(att.punchInAt)}</Typography>
                              {att.punchInAddress && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.6875rem' }} noWrap title={att.punchInAddress}>
                                  📍 {att.punchInAddress}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatIstTime(att.punchOutAt)}</Typography>
                              {att.punchOutAddress && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.6875rem' }} noWrap title={att.punchOutAddress}>
                                  📍 {att.punchOutAddress}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#3A230B' }}>
                              {formatDuration(att.durationMin)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={att.status || 'OPEN'}
                                sx={{
                                  height: 20,
                                  fontWeight: 700,
                                  fontSize: '0.625rem',
                                  bgcolor: att.status === 'CLOSED' ? '#ecfdf5' : '#fef3c7',
                                  color: att.status === 'CLOSED' ? '#065f46' : '#92400e',
                                  border: att.status === 'CLOSED' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* TAB 2: Visits Records with Check-In & Check-Out Details */}
              {tabIndex === 1 && (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1.5px solid #D4A34E', bgcolor: '#FFFFFF' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#FDF7EB' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Purpose</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Check-In / Out</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitsRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No visits scheduled or completed for {formatMonthLabel(selectedMonth)}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        visitsRecords.map((v) => (
                          <TableRow key={v._id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#241404', whiteSpace: 'nowrap' }}>
                              <div>{v.visitDate}</div>
                              <Typography variant="caption" sx={{ color: '#8A5D18', fontWeight: 600 }}>
                                {v.plannedTime} – {v.endTime || 'End'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#241404' }}>
                                {v.customer?.companyName || '—'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {v.customer?.city || v.customer?.address || ''}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#583714' }}>
                              {v.purpose}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: v.checkInAt ? '#065f46' : 'text.secondary' }}>
                                In: {v.checkInAt ? formatIstTime(v.checkInAt) : '—'}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: v.checkOutAt ? '#065f46' : 'text.secondary' }}>
                                Out: {v.checkOutAt ? formatIstTime(v.checkOutAt) : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={v.status}
                                sx={{
                                  height: 20,
                                  fontWeight: 700,
                                  fontSize: '0.625rem',
                                  bgcolor:
                                    v.status === 'COMPLETED'
                                      ? '#ecfdf5'
                                      : v.status === 'IN_PROGRESS'
                                      ? '#eff6ff'
                                      : v.status === 'MISSED'
                                      ? '#fee2e2'
                                      : '#fef3c7',
                                  color:
                                    v.status === 'COMPLETED'
                                      ? '#065f46'
                                      : v.status === 'IN_PROGRESS'
                                      ? '#1e40af'
                                      : v.status === 'MISSED'
                                      ? '#991b1b'
                                      : '#92400e',
                                  border: '1px solid rgba(0,0,0,0.06)',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* TAB 3: Expenses Records */}
              {tabIndex === 2 && (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1.5px solid #D4A34E', bgcolor: '#FFFFFF' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#FDF7EB' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Distance</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Amount (₹)</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#583714' }}>Approval Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expensesRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No travel expenses submitted for {formatMonthLabel(selectedMonth)}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expensesRecords.map((exp, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#241404' }}>{exp.date}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{exp.transportMode || 'Private Vehicle'}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{exp.totalDistanceKm ? `${exp.totalDistanceKm} km` : '—'}</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#3A230B' }}>
                              ₹{(exp.totalAmount || 0).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={exp.status || 'DRAFT'}
                                sx={{
                                  height: 20,
                                  fontWeight: 700,
                                  fontSize: '0.625rem',
                                  bgcolor:
                                    exp.status === 'APPROVED'
                                      ? '#ecfdf5'
                                      : exp.status === 'PENDING_APPROVAL'
                                      ? '#fef3c7'
                                      : '#f1f5f9',
                                  color:
                                    exp.status === 'APPROVED'
                                      ? '#065f46'
                                      : exp.status === 'PENDING_APPROVAL'
                                      ? '#92400e'
                                      : '#475569',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

