export function formatPortalRole(role) {
  if (!role) return '—';
  return String(role)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPortalApps(apps = [], workspaceApps = []) {
  const parts = [];
  if (apps.includes('pnl')) parts.push('P&L');
  if (workspaceApps?.length) {
    parts.push(...workspaceApps);
  } else if (apps.includes('workspace')) {
    parts.push('Workspace');
  }
  return parts.length ? parts.join(' · ') : '—';
}

export function filterPortalUsers(users, search, appFilter = 'all') {
  let list = users;
  if (appFilter === 'workspace') {
    list = list.filter((u) => u.apps?.includes('workspace'));
  } else if (appFilter === 'pnl') {
    list = list.filter((u) => u.apps?.includes('pnl'));
  }
  const q = String(search || '').trim().toLowerCase();
  if (!q) return list;
  return list.filter((u) => {
    const hay = [
      u.name,
      u.email,
      u.phone,
      u.role,
      ...(u.apps || []),
      ...(u.workspaceApps || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function portalUsersToCsv(users) {
  const header = ['Name', 'Email', 'Mobile', 'Role', 'App Access', 'Status'];
  const rows = users.map((u) => [
    u.name || '',
    u.email || '',
    u.phone || '',
    formatPortalRole(u.role),
    formatPortalApps(u.apps, u.workspaceApps),
    u.active === false ? 'Inactive' : 'Active',
  ]);
  return [header, ...rows]
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadPortalUsersCsv(users) {
  const blob = new Blob([portalUsersToCsv(users)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'centralisation-users.csv';
  a.click();
  URL.revokeObjectURL(url);
}
