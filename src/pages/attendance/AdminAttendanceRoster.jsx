import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DataTable from '../../components/common/DataTable/DataTable';
import { peopleApi } from '../../api/peopleApi';
import { attendanceApi } from '../../api/attendanceApi';
import { visitApi } from '../../api/visitApi';
import { formatIstDate } from '../../utils/attendanceFormat';
import { ROSTER_COLUMNS, istTodayYmd, monthBounds } from './rosterColumns';
import AdminAttendanceDetailView from './AdminAttendanceDetailView';

function mapRosterRows(list, attByPerson, visitsByPerson, today) {
  return list.map((person) => {
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
  });
}

function mapDetailRows(attData, visitsByDate) {
  const items = attData.map((rec) => ({
    id: rec._id,
    attendanceDate: rec.attendanceDate,
    punchInAt: rec.punchInAt,
    punchOutAt: rec.punchOutAt,
    status: rec.status,
    visitCount: visitsByDate.get(rec.attendanceDate) || 0,
  }));
  items.sort((a, b) => String(b.attendanceDate).localeCompare(String(a.attendanceDate)));
  return items;
}

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

  const years = useMemo(() => [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2], [now]);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const [peopleRes, attRes, visitRes] = await Promise.all([
        peopleApi.list({ pageSize: 100 }),
        attendanceApi.list({ from: today, to: today, pageSize: 100 }),
        visitApi.list({ from: today, to: today, pageSize: 100 }),
      ]);
      const people = (peopleRes.data?.data || []).filter((p) => p.jobRole === 'SALESPERSON' || p.role === 'User');
      const sales = people.filter((p) => p.jobRole === 'SALESPERSON');
      const list = sales.length ? sales : people;
      const attMap = new Map();
      (attRes.data?.data || []).forEach((r) => attMap.set(String(r.salesperson?._id || r.salesperson), r));
      const visitMap = new Map();
      (visitRes.data?.data || []).forEach((v) => {
        const id = v.salesperson?._id || v.salesperson;
        if (id && v.checkInAt && v.checkOutAt) visitMap.set(String(id), (visitMap.get(String(id)) || 0) + 1);
      });
      setRows(mapRosterRows(list, attMap, visitMap, today));
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
      const vMap = new Map();
      (visitRes.data?.data || []).forEach((v) => {
        if (v.checkInAt && v.checkOutAt) {
          const d = v.visitDate || String(v.checkInAt).slice(0, 10);
          vMap.set(d, (vMap.get(d) || 0) + 1);
        }
      });
      setDetailRows(mapDetailRows(attRes.data?.data || [], vMap));
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
      <AdminAttendanceDetailView
        selected={selected}
        onBack={() => setSelected(null)}
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        years={years}
        detailRows={detailRows}
        detailLoading={detailLoading}
      />
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ mb: 2, p: 1.5, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
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
