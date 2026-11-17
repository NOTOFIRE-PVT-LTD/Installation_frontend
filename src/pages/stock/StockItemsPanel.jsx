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
import StockItemDrawer from './StockItemDrawer';
import StockItemImportDialog from './StockItemImportDialog';
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
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  ITEM_COLUMNS,
  emptySelectionModel,
  bulkDeleteMessage,
} from './stockItemsPageShared';

export default function StockItemsPanel() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.stockItems);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({ defaultPageSize: STOCK_DEFAULT_PAGE_SIZE });
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
        pageSizeOptions={STOCK_PAGE_SIZE_OPTIONS}
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
