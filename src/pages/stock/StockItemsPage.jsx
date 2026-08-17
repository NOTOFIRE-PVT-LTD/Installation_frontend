import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StockItemDrawer from './StockItemDrawer';
import StockMovementDrawer from './StockMovementDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
} from '../../features/stockItems/stockItemsThunks';
import {
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from '../../features/stockMovements/stockMovementsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../utils/constants';
import { stockApi } from '../../api/stockApi';

const ITEM_COLUMNS = [
  {
    field: 'categoryName',
    headerName: 'Category',
    flex: 1,
    minWidth: 130,
    valueGetter: (value) => value || '-',
  },
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
];

const WAREHOUSE_COLUMNS = [
  {
    field: 'name',
    headerName: 'Item',
    flex: 1.2,
    minWidth: 180,
    valueGetter: (_value, row) =>
      [row.categoryName, row.componentName, row.subComponentName || row.name].filter(Boolean).join(' / ') ||
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
    field: 'referenceNo',
    headerName: 'Reference',
    width: 130,
    valueGetter: (value) => value || '-',
  });
  cols.push({
    field: 'remarks',
    headerName: 'Remarks',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  });
  return cols;
}

function ItemsPanel() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.stockItems);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', item: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchStockItems(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchStockItems(queryParams));

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawer.mode === 'create') {
        await dispatch(createStockItem(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Stock item created' }));
      } else {
        await dispatch(updateStockItem({ id: drawer.item._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Stock item updated' }));
      }
      setDrawer({ open: false, mode: 'create', item: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save item', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteStockItem(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Stock item deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete item', severity: 'error' }));
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setDrawer({ open: true, mode: 'create', item: null })}
        >
          Add Item
        </Button>
      </Box>
      <DataTable
        columns={ITEM_COLUMNS}
        rows={items}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
        onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search}
        onSearchChange={setSearch}
        actions={[
          {
            label: 'Edit',
            icon: <EditIcon fontSize="small" />,
            onClick: (row) => setDrawer({ open: true, mode: 'edit', item: row }),
          },
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" color="error" />,
            onClick: setConfirmDelete,
          },
        ]}
        onExportCsv={() => exportToCsv('stock-items', items, buildCsvColumns(ITEM_COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No stock items yet. Add a category, component, and sub component to start."
        storageKey="stock-items-catalog"
      />
      <StockItemDrawer
        open={drawer.open}
        mode={drawer.mode}
        item={drawer.item}
        submitting={submitting}
        onClose={() => setDrawer({ open: false, mode: 'create', item: null })}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Stock Item"
        message={`Delete "${confirmDelete?.name}"? Items with movements cannot be deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

function WarehousePanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    stockApi
      .summary()
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const peopleText = (row.people || []).map((p) => p.name).join(' ');
    return [row.name, row.sku, peopleText].join(' ').toLowerCase().includes(q);
  });

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Warehouse is the hub: receive stock, utilize, or return unused qty.
      </Typography>
      <DataTable
        columns={WAREHOUSE_COLUMNS}
        rows={filtered}
        totalCount={filtered.length}
        page={1}
        pageSize={Math.max(filtered.length, 10)}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchValue={search}
        onSearchChange={setSearch}
        onExportCsv={() => exportToCsv('warehouse-stock', filtered, buildCsvColumns(WAREHOUSE_COLUMNS))}
        loading={loading}
        emptyMessage="Warehouse is empty. Receive stock from a supplier first."
        storageKey="stock-warehouse"
      />
    </>
  );
}

function MovementsPanel({ type, actionLabel }) {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.stockMovements);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();
  const [drawer, setDrawer] = useState({ open: false, movement: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const columns = movementColumns(type);

  const listParams = { ...queryParams, type };

  useEffect(() => {
    dispatch(fetchStockMovements(listParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(listParams)]);

  const refresh = () => dispatch(fetchStockMovements(listParams));

  const closeDrawer = () => setDrawer({ open: false, movement: null });

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawer.movement) {
        await dispatch(updateStockMovement({ id: drawer.movement._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Stock movement updated' }));
      } else {
        await dispatch(createStockMovement(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Stock movement recorded' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save movement', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteStockMovement(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Movement deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete movement', severity: 'error' }));
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDrawer({ open: true, movement: null })}>
          {actionLabel}
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={items}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
        onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search}
        onSearchChange={setSearch}
        actions={[
          {
            label: 'Edit',
            icon: <EditIcon fontSize="small" />,
            onClick: (row) => setDrawer({ open: true, movement: row }),
          },
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" color="error" />,
            onClick: setConfirmDelete,
          },
        ]}
        onExportCsv={() => exportToCsv(`stock-${type}`, items, buildCsvColumns(columns))}
        loading={status === 'loading'}
        emptyMessage={`No ${STOCK_MOVEMENT_LABELS[type].toLowerCase()} records yet.`}
        storageKey={`stock-movements-${type}`}
      />
      <StockMovementDrawer
        open={drawer.open}
        type={type}
        movement={drawer.movement}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Movement"
        message="Delete this stock movement? Warehouse and person balances will be recalculated."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

export default function StockItemsPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <PageHeader
        title="Stock Items"
        subtitle="Internal company stock: receive, utilize, or return."
      />

      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}
      >
        {`SUPPLIER
    │  +qty receive
    ↓
WAREHOUSE
    │  −qty utilize (consumed)
    └── +qty return unused`}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_e, next) => setTab(next)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="1. Items" />
          <Tab label="2. Receive" />
          <Tab label="3. Warehouse" />
          <Tab label="4. Utilize" />
          <Tab label="5. Return" />
        </Tabs>
      </Box>

      {tab === 0 && <ItemsPanel />}
      {tab === 1 && (
        <MovementsPanel type={STOCK_MOVEMENT_TYPES.SUPPLIER_IN} actionLabel="Receive from Supplier" />
      )}
      {tab === 2 && <WarehousePanel />}
      {tab === 3 && (
        <MovementsPanel type={STOCK_MOVEMENT_TYPES.UTILIZE} actionLabel="Utilize / Consume" />
      )}
      {tab === 4 && (
        <MovementsPanel type={STOCK_MOVEMENT_TYPES.RETURN_IN} actionLabel="Return to Warehouse" />
      )}
    </>
  );
}
