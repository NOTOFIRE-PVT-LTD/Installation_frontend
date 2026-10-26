import {
  faAddressBook,
  faBuildingColumns,
  faChartLine,
  faClipboardCheck,
  faClipboardList,
  faCommentDots,
  faFileContract,
  faFileInvoiceDollar,
  faFolderOpen,
  faBoxesStacked,
  faBoxOpen,
  faLayerGroup,
  faUsers,
  faReceipt,
  faFileInvoice,
  faFileSignature,
  faTruck,
  faMoneyBillWave,
  faClockRotateLeft,
  faRoute,
  faClock,
  faCalendarDay,
  faCalendarPlus,
  faUmbrella,
  faWallet,
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
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
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
    label: 'Salesperson Tracking',
    path: '/salesperson-tracking',
    icon: faRoute,
    permission: 'salespersonTracking',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.ADMIN],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'Attendance',
    path: '/attendance',
    icon: faClock,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
  {
    label: 'Visit Plan',
    path: '/visits',
    icon: faCalendarDay,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
  },
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
    label: 'Create Visit',
    path: '/visits/new',
    icon: faCalendarPlus,
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
  {
    label: 'Approvals',
    path: '/my-approvals',
    icon: faClipboardCheck,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#DC1F2E', bg: '#FFE8EA' },
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
    label: 'Tender',
    path: '/tenders',
    icon: faFileContract,
    permission: 'tenders',
    roles: [ROLES.ADMIN],
    accent: { color: '#f59e0b', bg: '#fff7ed' },
  },
  {
    label: 'Inspection',
    path: '/inspections',
    icon: faClipboardList,
    permission: 'inspections',
    roles: [ROLES.ADMIN],
    accent: { color: '#ef4444', bg: '#fef2f2' },
  },
  {
    label: 'Financial Document',
    path: '/financial-documents',
    icon: faFileInvoiceDollar,
    permission: 'financialDocuments',
    roles: [ROLES.ADMIN],
    accent: { color: '#0d9488', bg: '#f0fdfa' },
  },
  {
    label: 'Billing',
    path: '/billing',
    icon: faReceipt,
    permission: 'billing',
    roles: [ROLES.ADMIN],
    accent: { color: '#c2410c', bg: '#fff7ed' },
  },
  {
    label: 'Quotations',
    path: '/quotations',
    icon: faFileInvoice,
    permission: 'quotations',
    roles: [ROLES.ADMIN],
    accent: { color: '#4f46e5', bg: '#eef2ff' },
  },
  {
    label: 'Proforma Invoices',
    path: '/proforma-invoices',
    icon: faFileSignature,
    permission: 'proformaInvoices',
    roles: [ROLES.ADMIN],
    accent: { color: '#0369a1', bg: '#e0f2fe' },
  },
  {
    label: 'Delivery Challans',
    path: '/delivery-challans',
    icon: faTruck,
    permission: 'deliveryChallans',
    roles: [ROLES.ADMIN],
    accent: { color: '#0e7490', bg: '#ecfeff' },
  },
  {
    label: 'Atlanta Payments',
    path: '/atlanta-payments',
    icon: faMoneyBillWave,
    permission: 'atlantaPayments',
    roles: [ROLES.ADMIN, ROLES.USER],
    accent: { color: '#dc2626', bg: '#fef2f2' },
  },
  {
    label: 'Items Master',
    path: '/items-master',
    icon: faBoxOpen,
    permission: 'itemsMaster',
    roles: [ROLES.ADMIN],
    accent: { color: '#db2777', bg: '#fdf2f8' },
  },
  {
    label: 'Stock Items',
    path: '/stock-items',
    icon: faBoxesStacked,
    permission: 'stockItems',
    roles: [ROLES.ADMIN],
    accent: { color: '#ea580c', bg: '#fff7ed' },
  },
  {
    label: 'BOM',
    path: '/bom',
    icon: faLayerGroup,
    permission: 'bom',
    roles: [ROLES.ADMIN],
    accent: { color: '#0284c7', bg: '#e0f2fe' },
  },
  {
    label: 'Accounts',
    path: '/accounts',
    icon: faBuildingColumns,
    permission: 'accounts',
    roles: [ROLES.ADMIN],
    accent: { color: '#7c3aed', bg: '#f3ecff' },
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
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: faClockRotateLeft,
    permission: 'auditLogs',
    roles: [ROLES.ADMIN],
    accent: { color: '#6366f1', bg: '#eef2ff' },
  },
];

// Admins are gated by their permission flag. Installers default to allowed (no Permission doc =
// full access) but respect an explicit false once an Admin has restricted that module for them.
export function isNavItemAllowed(item, user, permissions) {
  if (!item.roles.includes(user?.role)) return false;
  if (item.jobRole && user?.role !== ROLES.ADMIN && user?.jobRole !== item.jobRole) return false;
  if (user?.role === ROLES.ADMIN) return Boolean(permissions?.[item.permission]);
  const key = item.userPermission || item.permission;
  if (key === 'atlantaPayments') return Boolean(permissions?.[key]);
  return permissions ? permissions[key] !== false : true;
}

// Where to land a user right after they log in (or an admin impersonates them) —
// the first nav item their role/permissions actually grant access to.
export function getDefaultLandingPath(user, permissions) {
  if (!user) return '/login';
  if (user.jobRole === 'SALESPERSON') return '/attendance';
  const eligible = NAV_ITEMS.find((item) => isNavItemAllowed(item, user, permissions));
  return eligible ? eligible.path : '/profile';
}

export function canOpenPath(pathname, user, permissions) {
  if (!pathname || pathname === '/login' || pathname === '/403' || pathname === '/404') return false;
  if (pathname === '/' || pathname === '/profile') return true;
  const match = NAV_ITEMS.filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  ).sort((a, b) => b.path.length - a.path.length)[0];
  return match ? isNavItemAllowed(match, user, permissions) : false;
}
