import { isSuperAdminUser } from './navUser';

// Path → owning app permission. Blocks nav/config mistakes that hang one app's
// screens under another app's permission (e.g. Phone Intake under attendance).
const APP_PATH_OWNERS = [
  { prefix: '/complaints', permission: 'complaints' },
  { prefix: '/attendance', permission: 'attendance' },
  { prefix: '/salesperson-tracking', permission: 'attendance' },
  { prefix: '/visits', permission: 'attendance' },
  { prefix: '/leave', permission: 'attendance' },
  { prefix: '/expenses', permission: 'attendance' },
  { prefix: '/my-approvals', permission: 'attendance' },
  { prefix: '/shipping', permission: 'shipping' },
  { prefix: '/import-control', permission: 'importControl' },
  { prefix: '/contractor-attendance', permission: 'contractorAttendance' },
];

export function pathOwnerPermission(path) {
  const base = String(path || '').split('?')[0];
  const hit = APP_PATH_OWNERS.find((o) => base === o.prefix || base.startsWith(`${o.prefix}/`));
  return hit?.permission || null;
}

function isAttendanceFamilyPermission(key) {
  return key === 'attendance' || key === 'salespersonTracking';
}

/** True when this permission bag grants the owning app for a path. */
export function userHasAppPermission(permissions, ownerKey) {
  if (!ownerKey) return true;
  if (ownerKey === 'attendance') {
    return Boolean(permissions?.attendance || permissions?.salespersonTracking);
  }
  if (ownerKey === 'contractorAttendance') {
    return Boolean(permissions?.contractorAttendance);
  }
  return Boolean(permissions?.[ownerKey]);
}

/**
 * Keep non–Super Admin users inside apps they were granted.
 * Never soft-allow Attendance/Complaints/Shipping paths just because the URL looks familiar.
 */
export function canStayOnWorkspacePath(pathname, user, permissions, navItems = []) {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  const path = String(pathname || '');
  if (path === '/profile' || path === '/home' || path === '/dashboard' || path === '/403' || path === '/404') {
    return true;
  }

  const owner = pathOwnerPermission(path);
  if (owner) return userHasAppPermission(permissions, owner);

  return navItems.some((item) => {
    const itemPath = String(item.path || '').split('?')[0];
    return path === itemPath || path.startsWith(`${itemPath}/`);
  });
}

/** True when a nav item's path belongs to app A but its permission flag is for app B. */
export function navItemCrossesAppBoundary(item) {
  const owner = pathOwnerPermission(item?.path);
  if (!owner || item?.permission == null) return false;
  if (owner === 'attendance') return !isAttendanceFamilyPermission(item.permission);
  return item.permission !== owner;
}

export function assertNavAppBoundaries(items) {
  const walk = (list) => {
    for (const item of list || []) {
      if (navItemCrossesAppBoundary(item)) {
        // eslint-disable-next-line no-console
        console.error(
          `[RBAC] "${item.label}" (${item.path}) is owned by "${pathOwnerPermission(item.path)}" but permission="${item.permission}" — apps must not mix`
        );
      }
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
}