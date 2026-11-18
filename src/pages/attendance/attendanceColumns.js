import { formatDuration, formatIstTime } from '../../utils/attendanceFormat';

export const ATTENDANCE_COLUMNS = [
  {
    field: 'salesperson',
    headerName: 'Person',
    minWidth: 180,
    valueGetter: (_value, row) => row.salesperson?.name || '—',
  },
  { field: 'attendanceDate', headerName: 'Date', minWidth: 130 },
  {
    field: 'punchInAt',
    headerName: 'Punch in',
    minWidth: 140,
    valueGetter: (_value, row) => formatIstTime(row.punchInAt),
  },
  {
    field: 'punchOutAt',
    headerName: 'Punch out',
    minWidth: 140,
    valueGetter: (_value, row) => formatIstTime(row.punchOutAt),
  },
  {
    field: 'durationMin',
    headerName: 'Duration',
    minWidth: 110,
    valueGetter: (_value, row) => formatDuration(row.durationMin),
  },
  { field: 'status', headerName: 'Status', minWidth: 110 },
];

