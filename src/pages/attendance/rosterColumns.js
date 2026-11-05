import { formatIstDate, formatIstTime } from '../../utils/attendanceFormat';

export function istTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function monthBounds(year, month) {
  const mm = String(month).padStart(2, '0');
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(last).padStart(2, '0')}`,
  };
}

export const MONTHS = [
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

export const ROSTER_COLUMNS = [
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

export const DETAIL_COLUMNS = [
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
