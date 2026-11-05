import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DataTable from '../../components/common/DataTable/DataTable';
import { peopleApi } from '../../api/peopleApi';
import { attendanceApi } from '../../api/attendanceApi';
import { visitApi } from '../../api/visitApi';
import { formatIstDate, formatIstTime } from '../../utils/attendanceFormat';

function istTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function monthBounds(year, month) {
  const mm = String(month).padStart(2, '0');
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(last).padStart(2, '0')}`,
  };
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const ROSTER_COLUMNS = [
  {
    field: 'name',
    headerName: 'Salesperson',
    minWidth: 200,
    flex: 1.2,
  },
  {
    field: 'punchInAt',
    headerName: 'Punch in',
    minWidth: 130,
    valueGetter: (_v, row) => formatIstTime(row.punchInAt),
  },
  {
    field: 'punchOutAt',
    headerName: 'Punch out',
    minWidth: 130,
    valueGetter: (_v, row) => formatIstTime(row.punchOutAt),
  },
  {
    field: 'attendanceDate',
    headerName: 'Date',
    minWidth: 120,
    valueGetter: (_v, row) => (row.attendanceDate ? formatIstDate(row.attendanceDate) : '—'),
  },
  {
    field: 'visitCount',
    headerName: 'Visits today',
    minWidth: 110,
    valueGetter: (_v, row) => row.visitCount ?? 0,
  },
];

const DETAIL_COLUMNS = [
  {
    field: 'attendanceDate',
    headerName: 'Date',
    minWidth: 130,
    valueGetter: (_v, row) => formatIstDate(row.attendanceDate),
  },
  {
    field: 'punchInAt',
    headerName: 'Punch in',
    minWidth: 130,
    valueGetter: (_v, row) => formatIstTime(row.punchInAt),
  },
  {
    field: 'punchOutAt',
    headerName: 'Punch out',
    minWidth: 130,
    valueGetter: (_v, row) => formatIstTime(row.punchOutAt),
  },
  {
    field: 'visitCount',
    headerName: 'Visits',
    minWidth: 90,
    valueGetter: (_v, row) => row.visitCount ?? 0,
  },
  { field: 'status', headerName: 'Status', minWidth: 110 },
];

export default function AdminAttendanceRoster() {
  const today = istTodayYmd();
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState([]);

  const years = useMemo(() => {
    const y = now.getFullYear();
    return [y, y - 1, y - 2];
  }, [now]);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const [peopleRes, attRes, visitRes] = await Promise.all([
        peopleApi.list({ pageSize: 100 }),
        attendanceApi.list({ from: today, to: today, pageSize: 100 }),
        visitApi.list({ from: today, to: today, pageSize: 100 }),
      ]);

      const people = (peopleRes.data?.data || []).filter(
        (p) => p.jobRole === 'SALESPERSON' || p.role === 'User'
      );
      const salespeople = people.filter((p) => p.jobRole === 'SALESPERSON');
      const list = salespeople.length ? salespeople : people;

      const attByPerson = new Map();
      for (const rec of attRes.data?.data || []) {
        const id = rec.salesperson?._id || rec.salesperson;
        if (id) attByPerson.set(String(id), rec);
      }

      const visitsByPerson = new Map();
      for (const visit of visitRes.data?.data || []) {
        const id = visit.salesperson?._id || visit.salesperson;
        if (!id) continue;
        // Completed field visits = both check-in and check-out logged.
        if (!visit.checkInAt || !visit.checkOutAt) continue;
        const key = String(id);
        visitsByPerson.set(key, (visitsByPerson.get(key) || 0) + 1);
      }

      setRows(
        list.map((person) => {
          const att = attByPerson.get(String(person._id));
          return {
            id: person._id,
            _id: person._id,
            name: person.name,
            punchInAt: att?.punchInAt || null,
            punchOutAt: att?.punchOutAt || null,
            attendanceDate: att?.attendanceDate || today,
            visitCount: visitsByPerson.get(String(person._id)) || 0,
          };
        })
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadDetail = useCallback(async () => {
    if (!selected?._id) return;
    setDetailLoading(true);
    try {
      const { from, to } = monthBounds(year, month);
      const [attRes, visitRes] = await Promise.all([
        attendanceApi.list({ salesperson: selected._id, from, to, pageSize: 100 }),
        visitApi.list({ salesperson: selected._id, from, to, pageSize: 100 }),
      ]);

      const visitsByDate = new Map();
      for (const visit of visitRes.data?.data || []) {
        if (!visit.checkInAt || !visit.checkOutAt) continue;
        const d = visit.visitDate || String(visit.checkInAt).slice(0, 10);
        visitsByDate.set(d, (visitsByDate.get(d) || 0) + 1);
      }

      const items = (attRes.data?.data || []).map((rec) => ({
        id: rec._id,
        attendanceDate: rec.attendanceDate,
        punchInAt: rec.punchInAt,
        punchOutAt: rec.punchOutAt,
        status: rec.status,
        visitCount: visitsByDate.get(rec.attendanceDate) || 0,
      }));
      items.sort((a, b) => String(b.attendanceDate).localeCompare(String(a.attendanceDate)));
      setDetailRows(items);
    } catch {
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  }, [selected, month, year]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    if (selected) loadDetail();
  }, [selected, loadDetail]);

  if (selected) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelected(null)}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#583714' }}
          >
            Back to today
          </Button>
          <Typography sx={{ fontWeight: 800, color: '#241404', fontSize: '1.05rem' }}>
            {selected.name}
          </Typography>
          <TextField
            select
            size="small"
            label="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <DataTable
          columns={DETAIL_COLUMNS}
          rows={detailRows}
          totalCount={detailRows.length}
          page={0}
          pageSize={Math.max(detailRows.length, 10)}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          loading={detailLoading}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: '12px',
          border: '1px solid #E2D3BE',
          bgcolor: '#FFFDF8',
        }}
      >
        <Typography sx={{ fontWeight: 700, color: '#6E4D27', fontSize: '0.8125rem' }}>
          Today ({formatIstDate(today)}) — tap a salesperson for month-wise attendance
        </Typography>
      </Paper>

      <DataTable
        columns={ROSTER_COLUMNS}
        rows={rows}
        totalCount={rows.length}
        page={0}
        pageSize={Math.max(rows.length, 10)}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={loading}
        onRowClick={(row) => setSelected(row)}
      />
    </Box>
  );
}
