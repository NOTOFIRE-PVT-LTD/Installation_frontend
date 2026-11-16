import { ROLES } from '../utils/constants';
import { navItemCrossesAppBoundary, pathOwnerPermission } from './appPathOwners';
import { NAV_ITEMS } from './navItems';
import { isSuperAdminUser } from './navUser';

/** Sidebar app heading for Admin/User multi-app menus (Super Admin stays flat). */
const APP_SECTION_LABELS = {
  attendance: 'Attendance',
  salespersonTracking: 'Attendance',
  contractorAttendance: 'Contractor Attendance',
  complaints: 'Complaints',
  shipping: 'Shipping Control',
  importControl: 'Import Control',
  dashboard: 'Dashboard',
  users: 'Users',
  projects: 'Projects',
  tenders: 'Tender',
  inspections: 'Inspection',
  financialDocuments: 'Financial Document',
  billing: 'Billing',
  quotations: 'Quotations',
  proformaInvoices: 'Proforma Invoices',
  deliveryChallans: 'Delivery Challans',
  atlantaPayments: 'Atlanta Payments',
  itemsMaster: 'Items Master',
  stockItems: 'Stock Items',
  bom: 'BOM',
  accounts: 'Accounts',
  claimApprovals: 'Approvals',
  numbers: 'Numbers',
  auditLogs: 'Audit Logs',
};

export function navAppSection(item) {
  if (item?.section) return item.section;
  const owner = pathOwnerPermission(item?.path);
  if (owner && APP_SECTION_LABELS[owner]) return APP_SECTION_LABELS[owner];
  const key = item?.permission || item?.userPermission;
  if (key && APP_SECTION_LABELS[key]) return APP_SECTION_LABELS[key];
  return item?.label || null;
}

function expandSuperAdminItem(item, user, permissions) {
  if (!isNavItemAllowed(item, user, permissions)) return [];
  return [item];
}

function expandSidebarChildren(item, user, permissions) {
  const kids = item.children.filter((child) => isNavItemAllowed(child, user, permissions));
  if (kids.length) {
    return kids.map((child) => ({ ...child, section: item.label }));
  }
  return null;
}

function expandRegularNavItem(item, user, permissions) {
  if (!isNavItemAllowed(item, user, permissions)) return [];
  if (item.expandChildrenInSidebar && item.children?.length) {
    const expandedKids = expandSidebarChildren(item, user, permissions);
    if (expandedKids) return expandedKids;
  }
  return [{ ...item, section: navAppSection(item) }];
}

function stripSingleAppSections(expanded) {
  const sections = new Set(expanded.map((i) => i.section).filter(Boolean));
  if (sections.size <= 1) {
    return expanded.map(({ section: _section, ...rest }) => rest);
  }
  return expanded;
}

export function expandNavItems(items, user, permissions) {
  const superAdmin = isSuperAdminUser(user);
  const expanded = items.flatMap((item) =>
    superAdmin ? expandSuperAdminItem(item, user, permissions) : expandRegularNavItem(item, user, permissions)
  );
  if (superAdmin) return expanded;
  return stripSingleAppSections(expanded);
}

function evaluateAdminNavPermission(item, permissions, isSuperAdmin) {
  if (isSuperAdmin) return true;
  if (item.permission == null) return !item.superAdminOnly;
  if (item.permission === 'attendance' || item.permission === 'salespersonTracking') {
    return Boolean(permissions?.attendance || permissions?.salespersonTracking);
  }
  if (item.permission === 'contractorAttendance') {
    return Boolean(permissions?.contractorAttendance || permissions?.attendance);
  }
  if (item.permission === 'complaints') {
    return Boolean(permissions?.complaints);
  }
  return Boolean(permissions?.[item.permission]);
}

function evaluateUserNavPermission(item, permissions) {
  const key = item.userPermission || item.permission;
  if (!key) return true;
  if (key === 'attendance' || key === 'salespersonTracking') {
    return Boolean(permissions?.attendance || permissions?.salespersonTracking);
  }
  if (key === 'contractorAttendance') {
    return Boolean(permissions?.contractorAttendance || permissions?.attendance);
  }
  if (key === 'complaints') return Boolean(permissions?.complaints);
  return Boolean(permissions?.[key]);
}

export function isNavItemAllowed(item, user, permissions) {
  if (!user) return false;
  if (navItemCrossesAppBoundary(item)) return false;

  const isSuperAdmin = isSuperAdminUser(user);
  if (!isSuperAdmin && item.superAdminOnly) return false;
  if (!item.roles.includes(user?.role)) return false;
  if (item.jobRole && user?.jobRole !== item.jobRole) return false;

  if (user?.role === ROLES.ADMIN) {
    return evaluateAdminNavPermission(item, permissions, isSuperAdmin);
  }
  return evaluateUserNavPermission(item, permissions);
}

export function flattenNavItems(items = NAV_ITEMS) {
  return items.flatMap((item) => [item, ...(item.children || [])]);
}

function resolveComplaintsLanding(user, permissions) {
  if (user.role !== ROLES.ADMIN) {
    if (user.jobRole === 'INSTALLER' || permissions?.complaints) {
      return '/complaints/dashboard';
    }
  }
  if (user.adminType === 'COMPLAINT_COORDINATOR') return '/complaints/dashboard';
  return null;
}

export function getDefaultLandingPath(user, permissions) {
  if (!user) return '/central-sso';
  if (isSuperAdminUser(user)) return '/home';
  if (user.jobRole === 'SALESPERSON') return '/attendance';

  const complaintsPath = resolveComplaintsLanding(user, permissions);
  if (complaintsPath) return complaintsPath;

  const eligible = NAV_ITEMS.find((item) => isNavItemAllowed(item, user, permissions));
  return eligible ? eligible.path : '/profile';
}

function findBestNavPathMatch(pathname) {
  return flattenNavItems()
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

export function canOpenPath(pathname, user, permissions) {
  if (!pathname || pathname === '/login' || pathname === '/403' || pathname === '/404') return false;
  if (pathname === '/' || pathname === '/profile') return true;
  if (isSuperAdminUser(user)) return true;

  const match = findBestNavPathMatch(pathname);
  return match ? isNavItemAllowed(match, user, permissions) : false;
}