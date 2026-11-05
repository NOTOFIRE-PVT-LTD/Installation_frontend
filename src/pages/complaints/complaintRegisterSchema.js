import * as yup from 'yup';
import { CATEGORY_OPTIONS } from './complaintUtils';

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_MB = 5;
export const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

export const PUBLIC_PRIORITIES = [
  { value: 'Low', label: 'Low - Can be attended within 3 days' },
  { value: 'Medium', label: 'Medium - Normal response (48 hours)' },
  { value: 'High', label: 'High - Urgent / Production halting (24 hours)' },
  { value: 'Critical', label: 'Critical - Safety risk / Total outage (4 hours)' },
];

export const categorySelectOptions = CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }));

const optionalText = (max) =>
  yup.string().trim().transform((value) => (value === '' ? null : value)).nullable().max(max, 'This value is too long');

export const registerSchema = yup.object({
  customerName: yup.string().trim().required('Your name is required').max(120, 'Name is too long'),
  contactNumber: yup.string().trim().required('Phone number is required').matches(PHONE_RE, 'Enter a valid phone number'),
  whatsappNumber: yup.string().trim().required('WhatsApp number is required so you can receive ticket updates').matches(PHONE_RE, 'Enter a valid WhatsApp number'),
  email: yup.string().trim().transform((value) => (value === '' ? null : value)).nullable().email('Enter a valid email address'),
  companyName: optionalText(160),
  siteName: optionalText(160),
  location: optionalText(250),
  product: optionalText(160),
  productModel: optionalText(100),
  productSerialNumber: optionalText(100),
  category: yup.string().required('Select a complaint category'),
  priority: yup.string().required('Select urgency'),
  subject: yup.string().trim().required('Subject is required').max(160, 'Subject is too long'),
  description: yup.string().trim().required('Please describe the issue').max(5000, 'Description is too long'),
});

export const defaultRegisterValues = {
  customerName: '',
  contactNumber: '',
  whatsappNumber: '',
  email: '',
  companyName: '',
  siteName: '',
  location: '',
  product: '',
  productModel: '',
  productSerialNumber: '',
  category: 'Product Quality',
  priority: 'Medium',
  subject: '',
  description: '',
};

