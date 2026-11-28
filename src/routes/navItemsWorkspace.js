import {
  faChartLine,
  faClipboardList,
  faHeadset,
  faHouse,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { ROLES } from '../utils/constants';

/** Hub nav: home, dashboards, complaints, users (Super Admin / core admin). */
export const NAV_ITEMS_WORKSPACE = [
  {
    label: 'Home',
    // Inside an app → /home (apps hub). On hub, sidebar remaps to /apps when both portals.
    path: '/home',
    icon: faHouse,
    permission: null,
    roles: [ROLES.ADMIN, ROLES.USER],
    accent: { color: '#563310', bg: '#FAE2B4' },
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: faChartLine,
    permission: 'dashboard',
    roles: [ROLES.ADMIN],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'Dashboard',
    path: '/complaints/dashboard',
    icon: faChartLine,
    permission: 'complaints',
    userPermission: 'complaints',
    roles: [ROLES.USER],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
  },
  {
    label: 'Complaints',
    path: '/complaints/desk',
    icon: faHeadset,
    permission: 'complaints',
    userPermission: 'complaints',
    roles: [ROLES.USER],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
  },
  {
    label: 'Complaint Resolution',
    path: '/complaints/dashboard',
    icon: faHeadset,
    permission: 'complaints',
    roles: [ROLES.ADMIN],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
  },
  {
    label: 'All Tickets',
    path: '/complaints',
    icon: faClipboardList,
    permission: 'complaints',
    roles: [ROLES.ADMIN],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
  },
  {
    label: 'Users',
    path: '/users',
    icon: faUsers,
    permission: 'users',
    roles: [ROLES.ADMIN],
    accent: { color: '#8b5cf6', bg: '#f3e8ff' },
  },
];