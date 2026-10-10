export const PI_TEMPLATES = [{ value: 'standard', label: 'Standard' }];

export const DEFAULT_PI_TERMS = [
  '1. Freight applicable as per actual.',
  '2. Dispatch will be done within one week after payment confirmation (depends on payment terms).',
  '3. The prices mentioned are applicable for supply only.',
  '4. This Proforma Invoice is valid for 30 days from the date of issue.',
].join('\n');

const NOTOFIRE_BANK = {
  accountName: 'M/s NOTOFIRE PRIVATE LIMITED',
  accountNo: '50200112805161',
  bankName: 'HDFC Bank Ltd.',
  ifsc: 'HDFC0000657',
  branch: '1410 Chow Mandi, Malviya Chowk, Roorkee, Distt. Haridwar, Roorkee – 247667',
};

const EMPTY_BANK = { accountName: '', accountNo: '', bankName: '', ifsc: '', branch: '' };

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function dateInput(value) {
  if (!value) return todayIso();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return todayIso();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

/** Bank details saved on the company; Notofire falls back to its HDFC account until one is saved. */
export function companyBank(company) {
  const bank = company?.bank || {};
  if (Object.values(bank).some((value) => String(value || '').trim())) return { ...EMPTY_BANK, ...bank };
  if (/notofire/i.test(company?.name || '')) return { ...NOTOFIRE_BANK };
  return { ...EMPTY_BANK };
}

/** "VALUECON PRIVATE LIMITED" -> "Valuecon" for compact chips. */
export function shortCompanyName(name) {
  const cleaned = String(name || '')
    .replace(/^m\/s\.?\s*/i, '')
    .replace(/\b(pvt\.?|private|ltd\.?|limited|llp)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return String(name || '');
  return cleaned
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function emptyItem() {
  return { description: '', modelNo: '', qty: 1, unit: 'Nos', rate: '' };
}

export function computePiTotals({ items = [], freight = 0, gstRate = 0 }) {
  const totalExGst = round2(items.reduce((sum, row) => sum + (Number(row.qty) || 0) * (Number(row.rate) || 0), 0));
  const freightAmount = Math.max(Number(freight) || 0, 0);
  const totalAmount = round2(totalExGst + freightAmount);
  const gstAmount = round2((totalAmount * (Number(gstRate) || 0)) / 100);
  const netAmount = round2(totalAmount + gstAmount);
  return { totalExGst, freight: freightAmount, totalAmount, gstAmount, netAmount };
}

export function emptyPiForm(company = null) {
  return {
    companyRef: company?._id || '',
    template: 'standard',
    piNumber: '',
    piDate: todayIso(),
    gstin: company?.gstin || '',
    poNumber: '',
    partyRef: '',
    partyName: '',
    partyGstin: '',
    deliveryAddress: '',
    quotationRef: '',
    quotationNo: '',
    items: [],
    freight: 0,
    gstRate: 18,
    terms: DEFAULT_PI_TERMS,
    bank: companyBank(company),
    preparedBy: '',
    checkedBy: '',
    kindAttention: '',
    remarks: '',
    email: company?.email || '',
  };
}

export function piToForm(pi) {
  return {
    companyRef: pi.company?.ref || '',
    template: pi.template || 'standard',
    piNumber: pi.piNumber || '',
    piDate: dateInput(pi.piDate),
    gstin: pi.company?.gstin || '',
    poNumber: pi.poNumber || '',
    partyRef: pi.party?.ref || '',
    partyName: pi.party?.name || '',
    partyGstin: pi.party?.gstin || '',
    deliveryAddress: pi.deliveryAddress || '',
    quotationRef: pi.quotation?.ref || '',
    quotationNo: pi.quotation?.quotationNo || '',
    items: (pi.items || []).map((row) => ({
      description: row.description || '',
      modelNo: row.modelNo || '',
      qty: row.qty ?? 1,
      unit: row.unit || 'Nos',
      rate: row.rate ?? '',
    })),
    freight: pi.freight ?? 0,
    gstRate: pi.gstRate ?? 18,
    terms: pi.terms || '',
    bank: { ...EMPTY_BANK, ...(pi.bank || {}) },
    preparedBy: pi.preparedBy || '',
    checkedBy: pi.checkedBy || '',
    kindAttention: pi.kindAttention || '',
    remarks: pi.remarks || '',
    email: pi.email || '',
  };
}

/** Prefills a new PI from a quotation; any quotation discount is folded into the unit rates. */
export function quotationToForm(quotation, companies = []) {
  const company = companies.find((c) => String(c._id) === String(quotation.company?.ref)) || null;
  const discount = Math.min(Math.max(Number(quotation.discountPercent) || 0, 0), 100);
  const base = emptyPiForm(company);
  return {
    ...base,
    gstin: company?.gstin || quotation.company?.gstin || '',
    partyRef: quotation.party?.ref || '',
    partyName: quotation.party?.name || '',
    partyGstin: quotation.party?.gstin || '',
    deliveryAddress: quotation.party?.address || '',
    quotationRef: quotation._id,
    quotationNo: quotation.quotationNo || '',
    items: (quotation.items || [])
      .filter((row) => row.description || row.modelNo)
      .map((row) => ({
        description: row.description || row.modelNo || '',
        modelNo: row.modelNo || '',
        qty: row.qty ?? 1,
        unit: row.unit || 'Nos',
        rate: round2((Number(row.price) || 0) * (1 - discount / 100)),
      })),
    freight: quotation.packingFreight ?? 0,
    gstRate: quotation.gstRate ?? 18,
    preparedBy: quotation.preparedBy || '',
    checkedBy: quotation.checkedBy || '',
    kindAttention: quotation.party?.contactPerson || '',
    email: company?.email || quotation.company?.email || '',
  };
}

export function formToPayload(values) {
  return {
    company: { ref: values.companyRef, gstin: values.gstin },
    template: values.template,
    piNumber: String(values.piNumber || '').trim(),
    piDate: values.piDate || undefined,
    poNumber: values.poNumber,
    party: { ref: values.partyRef || null, name: values.partyName, gstin: values.partyGstin },
    deliveryAddress: values.deliveryAddress,
    quotation: { ref: values.quotationRef || null, quotationNo: values.quotationNo },
    items: values.items.map((row) => ({
      description: row.description,
      modelNo: row.modelNo,
      qty: Number(row.qty) || 0,
      unit: row.unit || 'Nos',
      rate: Number(row.rate) || 0,
    })),
    freight: Number(values.freight) || 0,
    gstRate: values.gstRate === '' ? 0 : Number(values.gstRate) || 0,
    terms: values.terms,
    bank: values.bank,
    preparedBy: values.preparedBy,
    checkedBy: values.checkedBy,
    kindAttention: values.kindAttention,
    remarks: values.remarks,
    email: values.email,
  };
}
