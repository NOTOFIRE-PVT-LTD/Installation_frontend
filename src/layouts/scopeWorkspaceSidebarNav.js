import { pathOwnerPermission } from '../routes/appPathOwners';

function homeNavItem(items, { bothApps, isHub }) {
  const base = items.find((item) => item.path === '/home') || {
    label: 'Home',
    path: '/home',
  };
  // Hub Home → Centralisation when user has P&L + Workspace.
  return {
    ...base,
    path: isHub && bothApps ? '/apps' : '/home',
    section: null,
  };
}

/** Hub: Home + granted apps. Inside an app: Home + that app only. */
export function scopeWorkspaceSidebarNav(
  items,
  pathname,
  { bothApps, hubApps = [] } = {},
) {
  const path = String(pathname || '').split('?')[0];
  const isHub = path === '/home' || path === '/' || path === '';
  const home = homeNavItem(items, { bothApps, isHub });

  if (isHub || path === '/profile') {
    return [
      home,
      ...hubApps.map((app) => ({ ...app, section: null })),
    ];
  }

  const owner = pathOwnerPermission(path);
  if (!owner) return [home, ...items.filter((item) => item.path !== '/home')];

  const appItems = items.filter((item) => {
    if (item.path === '/home' || item.path === '/apps') return false;
    const itemOwner = pathOwnerPermission(item.path);
    if (itemOwner) return itemOwner === owner;
    return item.permission === owner || item.userPermission === owner;
  });
  return [home, ...appItems];
}
