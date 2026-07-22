import {
  faAddressBook,
  faChartLine,
  faClipboardCheck,
  faCommentDots,
  faFolderOpen,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { ROLES } from '../utils/constants';

// permission: null means "no admin permission required" (e.g. always visible to Admins, or role-gated instead)
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: faChartLine,
    permission: 'dashboard',
    roles: [ROLES.ADMIN],
    accent: { color: '#2f6fed', bg: '#eaf2ff' },
  },
  {
    label: 'Users',
    path: '/users',
    icon: faUsers,
    permission: 'users',
    roles: [ROLES.ADMIN],
    accent: { color: '#8b5cf6', bg: '#f3e8ff' },
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: faFolderOpen,
    permission: 'projects',
    roles: [ROLES.ADMIN, ROLES.USER],
    accent: { color: '#14b8a6', bg: '#e6fffb' },
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: faClipboardCheck,
    permission: 'claimApprovals',
    roles: [ROLES.ADMIN],
    accent: { color: '#0ea5e9', bg: '#e6f7ff' },
  },
  {
    label: 'WhatsApp Logs',
    path: '/whatsapp-logs',
    icon: faCommentDots,
    permission: 'users',
    roles: [ROLES.ADMIN],
    accent: { color: '#22c55e', bg: '#ecfdf5' },
  },
  {
    label: 'Numbers',
    path: '/numbers',
    icon: faAddressBook,
    permission: 'numbers',
    roles: [ROLES.ADMIN],
    accent: { color: '#06b6d4', bg: '#e7fbff' },
  },
];

// Admins are gated by their permission flag. Installers default to allowed (no Permission doc =
// full access) but respect an explicit false once an Admin has restricted that module for them.
export function isNavItemAllowed(item, user, permissions) {
  if (!item.roles.includes(user?.role)) return false;
  if (user?.role === ROLES.ADMIN) return Boolean(permissions?.[item.permission]);
  return permissions ? permissions[item.permission] !== false : true;
}

// Where to land a user right after they log in (or an admin impersonates them) —
// the first nav item their role/permissions actually grant access to.
export function getDefaultLandingPath(user, permissions) {
  if (!user) return '/login';
  const eligible = NAV_ITEMS.find((item) => isNavItemAllowed(item, user, permissions));
  return eligible ? eligible.path : '/profile';
}
