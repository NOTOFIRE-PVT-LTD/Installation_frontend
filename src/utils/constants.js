export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};

export const ADMIN_TYPES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SALES_COORDINATOR: 'SALES_COORDINATOR',
  TENDER_COORDINATOR: 'TENDER_COORDINATOR',
  COMPLAINT_COORDINATOR: 'COMPLAINT_COORDINATOR',
  GENERAL_ADMIN: 'GENERAL_ADMIN',
};

export const ADMIN_TYPE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SALES_COORDINATOR: 'Attendance / Sales Coordinator',
  TENDER_COORDINATOR: 'Tender Coordinator',
  COMPLAINT_COORDINATOR: 'Complaint Resolution Admin',
  GENERAL_ADMIN: 'General Admin',
};

export const PLATFORM_OWNER_EMAILS = [
  'gauravjain@atlantatelecables.com',
  'gauravjain@gmail.com',
  'mansi@gmail.com',
];
/** @deprecated use PLATFORM_OWNER_EMAILS */
export const PLATFORM_OWNER_EMAIL = PLATFORM_OWNER_EMAILS[0];

export const APP_ACCESS_OPTIONS = [
  { value: 'complaints', label: 'Complaint Resolution' },
  { value: 'attendance', label: 'Attendance & Visits' },
  { value: 'projects', label: 'Projects' },
  { value: 'tenders', label: 'Tenders' },
  { value: 'billing', label: 'Billing' },
  { value: 'financialDocuments', label: 'Finance Docs' },
  { value: 'inspections', label: 'Inspections' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'atlantaPayments', label: 'Atlanta Payments' },
  { value: 'shipping', label: 'Shipping Control' },
  { value: 'importControl', label: 'Import Control' },
];

export const ACCOUNT_LEVEL = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const JOB_ROLES = {
  INSTALLER: 'INSTALLER',
  SALESPERSON: 'SALESPERSON',
};

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export const LEAVE_PAY = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const VISIT_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_MISSED: 'APPROVED_MISSED',
  REJECTED: 'REJECTED',
};

export const VISIT_TYPE = {
  HOURLY: 'HOURLY',
  TOUR: 'TOUR',
};

export const DAY_VISIT_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
};

export const VISIT_EXPENSE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const VISIT_EXPENSE_CLAIM_MODE = {
  PER_VISIT: 'PER_VISIT',
  DAY_TOTAL: 'DAY_TOTAL',
};

export const TRANSPORT_MODE = {
  PRIVATE: 'PRIVATE',
  TRAIN: 'TRAIN',
  METRO: 'METRO',
  BUS: 'BUS',
  TAXI: 'TAXI',
  AUTO: 'AUTO',
  OTHER: 'OTHER',
};

export const PRIVATE_KM_RATE = 50;

export const MISSED_VISIT_REASONS = [
  'Customer unavailable',
  'Customer cancelled',
  'Emergency',
  'Vehicle/transport issue',
  'Unable to reach location',
  'Location/GPS problem',
  'Customer requested reschedule',
  'Other',
];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const REPORT_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PAID: 'Paid',
};

export const PAYMENT_METHOD = {
  INSTALLER: 'Installer',
  CONTRACTOR: 'Contractor',
};

export const CLAIM_STATUS = {
  NOT_SUBMITTED: 'Not Submitted',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAID: 'Paid',
};

export const SITE_TYPES = ['Station', 'IBH', 'Auto Hut', 'LC Gate', 'Telecom Exchange', 'Building'];

export const DEFAULT_BONUS_PERCENT = 5;
export const CLAIM_TDS_PERCENT = 2;

export const STATION_STAGE_LABELS = [
  'Not Started',
  'Installation In Progress',
  'Installed – Pending Commissioning',
  'Commissioned',
  'Claim Pending Approval',
  'Claim Approved',
  'Paid',
];

export const PERMISSION_KEYS = [    
  'dashboard',
  'users',
  'salespersonTracking',
  'customers',
  'attendance',
  'projects',
  'reports',
  'payments',
  'numbers',
  'cadDrawing',
  'claimApprovals',
  'tenders',
  'tenderWhatsappAlerts',
  'inspections',
  'financialDocuments',
  'bgWhatsappAlerts',
  'accounts',
  'stockItems',
  'bom',
  'itemsMaster',
  'billing',
  'quotations',
  'quotationsOwnOnly',
  'proformaInvoices',
  'deliveryChallans',
  'atlantaPayments',
  'atlantaPaymentsOwnOnly',
  'auditLogs',
  'complaints',
  'shipping',
  'importControl',
];

export const COMPLAINT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const COMPLAINT_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const COMPLAINT_CATEGORY = {
  INSTALLATION: 'Installation',
  PRODUCT_QUALITY: 'Product Quality',
  SERVICE_DELAY: 'Service Delay',
  BILLING: 'Billing',
  OTHER: 'Other',
};

export const COMPLAINT_PUBLIC_PRIORITIES = [
  COMPLAINT_PRIORITY.LOW,
  COMPLAINT_PRIORITY.MEDIUM,
  COMPLAINT_PRIORITY.HIGH,
];

export const STOCK_MOVEMENT_TYPES = {
  SUPPLIER_IN: 'supplier_in',
  ISSUE_OUT: 'issue_out',
  UTILIZE: 'utilize',
  RETURN_IN: 'return_in',
};

export const STOCK_MOVEMENT_LABELS = {
  supplier_in: 'Receive from Supplier',
  issue_out: 'Issue to Person',
  utilize: 'Utilize / Consume',
  return_in: 'Return to Warehouse',
};

export const STOCK_CATALOG_KINDS = {
  CATEGORY: 'category',
  COMPONENT: 'component',
  SUB_COMPONENT: 'subComponent',
};

export const STOCK_ITEM_TYPES = ['Single Use', 'Reusable'];
export const STOCK_OTHER_VALUE = '__other__';

// Each kind is also the MasterItem field it fills (kept in sync with the backend).
export const ITEM_MASTER_CATALOG_KINDS = {
  END_USE: 'endUse',
  PRICE_GUARANTEE: 'priceGuarantee',
  ITEM_CATEGORY: 'itemCategory',
  ITEM_NAME: 'itemName',
  QTY_TYPE: 'qtyType',
  PAYMENT: 'payment',
};

export const ITEM_MASTER_CATALOG_FIELDS = Object.values(ITEM_MASTER_CATALOG_KINDS);

export const LOA_TYPES = {
  NOTOFIRE: 'Notofire',
  THIRD_PARTY: 'Third Party',
};

export const INSPECTION_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  PASSED: 'Passed',
  FAILED: 'Failed',
};

export const NUMBER_CATEGORIES = {
  GOVERNMENT_OFFICIAL: 'Government Official',
  INSTALLER: 'Installer',
  MANAGEMENT: 'Management',
};

export const API_BASE_URL =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  (import.meta.env.VITE_API_BASE_URL?.includes('localhost') || !import.meta.env.VITE_API_BASE_URL)
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || '/api');
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NF Site Installation Report';
