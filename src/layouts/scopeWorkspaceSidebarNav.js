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

/** Hub: Home + granted apps. Inside an app: Home + that app (Home omitted for single-app). */
export function scopeWorkspaceSidebarNav(
  items,
  pathname,
  { bothApps, hubApps = [] } = {},
) {
  const path = String(pathname || '').split('?')[0];
  const isHub = path === '/home' || path === '/' || path === '';
  const home = homeNavItem(items, { bothApps, isHub });
  const singleApp = hubApps.length <= 1;

  if (isHub || path === '/profile') {
    if (singleApp && hubApps.length === 1) {
      return hubApps.map((app) => ({ ...app, section: null }));
    }
    return [
      home,
      ...hubApps.map((app) => ({ ...app, section: null })),
    ];
  }

  const owner = pathOwnerPermission(path);
  const withoutHome = items.filter((item) => item.path !== '/home' && item.path !== '/apps');
  if (!owner) {
    return singleApp ? withoutHome : [home, ...withoutHome];
  }

  const appItems = withoutHome.filter((item) => {
    const itemOwner = pathOwnerPermission(item.path);
    if (itemOwner) return itemOwner === owner;
    return item.permission === owner || item.userPermission === owner;
  });
  return singleApp ? appItems : [home, ...appItems];
}
