import { formatPlanTime } from '../../utils/readLocation';
import { VISIT_STATUS } from '../../utils/constants';

export function visitLabel(visit) {
  return `${visit.customer?.companyName || 'Visit'} · ${formatPlanTime(visit.plannedTime)}${
    visit.endTime ? `–${formatPlanTime(visit.endTime)}` : ''
  } · ${visit.purpose}`;
}

export function stateLabel(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'Completed';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'In Progress';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'Missed (approved)';
  if (visit.status === VISIT_STATUS.PENDING_APPROVAL) {
    if (visit.fieldClosed && !visit.checkOutAt) return 'Missed (pending admin)';
    return visit.checkOutAt ? 'Pending Approval (Done)' : 'Pending Approval (Out of range)';
  }
  return 'Upcoming';
}

export function stateColor(visit) {
  if (visit.status === VISIT_STATUS.COMPLETED) return 'success';
  if (visit.status === VISIT_STATUS.IN_PROGRESS) return 'primary';
  if (visit.status === VISIT_STATUS.APPROVED_MISSED) return 'default';
  if (visit.status === VISIT_STATUS.PENDING_APPROVAL) return 'warning';
  return 'default';
}

export function visitQueueFlags(visit) {
  const isDone =
    visit.fieldClosed ||
    visit.status === VISIT_STATUS.COMPLETED ||
    visit.status === VISIT_STATUS.APPROVED_MISSED ||
    (visit.status === VISIT_STATUS.PENDING_APPROVAL && Boolean(visit.checkOutAt));
  const needsCheckOut =
    !isDone &&
    (visit.status === VISIT_STATUS.IN_PROGRESS ||
      (visit.status === VISIT_STATUS.PENDING_APPROVAL && Boolean(visit.checkInAt) && !visit.checkOutAt));
  return { isDone, needsCheckOut };
}

export function isSelectionLocked(selected) {
  return selected.some(
    (visit) =>
      visit.status === VISIT_STATUS.IN_PROGRESS ||
      visit.status === VISIT_STATUS.COMPLETED ||
      visit.status === VISIT_STATUS.APPROVED_MISSED ||
      visit.status === VISIT_STATUS.PENDING_APPROVAL
  );
}