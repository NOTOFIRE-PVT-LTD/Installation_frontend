export function computeDuration(start, end) {
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

export function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const COMMON_PURPOSES = [
  'Site Inspection',
  'Product Demo',
  'Order Collection',
  'Payment Follow-up',
  'Routine Check',
];

export const WEEK_DAYS = [
  { label: 'Mon', offset: 0 },
  { label: 'Tue', offset: 1 },
  { label: 'Wed', offset: 2 },
  { label: 'Thu', offset: 3 },
  { label: 'Fri', offset: 4 },
  { label: 'Sat', offset: 5 },
  { label: 'Sun', offset: 6 },
];

export function createDefaultVisitRow(todayStr) {
  return {
    id: 1,
    date: todayStr,
    dayOffset: 0,
    customer: '',
    plannedTime: '09:30',
    endTime: '11:30',
    purpose: 'Site Inspection',
    notes: '',
  };
}

export function nextVisitTimeWindow(lastVisit) {
  let nextStart = '12:00';
  let nextEnd = '14:00';
  if (lastVisit?.endTime) {
    nextStart = lastVisit.endTime;
    const [h, m] = lastVisit.endTime.split(':').map(Number);
    const endH = Math.min(23, h + 2);
    nextEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return { nextStart, nextEnd };
}