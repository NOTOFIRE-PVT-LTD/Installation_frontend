import Box from '@mui/material/Box';

function formatCell(v) {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

const PREFERRED = {
  shipments: ['shipment_number', 'customer_name', 'stage', 'destination_city', 'dispatch_date'],
  products: ['sku', 'name', 'category', 'unit_weight', 'active'],
  cartons: ['name', 'length', 'width', 'height', 'active'],
  locations: ['name', 'city', 'state', 'pincode'],
  couriers: ['name', 'code', 'active'],
  invoices: ['invoice_number', 'courier_name', 'status', 'invoice_date'],
  discrepancies: ['shipment_number', 'status', 'notes'],
  packing: ['shipment_number', 'packed_at', 'notes'],
  people: ['full_name', 'email', 'role', 'active'],
  reconciliation: ['status', 'created_at'],
  dispatches: ['dispatch_number', 'status', 'dispatch_date'],
  dispatch: ['title', 'status', 'needed_by'],
  settings: ['key', 'value'],
  audit: ['action', 'actor_email', 'created_at'],
  imports: ['import_no', 'title', 'status', 'po_number', 'currency'],
  suppliers: ['name', 'country', 'is_active'],
  documents: ['name', 'doc_type', 'status'],
  tasks: ['title', 'status', 'due_date'],
  payments: ['amount', 'currency', 'status', 'paid_at'],
  cha: ['name', 'code', 'is_active'],
  inbox: ['subject', 'status', 'created_at'],
  review: ['request_no', 'status', 'created_at'],
};

const linkSx = {
  all: 'unset',
  cursor: 'pointer',
  color: '#8A5D18',
  fontWeight: 700,
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  '&:hover': { color: '#583714' },
};

function shipmentNumberColumn(onOpenShipment) {
  return {
    field: 'shipment_number',
    headerName: 'Shipment Number',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Box
        component="button"
        type="button"
        sx={linkSx}
        onClick={(e) => {
          e.stopPropagation();
          onOpenShipment?.(params.row);
        }}
      >
        {formatCell(params.row?.shipment_number)}
      </Box>
    ),
  };
}

export function pickColumns(tab, sample, { onOpenShipment } = {}) {
  const keys =
    PREFERRED[tab] ||
    Object.keys(sample || {})
      .filter((k) => !['mongoId', '_pgId', 'id', 'pgId', '_gridId'].includes(k))
      .slice(0, 5);

  return keys.map((field) => {
    if (field === 'shipment_number' && onOpenShipment) {
      return shipmentNumberColumn(onOpenShipment);
    }
    return {
      field,
      headerName: field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      flex: 1,
      minWidth: 120,
      valueGetter: (_value, row) => formatCell(row?.[field]),
    };
  });
}

export { formatCell };
