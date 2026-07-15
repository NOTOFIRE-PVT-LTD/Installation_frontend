import { CLAIM_STATUS } from './constants';

export function daysBetween(a, b) {
  return Math.round((new Date(a) - new Date(b)) / 86400000);
}

/**
 * Stage-based work done % for a single station.
 * Aligns with dashboard backend calculation.
 */
export function stationWorkDonePct(station) {
  if (!station) return 0;

  if (station.claimStatus === CLAIM_STATUS.PAID) return 100;
  if (station.claimStatus === CLAIM_STATUS.APPROVED) return 90;
  if (station.claimStatus === CLAIM_STATUS.PENDING_APPROVAL) return 80;
  if (station.commissioningDate) return 70;
  if (station.completionDate) return 50;

  if (station.startDate) {
    const done = station.completePhotos?.length || 0;
    const remaining = station.remainingPhotos?.length || 0;
    const total = done + remaining;
    const photoRatio = total > 0 ? done / total : 0;
    return Math.round(20 + photoRatio * 25); // 20–45% while installation is underway
  }

  return 0;
}

/** Project work done = average of all station work-done percentages */
export function projectProgress(project) {
  const stations = project?.stations || [];
  const total = stations.length;
  if (!total) {
    if (typeof project?.completion === 'number') {
      return {
        pct: project.completion,
        commissioned: project.commissioned || 0,
        total: project.stationCount || 0,
      };
    }
    return { pct: 0, commissioned: 0, total: 0 };
  }

  const commissioned = stations.filter((s) => s.commissioningDate).length;
  const pct = Math.round(stations.reduce((sum, s) => sum + stationWorkDonePct(s), 0) / total);
  return { pct, commissioned, total };
}

export function projectStatusColor(project) {
  const { pct } = projectProgress(project);
  if (pct >= 100) return 'success';
  if (!project?.targetDate) return 'info';
  const today = new Date();
  const target = new Date(project.targetDate);
  if (today > target) return 'error';
  const daysLeft = daysBetween(target, today);
  if (daysLeft <= 30) return 'warning';
  return 'info';
}

export function daysLeftLabel(project) {
  if (!project?.targetDate) return '—';
  const today = new Date();
  const target = new Date(project.targetDate);
  const d = daysBetween(target, today);
  if (Number.isNaN(d)) return '—';
  if (d < 0) return `${Math.abs(d)} days overdue`;
  if (d === 0) return 'Due today';
  return `${d} days left`;
}

// -1 = rejected, 0-6 index into PROJECT_STAGE_LABELS
export function stationStage(station) {
  if (!station) return 0;
  if (station.claimStatus === CLAIM_STATUS.PAID) return 6;
  if (station.claimStatus === CLAIM_STATUS.APPROVED) return 5;
  if (station.claimStatus === CLAIM_STATUS.PENDING_APPROVAL) return 4;
  if (station.claimStatus === CLAIM_STATUS.REJECTED) return -1;
  if (station.commissioningDate) return 3;
  if (station.completionDate) return 2;
  if (station.startDate) return 1;
  return 0;
}

export function claimStatusColor(status) {
  return (
    {
      [CLAIM_STATUS.NOT_SUBMITTED]: 'default',
      [CLAIM_STATUS.PENDING_APPROVAL]: 'warning',
      [CLAIM_STATUS.APPROVED]: 'info',
      [CLAIM_STATUS.PAID]: 'success',
      [CLAIM_STATUS.REJECTED]: 'error',
    }[status] || 'default'
  );
}

export function stationStatusChipColor(stage) {
  if (stage === -1) return 'error';
  if (stage >= 6) return 'success';
  if (stage >= 3) return 'info';
  return 'default';
}
