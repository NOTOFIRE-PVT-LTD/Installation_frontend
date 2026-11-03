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
  faHeadset,
  faHouse,
} from '@fortawesome/free-solid-svg-icons';
import { ROLES } from '../utils/constants';
import { IMPORT_TABS, SHIPPING_TABS } from '../pages/shipping/companionTabs';

// permission: null means "no admin permission required"
// superAdminOnly: true means only visible on Super Admin's sidebar
// Attendance is a full workspace app visible to Super Admin and any user/admin with attendance access
export const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/home',
    icon: faHouse,
    permission: null,
    roles: [ROLES.ADMIN],
    superAdminOnly: true,
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
    children: [
      {
        label: 'Complaints',
        path: '/complaints',
        icon: faClipboardList,
        permission: 'complaints',
        roles: [ROLES.ADMIN],
        accent: { color: '#d4a34e', bg: '#fffdf0' },
      },
    ],
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
    label: 'Attendance',
    path: '/attendance',
    icon: faClock,
    permission: 'attendance',
    userPermission: 'attendance',
    roles: [ROLES.ADMIN, ROLES.USER],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
  },
  {
    label: 'Shipping Control',
    path: '/shipping',
    icon: faTruck,
    permission: 'shipping',
    expandChildrenInSidebar: true,
    roles: [ROLES.ADMIN, ROLES.USER],
    userPermission: 'shipping',
    accent: { color: '#0f766e', bg: '#ccfbf1' },
    children: SHIPPING_TABS.map((tab) => ({
      label: tab.label,
      path: `/shipping?tab=${tab.id}`,
      icon: faTruck,
      permission: 'shipping',
      userPermission: 'shipping',
      roles: [ROLES.ADMIN, ROLES.USER],
      accent: { color: '#0f766e', bg: '#ccfbf1' },
    })),
  },
  {
    label: 'Import Control',
    path: '/import-control',
    icon: faBoxOpen,
    permission: 'importControl',
    expandChildrenInSidebar: true,
    roles: [ROLES.ADMIN, ROLES.USER],
    userPermission: 'importControl',
    accent: { color: '#0369a1', bg: '#e0f2fe' },
    children: IMPORT_TABS.map((tab) => ({
      label: tab.label,
      path: `/import-control?tab=${tab.id}`,
      icon: faBoxOpen,
      permission: 'importControl',
      userPermission: 'importControl',
      roles: [ROLES.ADMIN, ROLES.USER],
      accent: { color: '#0369a1', bg: '#e0f2fe' },
    })),
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
    label: 'Phone Intake',
    path: '/complaints/new',
    icon: faHeadset,
    permission: 'attendance',
    userPermission: 'attendance',
    jobRole: 'SALESPERSON',
    roles: [ROLES.USER],
    accent: { color: '#d4a34e', bg: '#fffdf0' },
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
    userPermission: 'complaints',
    roles: [ROLES.ADMIN, ROLES.USER],
    accent: { color: '#6366f1', bg: '#eef2ff' },
  },
];

export function isSuperAdminUser(user) {
  return (
    user?.adminType === 'SUPER_ADMIN' ||
    user?.email === 'admin@nfsite.com' ||
    user?.email === 'super.admin@demo.local'
  );
}

export function expandNavItems(items, user, permissions) {
  const superAdmin = isSuperAdminUser(user);
  return items.flatMap((item) => {
    if (!isNavItemAllowed(item, user, permissions)) return [];
    if (!superAdmin && item.expandChildrenInSidebar && item.children?.length) {
      return item.children.filter((child) => isNavItemAllowed(child, user, permissions));
    }
    return [item];
  });
}

// Admins are gated strictly by their permission flag. If an admin has 2 apps granted, they only see those 2 apps.
export function isNavItemAllowed(item, user, permissions) {
  if (!user) return false;

  const isSuperAdmin = isSuperAdminUser(user);

  // Regular Admins & Users: hide Super-Admin-only centralized hubs
  if (!isSuperAdmin && item.superAdminOnly) return false;

  // Role check
  if (!item.roles.includes(user?.role)) return false;

  // JobRole check: if item is scoped to a specific jobRole (e.g. SALESPERSON), user must match that jobRole
  if (item.jobRole && user?.jobRole !== item.jobRole) return false;

  // Admin permission evaluation:
  // Super Admin gets access to all top-level apps.
  // Particular admin login only sees the apps they have explicit access to.
  if (user?.role === ROLES.ADMIN) {
    if (isSuperAdmin) return true;
    if (item.permission == null) return !item.superAdminOnly;
    if (item.permission === 'attendance' || item.permission === 'salespersonTracking') {
      return Boolean(permissions?.attendance || permissions?.salespersonTracking);
    }
    if (item.permission === 'complaints') {
      return Boolean(permissions?.complaints);
    }
    return Boolean(permissions?.[item.permission]);
  }

  // Non-Admin (User) permission evaluation:
  // User only sees the apps they have explicit permission for.
  const key = item.userPermission || item.permission;
  if (!key) return true;
  // Salespeople already create/see tickets via Phone Intake — no extra Complaints nav.
  if (user?.jobRole === 'SALESPERSON' && key === 'complaints') return false;
  if (key === 'attendance' || key === 'salespersonTracking') {
    return Boolean(permissions?.attendance || permissions?.salespersonTracking);
  }
  if (key === 'complaints') return Boolean(permissions?.complaints);
  return Boolean(permissions?.[key]);
}

export function flattenNavItems(items = NAV_ITEMS) {
  return items.flatMap((item) => [item, ...(item.children || [])]);
}

// Where to land a user right after they log in: first permitted nav item
export function getDefaultLandingPath(user, permissions) {
  // Unauthenticated callers should use goToCentralLogin() — keep a safe internal fallback.
  if (!user) return '/central-sso';
  // Portal / Workspace SUPER_ADMIN — never the field-engineer complaints home
  // (jobRole still defaults to INSTALLER on Admin rows in Mongo).
  if (isSuperAdminUser(user)) {
    return '/home';
  }
  if (user.jobRole === 'SALESPERSON') return '/attendance';
  if (user.jobRole === 'INSTALLER' || (user.role === 'User' && permissions?.complaints)) {
    return '/complaints/dashboard';
  }
  if (user.adminType === 'COMPLAINT_COORDINATOR') return '/complaints/dashboard';
  const eligible = NAV_ITEMS.find((item) => isNavItemAllowed(item, user, permissions));
  return eligible ? eligible.path : '/profile';
}

export function canOpenPath(pathname, user, permissions) {
  if (!pathname || pathname === '/login' || pathname === '/403' || pathname === '/404') return false;
  if (pathname === '/' || pathname === '/profile') return true;

  const isSuperAdmin =
    user?.adminType === 'SUPER_ADMIN' ||
    user?.email === 'admin@nfsite.com' ||
    user?.email === 'super.admin@demo.local';
  if (isSuperAdmin) return true;

  const match = flattenNavItems().filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  ).sort((a, b) => b.path.length - a.path.length)[0];

  return match ? isNavItemAllowed(match, user, permissions) : false;
}
