import { VISIT_STATUS } from '../../utils/constants';

export function getVisitDetailCapabilities(visit, proximity, isSalesperson) {
  const status = visit.status;
  const distance = proximity?.distanceM;
  const within = proximity?.withinGeofence ?? true;
  const isInitial = proximity?.isInitialSetup;
  const radius = visit.allowedRadiusMeters || 100;
  const isOutOfRange = !isInitial && distance != null && !within;

  const canCheckIn =
    isSalesperson &&
    (status === VISIT_STATUS.PLANNED || status === VISIT_STATUS.REJECTED) &&
    !visit.checkInAt;

  const canCheckOut =
    isSalesperson &&
    !visit.checkOutAt &&
    (status === VISIT_STATUS.IN_PROGRESS ||
      (status === VISIT_STATUS.PENDING_APPROVAL && Boolean(visit.checkInAt)));

  const canMiss =
    isSalesperson &&
    [VISIT_STATUS.PLANNED, VISIT_STATUS.IN_PROGRESS, VISIT_STATUS.REJECTED, VISIT_STATUS.PENDING_APPROVAL].includes(
      status
    ) &&
    !visit.checkOutAt;

  return { status, distance, within, isInitial, radius, isOutOfRange, canCheckIn, canCheckOut, canMiss };
}