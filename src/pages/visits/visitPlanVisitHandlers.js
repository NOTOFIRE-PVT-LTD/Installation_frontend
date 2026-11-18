import { addDays, nextVisitTimeWindow } from './visitPlanHelpers';

export function syncVisitsForScope(prev, newScope, planDate, weekStart) {
  return prev.map((v, i) => ({
    ...v,
    date: newScope === 'day' ? planDate : addDays(weekStart, v.dayOffset ?? (i % 6)),
  }));
}

export function syncVisitsForPlanDate(prev, newDate) {
  return prev.map((v) => ({ ...v, date: newDate }));
}

export function syncVisitsForWeekStart(prev, newWeekStart) {
  return prev.map((v) => ({ ...v, date: addDays(newWeekStart, v.dayOffset ?? 0) }));
}

export function buildNewVisitRow(visits, scope, planDate, weekStart) {
  const nextId = visits.length ? Math.max(...visits.map((v) => v.id)) + 1 : 1;
  const { nextStart, nextEnd } = nextVisitTimeWindow(visits[visits.length - 1]);
  const defaultOffset = visits.length % 6;
  return {
    id: nextId,
    date: scope === 'day' ? planDate : addDays(weekStart, defaultOffset),
    dayOffset: defaultOffset,
    customer: '',
    plannedTime: nextStart,
    endTime: nextEnd,
    purpose: 'Site Inspection',
    notes: '',
  };
}

export function patchVisitRow(prev, index, field, value, scope, weekStart) {
  const next = [...prev];
  const target = { ...next[index], [field]: value };
  if (field === 'dayOffset' && scope === 'week') target.date = addDays(weekStart, value);
  next[index] = target;
  return next;
}