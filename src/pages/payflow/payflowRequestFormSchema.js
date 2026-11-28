import * as yup from 'yup';
import { isAdvancePayment, roundCurrency } from './payflowRequestConfig';

export const MAX_FILE_MB = 10;
export const ACCEPTED_FILES = 'image/jpeg,image/png,image/webp,application/pdf';
export const EMPTY_BILL = { billNumber: '', billDate: '' };

export const EMPTY_REQUEST_FORM = {
  vendor: '',
  isNewVendor: false,
  vendorAccountNumber: '',
  vendorIfsc: '',
  company: '',
  branch: '',
  category: '',
  subcategory: '',
  itemType: '',
  totalOutstanding: '',
  bankName: '',
  paymentMode: '',
  priority: '',
  payAgainst: 'Tax Invoice',
  amount: '',
  priceCheckBy: '',
  quantityCheckedBy: '',
  qualityCheckedBy: '',
  purchaseOwner: '',
  description: '',
  department: '',
  endUse: '',
  lpr: '',
  ioa: '',
  cpp: '',
  bills: [{ ...EMPTY_BILL }],
};

export const PAYFLOW_FORM_MASTERS = [
  ['categories', 'category'],
  ['subcategories', 'subcategory'],
  ['companies', 'company'],
  ['branches', 'branch'],
];

const num = (label) =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .typeError(`${label} must be a number`)
    .min(0, `${label} cannot be negative`);

const req = (label) => yup.string().trim().required(`${label} is required`);

const paymentWithinOutstanding = (val, ctx) => {
  if (val == null || isAdvancePayment(ctx.parent.payAgainst)) return true;
  const outstanding = ctx.parent.totalOutstanding;
  if (outstanding == null || Number.isNaN(outstanding)) return true;
  return val <= outstanding;
};

export const payflowRequestSchema = yup.object({
  vendor: req('Vendor name'),
  isNewVendor: yup.boolean(),
  vendorAccountNumber: yup.string().when('isNewVendor', {
    is: true,
    then: (s) => s.trim().matches(/^[A-Za-z0-9]{8,20}$/, 'Account number must be alphanumeric (8-20 characters)'),
    otherwise: (s) => s,
  }),
  vendorIfsc: yup.string().when('isNewVendor', {
    is: true,
    then: (s) => s.trim().matches(/^[A-Za-z0-9]{8,11}$/, 'IFSC code must be alphanumeric (8-11 characters)'),
    otherwise: (s) => s,
  }),
  company: req('Company name'),
  branch: req('Company branch'),
  category: req('Category'),
  subcategory: req('Sub-category'),
  itemType: req('Item type'),
  bankName: req('Bank name'),
  paymentMode: req('Payment mode'),
  priority: req('Urgency level'),
  payAgainst: req('Pay against'),
  totalOutstanding: num('Total outstanding amount').required('Total outstanding amount is required'),
  amount: num('Payment amount')
    .required('Payment amount is required')
    .moreThan(0, 'Payment amount must be greater than 0')
    .test(
      'lte-outstanding',
      'Payment amount cannot exceed Total Outstanding Amount (select Advance for advance payments)',
      paymentWithinOutstanding
    ),
  priceCheckBy: req('Price check guaranteed by'),
  quantityCheckedBy: yup.string(),
  qualityCheckedBy: yup.string(),
  purchaseOwner: yup.string(),
  description: req('Item description'),
  department: yup.string(),
  endUse: yup.string(),
  lpr: yup.string(),
  ioa: yup.string(),
  cpp: num('CPP'),
  bills: yup
    .array()
    .of(yup.object({ billNumber: req('Bill number'), billDate: req('Bill date') }))
    .min(1, 'At least one bill is required'),
});

export function buildRequestPayload(values, users, attachments) {
  const pickUser = (id) => {
    const u = users.find((x) => x._id === id);
    return u ? { user: u._id, name: u.name, email: u.email } : undefined;
  };
  const payload = { ...values };
  delete payload.isNewVendor;
  return {
    ...payload,
    vendorAccountNumber: values.vendorAccountNumber || undefined,
    vendorIfsc: values.vendorIfsc || undefined,
    totalOutstanding: roundCurrency(values.totalOutstanding),
    amount: roundCurrency(values.amount),
    cpp: values.cpp === '' || values.cpp == null ? undefined : values.cpp,
    priceCheckBy: pickUser(values.priceCheckBy),
    quantityCheckedBy: pickUser(values.quantityCheckedBy),
    qualityCheckedBy: pickUser(values.qualityCheckedBy),
    purchaseOwner: pickUser(values.purchaseOwner),
    attachments,
  };
}
