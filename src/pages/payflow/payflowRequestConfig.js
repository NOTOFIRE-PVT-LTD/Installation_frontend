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
export const STATUS_TRANSITIONS = {
  Pending: ['Approved', 'Rejected', 'Query', 'Postponed'],
  Query: ['Pending', 'Approved', 'Rejected', 'Postponed'],
  Postponed: ['Pending', 'Approved', 'Rejected'],
  Approved: ['Processed', 'Rejected', 'Postponed'],
  Processed: [],
  Rejected: [],
};

export const MAX_BULK_SELECTION = 10;

export const STATUS_ACTIONS = {
  Rejected: { label: 'Reject', color: '#ef4444', needsRemark: true },
  Query: { label: 'Query', color: '#f59e0b', needsRemark: true },
  Postponed: { label: 'Postpone', color: '#e5e7eb', textColor: '#111827' },
  Approved: { label: 'Approve', color: '#10b981' },
  Processed: { label: 'Processed', color: '#2437ff' },
  Pending: { label: 'Reopen', color: '#6b7280' },
};

export const BULK_STATUS_ACTIONS = [
  { status: 'Approved', label: 'Approve Selected', color: '#10b981', hoverColor: '#059669', borderColor: '#059669', textColor: '#ffffff', alwaysShow: true },
  { status: 'Rejected', label: 'Reject Selected', color: '#ef4444', hoverColor: '#dc2626', borderColor: '#dc2626', textColor: '#ffffff', needsRemark: true, alwaysShow: true },
  { status: 'Postponed', label: 'Postpone Selected', color: '#e5e7eb', hoverColor: '#d1d5db', borderColor: '#cbd5e1', textColor: '#1f2937', alwaysShow: true },
  { status: 'Processed', label: 'Mark Processed', color: '#2437ff', hoverColor: '#1d2ed6', borderColor: '#1d2ed6', textColor: '#ffffff', alwaysShow: true },
  { status: 'Query', label: 'Query Selected', color: '#f59e0b', hoverColor: '#d97706', borderColor: '#d97706', textColor: '#ffffff', needsRemark: true, alwaysShow: false },
  { status: 'Pending', label: 'Reopen Selected', color: '#64748b', hoverColor: '#475569', borderColor: '#475569', textColor: '#ffffff', alwaysShow: false },
];

export function buildBulkButtonSx(action) {
  return {
    '&&&': {
      minHeight: '34px !important',
      padding: '6px 14px !important',
      borderRadius: '8px !important',
      fontSize: '0.8rem !important',
      fontWeight: '600 !important',
      textTransform: 'none !important',
      background: `${action.color} !important`,
      color: `${action.textColor} !important`,
      border: `1px solid ${action.borderColor} !important`,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08) !important',
    },
    '&&&::before': { display: 'none' },
    '&&&:hover': {
      background: `${action.hoverColor} !important`,
      color: `${action.textColor} !important`,
      boxShadow: '0 4px 10px rgba(15, 23, 42, 0.14) !important',
    },
    '&&&.Mui-disabled': {
      background: '#e2e8f0 !important',
      color: '#94a3b8 !important',
      borderColor: '#cbd5e1 !important',
      boxShadow: 'none !important',
    },
  };
}

// Display order of the action buttons on single-request detail.
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

export function roundCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function isAdvancePayment(payAgainst) {
  return /advance/i.test(String(payAgainst || ''));
}

export function computeBalanceAmount(totalOutstanding, amount) {
  return roundCurrency((Number(totalOutstanding) || 0) - (Number(amount) || 0));
}

export function formatInr(n) {
  const num = Number(n || 0);
  const abs = Math.abs(num).toLocaleString('en-IN');
  return num < 0 ? `-₹${abs}` : `₹${abs}`;
}

export function isSelectableRequestStatus(status) {
  return (STATUS_TRANSITIONS[status]?.length || 0) > 0;
}

export function allowedSourceStatusesFor(targetStatus) {
  return Object.entries(STATUS_TRANSITIONS)
    .filter(([, targets]) => targets.includes(targetStatus))
    .map(([source]) => source);
}

export function partitionBulkSelection(selectedRows, targetStatus) {
  const eligible = [];
  const skipped = [];
  (selectedRows || []).forEach((row) => {
    const allowed = STATUS_TRANSITIONS[row?.status] || [];
    if (allowed.includes(targetStatus)) eligible.push(row);
    else skipped.push(row);
  });
  return { eligible, skipped };
}

export function capBulkSelectionIds(nextIds, prevIds = [], max = MAX_BULK_SELECTION) {
  const clean = [...new Set((nextIds || []).filter(Boolean))];
  if (clean.length <= max) return { ids: clean, exceeded: false };
  const kept = (prevIds || []).filter((id) => clean.includes(id));
  const added = clean.filter((id) => !kept.includes(id));
  return { ids: [...kept, ...added].slice(0, max), exceeded: true };
}
