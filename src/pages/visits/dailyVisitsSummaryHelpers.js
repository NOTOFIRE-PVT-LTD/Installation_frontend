import { VISIT_STATUS } from '../../utils/constants';

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function isDateToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export function visitStatusColor(status) {
  switch (status) {
    case VISIT_STATUS.COMPLETED:
      return 'success';
    case VISIT_STATUS.IN_PROGRESS:
      return 'info';
    case VISIT_STATUS.PENDING_APPROVAL:
      return 'warning';
    case VISIT_STATUS.APPROVED_MISSED:
      return 'default';
    case VISIT_STATUS.REJECTED:
      return 'error';
    default:
      return 'default';
  }
}

export function expenseStatusColor(status) {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'SUBMITTED':
      return 'info';
    case 'REJECTED':
      return 'error';
    case 'DRAFT':
      return 'warning';
    default:
      return 'default';
  }
}