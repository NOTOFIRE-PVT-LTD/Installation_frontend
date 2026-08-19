import { ITEM_MASTER_CATALOG_KINDS } from '../../utils/constants';

export const OTHER = '__other__';

// Every catalog dropdown is described once here; the form, the filters and the
// payload builder all read from this list so the three never drift apart.
export const CATALOG_FIELDS = [
  {
    name: ITEM_MASTER_CATALOG_KINDS.ITEM_CATEGORY,
    label: 'Item Category',
    placeholder: 'Select category',
    required: true,
  },
  { name: ITEM_MASTER_CATALOG_KINDS.QTY_TYPE, label: 'Qty Type', placeholder: 'Select qty type' },
  { name: ITEM_MASTER_CATALOG_KINDS.PAYMENT, label: 'Payment', placeholder: 'Select payment' },
];

export function newNameField(field) {
  return `new${field.charAt(0).toUpperCase()}${field.slice(1)}`;
}
