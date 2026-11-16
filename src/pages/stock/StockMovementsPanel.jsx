import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StockMovementDrawer from './StockMovementDrawer';
import StockReceiveImportDialog from './StockReceiveImportDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  deleteStockMovements,
  importStockReceives,
} from '../../features/stockMovements/stockMovementsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../utils/constants';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  emptySelectionModel,
  bulkDeleteMessage,
  movementColumns,
} from './stockItemsPageShared';

export default function StockMovementsPanel({ type, actionLabel }) {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.stockMovements);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({ defaultPageSize: STOCK_DEFAULT_PAGE_SIZE });
  const [drawer, setDrawer] = useState({ open: false, movement: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectionModel, setSelectionModel] = useState(() => emptySelectionModel());
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const columns = movementColumns(type);
  const canImportReceive = type === STOCK_MOVEMENT_TYPES.SUPPLIER_IN;

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

  const handleImport = async (formData) => {
    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const result = await dispatch(importStockReceives(formData)).unwrap();
      setImportResult(result);
      dispatch(
        showSnackbar({
          message: `Imported ${result.inserted} of ${result.total} receive rows`,
          severity: result.inserted ? 'success' : 'warning',
        })
      );
      refresh();
    } catch (err) {
      setImportError(err || 'Failed to import receive records');
    } finally {
      setImporting(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
        {canImportReceive && (
          <Button
            startIcon={<UploadFileIcon />}
            variant="outlined"
            onClick={() => {
              setImportResult(null);
              setImportError('');
              setImportOpen(true);
            }}
          >
            Import Excel
          </Button>
        )}
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
        pageSizeOptions={STOCK_PAGE_SIZE_OPTIONS}
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
      {canImportReceive && (
        <StockReceiveImportDialog
          open={importOpen}
          submitting={importing}
          result={importResult}
          error={importError}
          onClose={() => setImportOpen(false)}
          onSubmit={handleImport}
        />
      )}
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
