import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { deleteStockItems } from '../../features/stockItems/stockItemsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { stockApi } from '../../api/stockApi';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_MAX_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  WAREHOUSE_COLUMNS,
  emptySelectionModel,
  bulkDeleteMessage,
} from './stockItemsPageShared';

export default function StockWarehousePanel() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(STOCK_DEFAULT_PAGE_SIZE);
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

  const terms = search
    .trim()
    .toLowerCase()
    .split(/[\s/,]+/)
    .filter((term) => term && term !== '-');
  const filtered = rows.filter((row) => {
    if (!terms.length) return true;
    const haystack = [
      row.name,
      row.sku,
      row.categoryName,
      row.componentName,
      row.subComponentName,
      row.unit,
      row.inbound,
      row.utilized,
      row.returned,
      row.warehouseQty,
      ...(row.people || []).map((p) => p.name),
    ]
      .filter((value) => value !== undefined && value !== null)
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  const safePageSize = Math.min(Math.max(pageSize, 1), STOCK_MAX_PAGE_SIZE);
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
          setPageSize(Math.min(Math.max(next, 1), STOCK_MAX_PAGE_SIZE));
          setPage(1);
        }}
        pageSizeOptions={STOCK_PAGE_SIZE_OPTIONS}
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
