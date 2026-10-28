// Shared presentation + workflow config for payment requests.
export const REQUEST_STATUS_STYLES = {
  Pending: { bg: '#fef3c7', color: '#b45309' },
  Approved: { bg: '#d1fae5', color: '#047857' },
  Processed: { bg: '#dbeafe', color: '#1d4ed8' },
  Rejected: { bg: '#fee2e2', color: '#b91c1c' },
  Query: { bg: '#ffedd5', color: '#c2410c' },
  Postponed: { bg: '#e5e7eb', color: '#374151' },
};

export const REQUEST_STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Processed', 'Rejected', 'Query', 'Postponed'];

export const PRIORITY_STYLES = {
  High: { bg: '#dc2626', color: '#fff' },
  Medium: { bg: '#f59e0b', color: '#fff' },
  Low: { bg: '#10b981', color: '#fff' },
};

// Mirrors STATUS_TRANSITIONS on the backend; the backend remains the source of truth.
export const STATUS_ACTIONS = {
  Rejected: { label: 'Reject', color: '#ef4444', needsRemark: true },
  Query: { label: 'Query', color: '#f59e0b', needsRemark: true },
  Postponed: { label: 'Postpone', color: '#e5e7eb', textColor: '#111827' },
  Approved: { label: 'Approve', color: '#10b981' },
  Processed: { label: 'Processed', color: '#2437ff' },
  Pending: { label: 'Reopen', color: '#6b7280' },
};

// Display order of the action buttons.
export const ACTION_ORDER = ['Rejected', 'Query', 'Postponed', 'Approved', 'Processed', 'Pending'];

export const PAY_AGAINST_OPTIONS = ['Tax Invoice', 'Proforma Invoice', 'Advance', 'Other'];
export const PAYMENT_MODE_OPTIONS = ['Net Banking', 'NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash'];
export const ITEM_TYPE_OPTIONS = ['Raw Materials', 'Consumable', 'Service', 'Capital Goods'];
export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
export const BANK_OPTIONS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Yes Bank',
  'IDFC First Bank',
  'Other',
];

export const formatInr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
