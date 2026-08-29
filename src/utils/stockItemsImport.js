import { exportToCsv } from './csvExport';

const TEMPLATE_COLUMNS = [
  { headerName: 'Component Category', field: 'category' },
  { headerName: 'Component Name', field: 'component' },
  { headerName: 'Sub Component Name', field: 'subComponent' },
  { headerName: 'Type', field: 'type' },
];

const TEMPLATE_ROWS = [
  {
    category: 'Electrical',
    component: 'Cable',
    subComponent: '6mm wire',
    type: 'Single Use',
  },
  {
    category: 'Hardware',
    component: 'Bracket',
    subComponent: '',
    type: 'Reusable',
  },
];

export function downloadStockItemsTemplate() {
  exportToCsv('stock-items-import-template', TEMPLATE_ROWS, TEMPLATE_COLUMNS);
}
