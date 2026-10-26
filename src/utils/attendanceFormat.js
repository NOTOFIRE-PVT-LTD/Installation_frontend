export function formatIstTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

export function formatIstDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

export function formatIstDate(yyyyMmDd) {
  if (!yyyyMmDd) return '—';
  const [year, month, day] = String(yyyyMmDd).split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
  }).format(new Date(Date.UTC(year, month - 1, day, 6)));
}

export function formatDuration(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return '—';
  const total = Math.max(0, Math.round(Number(minutes)));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')} hours`;
}

export function minutesBetween(punchInAt, punchOutAt, now = Date.now()) {
  if (!punchInAt) return null;
  const end = punchOutAt ? new Date(punchOutAt).getTime() : now;
  return Math.max(0, Math.round((end - new Date(punchInAt).getTime()) / 60000));
}

export const ATTENDANCE_PHASE = {
  NOT_STARTED: 'NOT_STARTED',
  WORKING: 'WORKING',
  COMPLETED: 'COMPLETED',
  MISSING: 'MISSING',
  INCOMPLETE: 'INCOMPLETE',
  PENDING: 'PENDING',
};

export const PHASE_LABELS = {
  NOT_STARTED: 'Not Started',
  WORKING: 'Working',
  COMPLETED: 'Completed',
  MISSING: 'Missing Attendance',
  INCOMPLETE: 'Incomplete Attendance',
  PENDING: 'Pending Admin Approval',
};

export const PHASE_COLORS = {
  COMPLETED: '#9B1520',
  WORKING: '#DC1F2E',
  PENDING: '#E8B931',
  INCOMPLETE: '#E8B931',
  MISSING: '#E8B931',
  NOT_STARTED: '#E8B931',
};

export function formatCoords(lat, lng) {
  if (lat == null || lng == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

export function dayHasLocation(day) {
  return Boolean(formatCoords(day?.punchInLat, day?.punchInLng) || formatCoords(day?.punchOutLat, day?.punchOutLng));
}
