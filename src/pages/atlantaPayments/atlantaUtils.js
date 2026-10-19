export const TADA_RATE_PER_DAY = 1200;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const EXPENSE_FIELDS = [
  { name: 'sseAmount', label: 'SSE Amount (₹)' },
  { name: 'sseBabu', label: 'SSE Babu (₹)' },
  { name: 'meggeringCharge', label: 'Meggering Charge (₹)' },
  { name: 'adste', label: 'ADSTE (₹)' },
  { name: 'budgetAccounts', label: 'Budget + Accounts (₹)' },
  { name: 'dyCsteOs', label: 'Dy.CSTE OS (₹)' },
  { name: 'dyCste', label: 'Dy.CSTE (₹)' },
  { name: 'miscellaneous', label: 'Miscellaneous (₹)' },
];

const n = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function inr(value) {
  return `₹${(Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** Percent of basic amount, truncated (not rounded) to 3 decimals, e.g. "0.104". Empty if no basic. */
export function percentOfBasic(amount, basic) {
  const base = n(basic);
  const value = n(amount);
  if (!base || !value) return '';
  return (Math.floor((value / base) * 100 * 1000) / 1000).toFixed(3);
}

export function travelDays(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(diff) && diff > 0 ? Math.ceil(diff / MS_PER_DAY) : 0;
}

export function entryTotalExpense(entry) {
  return round2(EXPENSE_FIELDS.reduce((sum, field) => sum + n(entry?.[field.name]), 0));
}

/** Same maths as the backend, used for live totals while the form is being filled in. */
export function computeTotals(values = {}) {
  const days = travelDays(values.travelStartAt, values.exitAt);
  const totalTada = round2(days * TADA_RATE_PER_DAY);
  const entries = values.invoiceEntries || [];
  const totalBasic = round2(entries.reduce((sum, row) => sum + n(row.basicAmount), 0));
  const totalInvoice = round2(entries.reduce((sum, row) => sum + n(row.totalAmount), 0));
  const totalExpense = round2(entries.reduce((sum, row) => sum + entryTotalExpense(row), 0));
  const totalTravel = round2((values.travelExpenses || []).reduce((sum, row) => sum + n(row.amount), 0));
  const totalReceived = round2(
    (values.paymentsReceived || []).reduce((sum, row) => sum + Math.max(n(row.amount) - n(row.deductAmount), 0), 0)
  );
  return {
    days,
    totalTada,
    totalBasic,
    totalInvoice,
    totalExpense,
    totalTravel,
    totalReceived,
    amountToGive: round2(totalTada + totalExpense + totalTravel - totalReceived),
  };
}

export const emptyInvoiceEntry = () => ({
  invoiceNoDate: '',
  basicAmount: '',
  quantity: '',
  totalAmount: '',
  sseAmount: '',
  sseBabu: '',
  meggeringCharge: '',
  adste: '',
  budgetAccounts: '',
  dyCsteOs: '',
  dyCste: '',
  miscellaneous: '',
  miscRecipientName: '',
});

export const emptyTravelExpense = () => ({ date: '', detail: '', amount: '', transactionDone: false, keepProof: null });
export const emptyPayment = () => ({ paymentDate: '', amount: '', deductAmount: '', details: '' });

export function emptyForm() {
  return {
    fileName: '',
    consigneeName: '',
    crnDate: '',
    paymentDate: '',
    employeeName: '',
    designation: '',
    travelStartAt: '',
    reachedAt: '',
    exitAt: '',
    invoiceEntries: [emptyInvoiceEntry()],
    travelExpenses: [emptyTravelExpense()],
    paymentsReceived: [emptyPayment()],
  };
}

const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

function dateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (x) => String(x).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const numStr = (value) => (value ? String(value) : '');

export function paymentToForm(payment) {
  const base = emptyForm();
  return {
    ...base,
    fileName: payment.fileName || '',
    consigneeName: payment.consigneeName || '',
    crnDate: dateOnly(payment.crnDate),
    paymentDate: dateOnly(payment.paymentDate),
    employeeName: payment.employeeName || '',
    designation: payment.designation || '',
    travelStartAt: dateTimeLocal(payment.travelStartAt),
    reachedAt: dateTimeLocal(payment.reachedAt),
    exitAt: dateTimeLocal(payment.exitAt),
    invoiceEntries: payment.invoiceEntries?.length
      ? payment.invoiceEntries.map((row) => {
          const entry = emptyInvoiceEntry();
          Object.keys(entry).forEach((key) => {
            entry[key] = key === 'invoiceNoDate' || key === 'miscRecipientName' ? row[key] || '' : numStr(row[key]);
          });
          return entry;
        })
      : base.invoiceEntries,
    travelExpenses: payment.travelExpenses?.length
      ? payment.travelExpenses.map((row) => ({
          date: dateOnly(row.date),
          detail: row.detail || '',
          amount: numStr(row.amount),
          transactionDone: Boolean(row.transactionDone),
          keepProof: row.proof || null,
        }))
      : base.travelExpenses,
    paymentsReceived: payment.paymentsReceived?.length
      ? payment.paymentsReceived.map((row) => ({
          paymentDate: dateOnly(row.paymentDate),
          amount: numStr(row.amount),
          deductAmount: numStr(row.deductAmount),
          details: row.details || '',
        }))
      : base.paymentsReceived,
  };
}

const toIso = (value) => (value ? new Date(value).toISOString() : null);

/**
 * Builds the JSON payload + the ordered list of new proof files. Blank rows are dropped, and each
 * travel expense points at its new file by index (`newProofIndex`) or keeps its saved proof.
 * `files` is keyed by the field-array row id.
 */
export function formToPayload(values, rowIds, files) {
  const proofFiles = [];
  const travelExpenses = [];

  (values.travelExpenses || []).forEach((row, index) => {
    const file = files[rowIds[index]] || null;
    const hasContent = row.date || row.detail?.trim() || n(row.amount) || file || row.keepProof;
    if (!hasContent) return;
    const item = {
      date: row.date || null,
      detail: row.detail,
      amount: n(row.amount),
      transactionDone: Boolean(row.transactionDone),
      keepProofId: !file && row.keepProof ? row.keepProof._id : null,
      newProofIndex: null,
    };
    if (file) {
      item.newProofIndex = proofFiles.length;
      proofFiles.push(file);
    }
    travelExpenses.push(item);
  });

  const payload = {
    fileName: values.fileName,
    consigneeName: values.consigneeName,
    crnDate: values.crnDate || null,
    paymentDate: values.paymentDate || null,
    employeeName: values.employeeName,
    designation: values.designation,
    travelStartAt: toIso(values.travelStartAt),
    reachedAt: toIso(values.reachedAt),
    exitAt: toIso(values.exitAt),
    invoiceEntries: values.invoiceEntries,
    travelExpenses,
    paymentsReceived: (values.paymentsReceived || []).filter((row) => row.paymentDate || n(row.amount) || n(row.deductAmount) || row.details?.trim()),
  };
  return { payload, proofFiles };
}
