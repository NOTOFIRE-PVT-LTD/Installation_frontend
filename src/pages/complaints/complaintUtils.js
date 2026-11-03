export const COMPLAINT_PUBLIC_PATH = '/submit';
export const COMPLAINT_TRACK_PATH = '/track';

export const COMPLAINT_STATUSES = {
  NEW: 'NEW',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING: 'PENDING',
  WAITING_FOR_CUSTOMER: 'WAITING_FOR_CUSTOMER',
  WAITING_FOR_PART: 'WAITING_FOR_PART',
  RESOLUTION_SUBMITTED: 'RESOLUTION_SUBMITTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

export const STATUS_CONFIG = {
  NEW: {
    label: 'New',
    bg: '#fef2f2',
    color: '#b91c1c',
    border: '#fecaca',
    dot: '#ef4444',
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: '#f0fdfa',
    color: '#0f766e',
    border: '#ccfbf1',
    dot: '#14b8a6',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: '#eef2ff',
    color: '#4338ca',
    border: '#c7d2fe',
    dot: '#6366f1',
  },
  PENDING: {
    label: 'Pending',
    bg: '#fff7ed',
    color: '#c2410c',
    border: '#ffedd5',
    dot: '#f97316',
  },
  WAITING_FOR_CUSTOMER: {
    label: 'Pending',
    bg: '#fff7ed',
    color: '#c2410c',
    border: '#ffedd5',
    dot: '#f97316',
  },
  WAITING_FOR_PART: {
    label: 'Pending',
    bg: '#fefce8',
    color: '#854d0e',
    border: '#fef08a',
    dot: '#eab308',
  },
  RESOLUTION_SUBMITTED: {
    label: 'Resolution Submitted',
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#bbf7d0',
    dot: '#22c55e',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  CLOSED: {
    label: 'Closed',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    dot: '#64748b',
  },
  REOPENED: {
    label: 'Reopened',
    bg: '#faf5ff',
    color: '#7e22ce',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  // Legacy aliases
  Open: {
    label: 'New',
    bg: '#fef2f2',
    color: '#b91c1c',
    border: '#fecaca',
    dot: '#ef4444',
  },
  'In Progress': {
    label: 'In Progress',
    bg: '#eef2ff',
    color: '#4338ca',
    border: '#c7d2fe',
    dot: '#6366f1',
  },
  Resolved: {
    label: 'Resolved',
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  Closed: {
    label: 'Closed',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    dot: '#64748b',
  },
};

export const ALLOWED_TRANSITIONS = {
  NEW: ['ACKNOWLEDGED', 'ASSIGNED'],
  ACKNOWLEDGED: ['ASSIGNED', 'IN_PROGRESS'],
  ASSIGNED: ['IN_PROGRESS', 'PENDING', 'RESOLVED'],
  IN_PROGRESS: ['PENDING', 'RESOLVED'],
  PENDING: ['IN_PROGRESS', 'RESOLVED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'PENDING'],
  WAITING_FOR_PART: ['IN_PROGRESS', 'RESOLVED', 'PENDING'],
  RESOLUTION_SUBMITTED: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
  Open: ['ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'],
  'In Progress': ['RESOLVED', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_PART'],
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  MEDIUM: { label: 'Medium', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  HIGH: { label: 'High', color: '#c2410c', bg: '#fff7ed', border: '#ffedd5' },
  CRITICAL: { label: 'Critical', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  Low: { label: 'Low', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  Medium: { label: 'Medium', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  High: { label: 'High', color: '#c2410c', bg: '#fff7ed', border: '#ffedd5' },
  Critical: { label: 'Critical', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
};

export const WARRANTY_CONFIG = {
  IN_WARRANTY: {
    label: 'Under Warranty',
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  WARRANTY_EXPIRING: {
    label: 'Expiring Soon (60d)',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  WARRANTY_EXPIRED: {
    label: 'Warranty Expired',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  NOT_APPLICABLE: {
    label: 'N/A',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  UNKNOWN: {
    label: 'Warranty Unknown',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
};

export const CATEGORY_OPTIONS = [
  'Product Quality',
  'Installation',
  'Service Delay',
  'Hardware fault',
  'Software issue',
  'Billing',
  'General query',
  'Other',
];

export const SOURCE_OPTIONS = [
  { value: 'PHONE', label: 'Phone Call' },
  { value: 'SELF_SERVICE', label: 'Self-Service Portal' },
  { value: 'INTERNAL', label: 'Internal Staff' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'QR', label: 'QR Scan' },
];

export function publicComplaintLink() {
  if (typeof window === 'undefined') return COMPLAINT_PUBLIC_PATH;
  return `${window.location.origin}${COMPLAINT_PUBLIC_PATH}`;
}

export function publicTrackLink(ticketNumber = '') {
  const query = ticketNumber ? `?ticket=${encodeURIComponent(ticketNumber)}` : '';
  if (typeof window === 'undefined') return `${COMPLAINT_TRACK_PATH}${query}`;
  return `${window.location.origin}${COMPLAINT_TRACK_PATH}${query}`;
}
