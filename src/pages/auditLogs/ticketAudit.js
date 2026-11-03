export function personMatchesLog(entry, person) {
  if (!person) return true;
  const id = String(person._id || person.id || '');
  const name = String(person.name || '').trim().toLowerCase();
  const byId = String(entry.changedBy?._id || entry.changedBy || entry.actor?._id || entry.actor || '');
  const byName = String(entry.changedByName || entry.actorName || '').trim().toLowerCase();
  if (id && byId === id) return true;
  if (name && byName === name) return true;
  return false;
}

export function isStatusActivity(entry) {
  const text = `${entry.action || ''} ${entry.description || ''} ${entry.newValue || ''} ${entry.toStatus || ''}`.toUpperCase();
  return ['IN_PROGRESS', 'PENDING', 'RESOLVED', 'ASSIGNED', 'STATUS'].some((key) => text.includes(key));
}

export function buildTicketStatusLogs(complaint, person) {
  const history = Array.isArray(complaint?.statusHistory) ? complaint.statusHistory : [];
  const fromHistory = history
    .filter((entry) => personMatchesLog(entry, person))
    .map((entry) => ({
      key: String(entry._id || `${entry.toStatus}-${entry.timestamp}`),
      from: entry.fromStatus || '',
      to: entry.toStatus || '',
      by: entry.changedByName || 'Staff',
      reason: entry.reason || '',
      at: entry.timestamp || entry.createdAt,
      source: 'status',
    }));

  if (fromHistory.length) {
    return fromHistory.sort((a, b) => new Date(a.at) - new Date(b.at));
  }

  const activities = Array.isArray(complaint?.activityLogs) ? complaint.activityLogs : [];
  return activities
    .filter((entry) => isStatusActivity(entry) && personMatchesLog(entry, person))
    .map((entry) => ({
      key: String(entry._id || `${entry.action}-${entry.timestamp}`),
      from: entry.oldValue || '',
      to: entry.newValue || '',
      by: entry.actorName || 'Staff',
      reason: entry.description || '',
      at: entry.timestamp || entry.createdAt,
      source: 'activity',
    }))
    .sort((a, b) => new Date(a.at) - new Date(b.at));
}
