import {
  faCalendarDay,
  faCalendarPlus,
  faRoute,
  faUmbrella,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { ROLES } from '../utils/constants';

/** Field salesperson quick links (visits, leave, expenses). */
export const NAV_ITEMS_SALESPERSON = [
  {
    label: 'Today’s visits',
    path: '/visits/today',
    icon: faRoute,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'Plan Visits',
    path: '/visits/new',
    icon: faCalendarPlus,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'All Visits',
    path: '/visits',
    icon: faCalendarDay,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'Leave',
    path: '/leave',
    icon: faUmbrella,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'My Expenses',
    path: '/expenses',
    icon: faWallet,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
];