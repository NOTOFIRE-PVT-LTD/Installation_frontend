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

export const PERMISSION_KEYS = ['dashboard', 'users', 'projects', 'reports', 'payments', 'numbers', 'cadDrawing'];

export const NUMBER_CATEGORIES = {
  GOVERNMENT_OFFICIAL: 'Government Official',
  INSTALLER: 'Installer',
  MANAGEMENT: 'Management',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NF Site Installation Report';
