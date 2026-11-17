import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../utils/formatters';
import { STOCK_MOVEMENT_TYPES } from '../../utils/constants';

export const STOCK_PAGE_SIZE_OPTIONS = [100, 250, 500, 1000];
export const STOCK_MAX_PAGE_SIZE = STOCK_PAGE_SIZE_OPTIONS[STOCK_PAGE_SIZE_OPTIONS.length - 1];
export const STOCK_DEFAULT_PAGE_SIZE = STOCK_MAX_PAGE_SIZE;

// MUI X DataGrid v7 expects the selection as a plain array of row ids.
function emptySelectionModel(ids = []) {
  return [...new Set(ids)];
}

function bulkDeleteMessage(result, singular = 'item', plural = 'items') {
  const deleted = result?.deleted?.length || 0;
  const failed = result?.failed?.length || 0;
  if (deleted && !failed) return `Deleted ${deleted} ${deleted === 1 ? singular : plural}`;
  if (deleted && failed) {
    return `Deleted ${deleted}, skipped ${failed} (with linked records or blocked)`;
  }
  if (failed) return `Could not delete selected ${plural}. They may have linked stock activity.`;
  return `No ${plural} deleted`;
}

const ITEM_COLUMNS = [
  {
    field: 'componentName',
    headerName: 'Component',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'subComponentName',
    headerName: 'Sub Component',
    flex: 1.1,
    minWidth: 150,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'itemType',
    headerName: 'Type',
    width: 120,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'unit',
    headerName: 'Unit',
    width: 90,
    valueGetter: (value) => value || 'Nos',
  },
];

const WAREHOUSE_COLUMNS = [
  {
    field: 'name',
    headerName: 'Item',
    flex: 1.2,
    minWidth: 180,
    valueGetter: (_value, row) =>
      [row.componentName, row.subComponentName || row.name].filter(Boolean).join(' / ') ||
      row.name ||
      '-',
  },
  { field: 'unit', headerName: 'Unit', width: 80 },
  {
    field: 'inbound',
    headerName: 'Received (+)',
    width: 120,
    valueGetter: (value) => value ?? 0,
  },
  {
    field: 'utilized',
    headerName: 'Utilized',
    width: 110,
    valueGetter: (value) => value ?? 0,
  },
  {
    field: 'returned',
    headerName: 'Returned (+)',
    width: 120,
    valueGetter: (value) => value ?? 0,
  },
  {
    field: 'warehouseQty',
    headerName: 'In Warehouse',
    width: 130,
    valueGetter: (value) => value ?? 0,
  },
];

function movementItemLabel(item) {
  if (!item) return '-';
  return (
    [item.componentName, item.subComponentName || item.name].filter(Boolean).join(' / ') || item.name || '-'
  );
}

function movementColumns(type) {
  const cols = [
    {
      field: 'stockItem',
      headerName: 'Item',
      flex: 1.6,
      minWidth: 220,
      valueGetter: (_value, row) => movementItemLabel(row.stockItem),
      csvValue: (row) => movementItemLabel(row.stockItem),
    },
    { field: 'quantity', headerName: 'Qty', width: 90 },
    {
      field: 'unit',
      headerName: 'UOM',
      width: 90,
      sortable: false,
      valueGetter: (value, row) => value || row.stockItem?.unit || '-',
      csvValue: (row) => row.unit || row.stockItem?.unit || '',
    },
    {
      field: 'movementDate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (value) => formatDate(value),
    },
  ];
  // Party columns sit right after the item column.
  const afterItem = 1;
  if (type === STOCK_MOVEMENT_TYPES.SUPPLIER_IN) {
    cols.splice(
      afterItem,
      0,
      {
        field: 'supplierName',
        headerName: 'Supplier',
        flex: 1,
        minWidth: 140,
        valueGetter: (value) => value || '-',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 110,
        valueGetter: (value) => value ?? 0,
      }
    );
  } else if (type === STOCK_MOVEMENT_TYPES.RETURN_IN || type === STOCK_MOVEMENT_TYPES.ISSUE_OUT) {
    cols.splice(afterItem, 0, {
      field: 'issuedTo',
      headerName: 'Person',
      flex: 1,
      minWidth: 140,
      valueGetter: (value) => value || '-',
    });
  }
  cols.push({
    field: 'remarks',
    headerName: 'Remarks',
    flex: 2,
    minWidth: 320,
    valueGetter: (value) => value || '-',
    renderCell: (params) => (
      <Tooltip title={params.value && params.value !== '-' ? params.value : ''} placement="top-start">
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'normal',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {params.value}
        </Typography>
      </Tooltip>
    ),
  });
  cols.push({
    field: 'referenceNo',
    headerName: 'Reference',
    width: 130,
    valueGetter: (value) => value || '-',
  });
  return cols;
}
