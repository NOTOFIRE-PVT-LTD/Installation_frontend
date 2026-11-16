import { VISIT_STATUS } from '../../utils/constants';

export function istTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function formatDateLabel(dateStr) {
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

export function statusColor(status) {
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

export const adminVisitsDayBoardFieldSx = {
  minWidth: 150,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFDF8',
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.45)' },
  },
};

export function groupVisitsByDay(visits) {
  const map = new Map();
  for (const visit of visits) {
    const d = visit.visitDate || '—';
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(visit);
  }
  return Array.from(map.entries())
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    .map(([date, items]) => {
      const names = [...new Set(items.map((v) => v.salesperson?.name).filter(Boolean))];
      return { date, items, names };
    });
}

export function salespeopleOnVisitToday(visits, today) {
  const names = new Set();
  for (const visit of visits) {
    if (visit.visitDate !== today) continue;
    if (visit.salesperson?.name) names.add(visit.salesperson.name);
  }
  return [...names];
}