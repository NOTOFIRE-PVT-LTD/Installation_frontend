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
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StockItemDrawer from './StockItemDrawer';
import StockItemImportDialog from './StockItemImportDialog';
import StockMovementDrawer from './StockMovementDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  deleteStockItems,
  importStockItems,
} from '../../features/stockItems/stockItemsThunks';
import {
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  deleteStockMovements,
} from '../../features/stockMovements/stockMovementsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../utils/constants';
import { stockApi } from '../../api/stockApi';

function emptySelectionModel(ids = []) {
  return { type: 'include', ids: new Set(ids) };
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
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectionModel, setSelectionModel] = useState(() => emptySelectionModel());

  const handleSelectionChange = (model) => {
    setSelectionModel(emptySelectionModel(extractSelectedRowIds(model, items)));
  };

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
      setDeleting(true);
      await dispatch(deleteStockItem(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Stock item deleted' }));
      setConfirmDelete(null);
      setSelectionModel(emptySelectionModel());
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete item', severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = confirmBulkDelete || [];
    if (!ids.length) return;
    try {
      setDeleting(true);
      const result = await dispatch(deleteStockItems(ids)).unwrap();
      dispatch(
        showSnackbar({
          message: bulkDeleteMessage(result, 'item', 'items'),
          severity: result.failed?.length && !result.deleted?.length ? 'error' : 'success',
        })
      );
      setConfirmBulkDelete(null);
      setSelectionModel(emptySelectionModel());
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete items', severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async (formData) => {
    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const result = await dispatch(importStockItems(formData)).unwrap();
      setImportResult(result);
      dispatch(
        showSnackbar({
          message: `Imported ${result.inserted} item(s)${result.skipped ? `, ${result.skipped} skipped` : ''}`,
        })
      );
      refresh();
    } catch (err) {
      setImportError(err || 'Failed to import stock items');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
        <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={() => {
          setImportOpen(true);
          setImportResult(null);
          setImportError('');
        }}>
          Import Excel
        </Button>
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
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        onBulkDelete={(ids) => {
          if (!ids?.length) {
            dispatch(showSnackbar({ message: 'No valid items selected', severity: 'warning' }));
            return;
          }
          setConfirmBulkDelete(ids);
        }}
        onExportCsv={() => exportToCsv('stock-items', items, buildCsvColumns(ITEM_COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No stock items yet. Add a component and optional sub component to start."
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
      <StockItemImportDialog
        open={importOpen}
        submitting={importing}
        result={importResult}
        error={importError}
        onClose={() => setImportOpen(false)}
        onSubmit={handleImport}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Stock Item"
        message={`Delete "${confirmDelete?.name}"? Items with movements cannot be deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(confirmBulkDelete)}
        title="Delete Selected Items"
        message={`Delete ${confirmBulkDelete?.length || 0} selected item(s)? Items with stock movements will be skipped.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleBulkDelete}
        onClose={() => {
          if (!deleting) setConfirmBulkDelete(null);
        }}
      />
    </>
  );
}

function WarehousePanel() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectionModel, setSelectionModel] = useState(() => emptySelectionModel());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRows = () => {
    setLoading(true);
    stockApi
      .summary()
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRows();
  }, []);

  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const peopleText = (row.people || []).map((p) => p.name).join(' ');
    return [row.name, row.sku, peopleText].join(' ').toLowerCase().includes(q);
  });

  const safePageSize = Math.min(Math.max(pageSize, 1), 100);
  const totalPages = Math.max(1, Math.ceil(filtered.length / safePageSize) || 1);
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * safePageSize, currentPage * safePageSize);

  const handleSelectionChange = (model) => {
    setSelectionModel(emptySelectionModel(extractSelectedRowIds(model, pagedRows)));
  };

  const handleBulkDelete = async () => {
    const ids = confirmBulkDelete || [];
    if (!ids.length) return;
    try {
      setDeleting(true);
      const result = await dispatch(deleteStockItems(ids)).unwrap();
      dispatch(
        showSnackbar({
          message: bulkDeleteMessage(result, 'item', 'items'),
          severity: result.failed?.length && !result.deleted?.length ? 'error' : 'success',
        })
      );
      setConfirmBulkDelete(null);
      setSelectionModel(emptySelectionModel());
      loadRows();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete items', severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Warehouse is the hub: receive stock, utilize, or return unused qty.
      </Typography>
      <DataTable
        columns={WAREHOUSE_COLUMNS}
        rows={pagedRows}
        totalCount={filtered.length}
        page={currentPage}
        pageSize={safePageSize}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(Math.min(Math.max(next, 1), 100));
          setPage(1);
        }}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        onBulkDelete={(ids) => {
          if (!ids?.length) {
            dispatch(showSnackbar({ message: 'No valid items selected', severity: 'warning' }));
            return;
          }
          setConfirmBulkDelete(ids);
        }}
        onExportCsv={() => exportToCsv('warehouse-stock', filtered, buildCsvColumns(WAREHOUSE_COLUMNS))}
        loading={loading}
        emptyMessage="Warehouse is empty. Receive stock from a supplier first."
        storageKey="stock-warehouse"
      />
      <ConfirmDialog
        open={Boolean(confirmBulkDelete)}
        title="Delete Selected Items"
        message={`Delete ${confirmBulkDelete?.length || 0} selected warehouse item(s)? Items with stock movements will be skipped.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleBulkDelete}
        onClose={() => {
          if (!deleting) setConfirmBulkDelete(null);
        }}
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectionModel, setSelectionModel] = useState(() => emptySelectionModel());
  const columns = movementColumns(type);

  const listParams = { ...queryParams, type };

  useEffect(() => {
    dispatch(fetchStockMovements(listParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(listParams)]);

  const refresh = () => dispatch(fetchStockMovements(listParams));

  const closeDrawer = () => setDrawer({ open: false, movement: null });

  const handleSelectionChange = (model) => {
    setSelectionModel(emptySelectionModel(extractSelectedRowIds(model, items)));
  };

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
      setDeleting(true);
      await dispatch(deleteStockMovement(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Movement deleted' }));
      setConfirmDelete(null);
      setSelectionModel(emptySelectionModel());
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete movement', severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = confirmBulkDelete || [];
    if (!ids.length) return;
    try {
      setDeleting(true);
      const result = await dispatch(deleteStockMovements(ids)).unwrap();
      dispatch(
        showSnackbar({
          message: bulkDeleteMessage(result, 'movement', 'movements'),
          severity: result.failed?.length && !result.deleted?.length ? 'error' : 'success',
        })
      );
      setConfirmBulkDelete(null);
      setSelectionModel(emptySelectionModel());
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete movements', severity: 'error' }));
    } finally {
      setDeleting(false);
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
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        onBulkDelete={(ids) => {
          if (!ids?.length) {
            dispatch(showSnackbar({ message: 'No valid movements selected', severity: 'warning' }));
            return;
          }
          setConfirmBulkDelete(ids);
        }}
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
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(confirmBulkDelete)}
        title="Delete Selected Movements"
        message={`Delete ${confirmBulkDelete?.length || 0} selected movement(s)? Balances will be recalculated. Blocked records will be skipped.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleBulkDelete}
        onClose={() => {
          if (!deleting) setConfirmBulkDelete(null);
        }}
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
