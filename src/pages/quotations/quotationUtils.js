export const QUOTATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'sent', label: 'Sent', color: 'info' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'warning' },
];

export const GST_RATES = [0, 5, 12, 18, 28];

export function statusMeta(status) {
  return QUOTATION_STATUSES.find((s) => s.value === status) || QUOTATION_STATUSES[0];
}

export function money(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** Same maths as the backend: discount on subtotal, GST on discounted amount, packing added last. */
export function computeTotals({ items = [], discountPercent = 0, gstRate = 0, packingFreight = 0 }) {
  const subtotal = round2(items.reduce((sum, row) => sum + (Number(row.qty) || 0) * (Number(row.price) || 0), 0));
  const discount = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
  const discountAmount = round2((subtotal * discount) / 100);
  const afterDiscount = round2(subtotal - discountAmount);
  const gstAmount = round2((afterDiscount * (Number(gstRate) || 0)) / 100);
  const packing = Math.max(Number(packingFreight) || 0, 0);
  const totalAmount = round2(afterDiscount + gstAmount + packing);
  return { subtotal, discountAmount, afterDiscount, gstAmount, packingFreight: packing, totalAmount };
}

/** Main items are numbered 1, 2, 3…; sub-items under a main item become 1.1, 1.2… */
export function serialNumbers(items = []) {
  let main = 0;
  let sub = 0;
  return items.map((row) => {
    if (row.lineType === 'sub' && main > 0) {
      sub += 1;
      return `${main}.${sub}`;
    }
    main += 1;
    sub = 0;
    return String(main);
  });
}

export function apiErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}
