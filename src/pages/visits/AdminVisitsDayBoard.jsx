import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { formatIstTime } from '../../utils/attendanceFormat';
import { VISIT_STATUS } from '../../utils/constants';

function istTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function statusColor(status) {
  switch (status) {
    case VISIT_STATUS.COMPLETED:
      return 'success';
    case VISIT_STATUS.IN_PROGRESS:
      return 'info';
    case VISIT_STATUS.PENDING_APPROVAL:
      return 'warning';
    case VISIT_STATUS.REJECTED:
      return 'error';
    default:
      return 'default';
  }
}

const fieldSx = {
  minWidth: 150,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFDF8',
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.45)' },
  },
};

export default function AdminVisitsDayBoard({ onPlanVisit }) {
  const navigate = useNavigate();
  const today = istTodayYmd();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [openDays, setOpenDays] = useState(() => new Set([today]));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await visitApi.list({
        from,
        to,
        pageSize: 100,
        sortField: 'visitDate',
        sortOrder: 'asc',
      });
      setVisits(data.data || []);
    } catch {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => {
    const map = new Map();
    for (const visit of visits) {
      const d = visit.visitDate || '—';
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(visit);
    }
    return Array.from(map.entries())
      .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
      .map(([date, items]) => {
        const names = [
          ...new Set(items.map((v) => v.salesperson?.name).filter(Boolean)),
        ];
        return { date, items, names };
      });
  }, [visits]);

  const onVisitToday = useMemo(() => {
    const names = new Set();
    for (const visit of visits) {
      if (visit.visitDate !== today) continue;
      if (visit.salesperson?.name) names.add(visit.salesperson.name);
    }
    return [...names];
  }, [visits, today]);

  const toggleDay = (date) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const applyToday = () => {
    setFrom(today);
    setTo(today);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 1.75,
          mb: 2,
          borderRadius: '14px',
          border: '1.5px solid #D4A34E',
          bgcolor: '#FFFDF8',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            size="small"
            type="date"
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
          <Button
            variant="outlined"
            onClick={applyToday}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#583714', borderColor: '#D4A34E' }}
          >
            Today
          </Button>
          <Button
            variant="contained"
            onClick={load}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Apply
          </Button>
          {onPlanVisit ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onPlanVisit}
              sx={{ textTransform: 'none', fontWeight: 700, ml: { sm: 'auto' } }}
            >
              Plan Visits
            </Button>
          ) : null}
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6E4D27', mb: 0.75 }}>
            Salespeople on visit today
          </Typography>
          {onVisitToday.length ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {onVisitToday.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'rgba(229, 184, 92, 0.35)',
                    color: '#241404',
                    border: '1px solid rgba(212, 163, 78, 0.55)',
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8125rem', color: '#8A5D18' }}>
              No salespeople have visits scheduled for today in this range.
            </Typography>
          )}
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} sx={{ color: '#D4A34E' }} />
        </Box>
      ) : days.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 3, textAlign: 'center', borderRadius: '14px', border: '1px solid #E2D3BE' }}
        >
          <Typography sx={{ color: '#6E4D27', fontWeight: 600 }}>
            No visits found for {from === to ? formatDateLabel(from) : `${formatDateLabel(from)} → ${formatDateLabel(to)}`}.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {days.map(({ date, items, names }) => {
            const open = openDays.has(date);
            return (
              <Paper
                key={date}
                elevation={0}
                sx={{
                  borderRadius: '14px',
                  border: date === today ? '1.5px solid #D4A34E' : '1px solid #E2D3BE',
                  overflow: 'hidden',
                  bgcolor: '#FFFDF8',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => toggleDay(date)}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    cursor: 'pointer',
                    background:
                      date === today
                        ? 'linear-gradient(90deg, #FFF9E6 0%, #F5E2B3 100%)'
                        : 'linear-gradient(90deg, #FFFDF8 0%, #FDF7EB 100%)',
                  }}
                >
                  <IconButton size="small" sx={{ color: '#583714' }}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, color: '#241404', fontSize: '0.9375rem' }}>
                      {formatDateLabel(date)}
                      {date === today ? (
                        <Chip
                          label="Today"
                          size="small"
                          sx={{ ml: 1, height: 20, fontWeight: 800, bgcolor: '#E5B85C', color: '#241404' }}
                        />
                      ) : null}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6E4D27', fontWeight: 600 }}>
                      {items.length} visit{items.length === 1 ? '' : 's'} · {names.length} salesperson
                      {names.length === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: '45%', justifyContent: 'flex-end' }}>
                    {names.slice(0, 4).map((n) => (
                      <Chip
                        key={n}
                        label={n}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: 'rgba(212, 163, 78, 0.2)', color: '#3A230B' }}
                      />
                    ))}
                    {names.length > 4 ? (
                      <Chip
                        label={`+${names.length - 4}`}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#F2E7D5', color: '#583714' }}
                      />
                    ) : null}
                  </Stack>
                </Stack>

                <Collapse in={open}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Salesperson</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Check-in</TableCell>
                        <TableCell>Check-out</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((visit) => (
                        <TableRow
                          key={visit._id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/visits/${visit._id}`)}
                        >
                          <TableCell sx={{ fontWeight: 700, color: '#241404' }}>
                            {visit.salesperson?.name || '—'}
                          </TableCell>
                          <TableCell>{visit.customer?.companyName || '—'}</TableCell>
                          <TableCell>
                            {formatPlanTime(visit.plannedTime)}
                            {visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''}
                          </TableCell>
                          <TableCell>{formatIstTime(visit.checkInAt)}</TableCell>
                          <TableCell>{formatIstTime(visit.checkOutAt)}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={visit.status || '—'}
                              color={statusColor(visit.status)}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
