export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};

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

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NF Site Installation Report';
