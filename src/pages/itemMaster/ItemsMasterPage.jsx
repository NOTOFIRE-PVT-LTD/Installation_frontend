import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridViewOutlined';
import TableRowsIcon from '@mui/icons-material/TableRowsOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MasterItemDialog from './MasterItemDialog';
import MasterItemCard from './MasterItemCard';
import { useDebounce } from '../../hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchMasterItems,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
} from '../../features/itemMaster/itemMasterThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { itemMasterApi } from '../../api/itemMasterApi';
import { CATALOG_FIELDS } from './itemMasterFields';

const FILTER_FIELDS = ['itemCategory', 'qtyType', 'payment'];
const VIEW_STORAGE_KEY = 'items-master-view';

const name = (value) => value?.name || '';

const money = (value) =>
  value === null || value === undefined
    ? '-'
    : `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLUMNS = [
  {
    field: 'endUse',
    headerName: 'End Use (Item/Location)',
    flex: 1.2,
    minWidth: 190,
    valueGetter: (value) => value || '-',
  },
  { field: 'personAsked', headerName: 'Requested By', flex: 1, minWidth: 140, valueGetter: (value) => value || '-' },
  {
    field: 'priceGuarantee',
    headerName: 'Price Guarantee',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'itemCategory',
    headerName: 'Item Category',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => name(value) || '-',
    csvValue: (row) => name(row.itemCategory),
  },
  { field: 'itemName', headerName: 'Item Name', flex: 1.3, minWidth: 180, valueGetter: (value) => value || '-' },
  {
    field: 'itemDescription',
    headerName: 'Item Description',
    flex: 1.4,
    minWidth: 200,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'quantity',
    headerName: 'Quantity',
    width: 120,
    valueGetter: (_value, row) => [row.quantity ?? 0, name(row.qtyType)].filter(Boolean).join(' '),
    csvValue: (row) => [row.quantity ?? 0, name(row.qtyType)].filter(Boolean).join(' '),
  },
  {
    field: 'qtyType',
    headerName: 'Qty Type',
    width: 120,
    valueGetter: (value) => name(value) || '-',
    csvValue: (row) => name(row.qtyType),
  },
  { field: 'price', headerName: 'Price', width: 120, valueGetter: (value) => money(value) },
  { field: 'totalAmount', headerName: 'Total Amount', width: 140, valueGetter: (value) => money(value) },
  {
    field: 'payment',
    headerName: 'Payment',
    flex: 1,
    minWidth: 130,
    valueGetter: (value) => name(value) || '-',
    csvValue: (row) => name(row.payment),
  },
];

function CardsToolbar({ search, onSearchChange, filterOptions, filterValues, onFilterChange, onExportCsv }) {
  const [localSearch, setLocalSearch] = useState(search || '');
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{ mb: 2 }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
    >
      <TextField
        size="small"
        placeholder="Search items…"
        value={localSearch}
        onChange={(event) => setLocalSearch(event.target.value)}
        sx={{
          minWidth: { xs: 0, md: 260 },
          maxWidth: { xs: '100%', md: 360 },
          flex: 1,
          '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: 'background.default' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {FILTER_FIELDS.map((field) => (
          <TextField
            key={field}
            select
            size="small"
            label={CATALOG_FIELDS.find((entry) => entry.name === field)?.label || field}
            value={filterValues[field] || ''}
            onChange={(event) => onFilterChange(field, event.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.75rem' } }}
          >
            <MenuItem value="">All</MenuItem>
            {(filterOptions[field] || []).map((opt) => (
              <MenuItem key={opt._id} value={opt._id}>
                {opt.name}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <Tooltip title="Export CSV">
          <IconButton
            onClick={onExportCsv}
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: '#ecfdf5',
              color: '#059669',   
              border: '1px solid #a7f3d0',
              '&:hover': { bgcolor: '#d1fae5', color: '#047857' },
            }}
          >
            <DownloadIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default function ItemsMasterPage() {
  const dispatch = useAppDispatch();
  const { items, total, totalPages, status } = useAppSelector((state) => state.itemMaster);
  const {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilter,
    queryParams,
  } = useTableQueryParams({ filterKeys: FILTER_FIELDS });

  const [dialog, setDialog] = useState({ open: false, mode: 'create', item: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [view, setView] = useState(() => localStorage.getItem(VIEW_STORAGE_KEY) || 'cards');

  useEffect(() => {
    dispatch(fetchMasterItems(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    Promise.all(
      FILTER_FIELDS.map((kind) =>
        itemMasterApi
          .listCatalog({ kind })
          .then((res) => [kind, res.data?.data || []])
          .catch(() => [kind, []])
      )
    ).then((entries) => setFilterOptions(Object.fromEntries(entries)));
  }, [dialog.open]);

  const refresh = () => dispatch(fetchMasterItems(queryParams));

  const closeDialog = () => setDialog({ open: false, mode: 'create', item: null });

  const changeView = (next) => {
    if (!next) return;
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const exportCsv = () => exportToCsv('items-master', items, buildCsvColumns(COLUMNS));

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (dialog.mode === 'edit') {
        await dispatch(updateMasterItem({ id: dialog.item._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Master item updated' }));
      } else {
        await dispatch(createMasterItem(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Master item created' }));
      }
      closeDialog();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save master item', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteMasterItem(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Master item deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete master item', severity: 'error' }));
    }
  };

  return (
    <>
      <PageHeader
        title="Items Master"
        subtitle="Central catalogue of every purchasable item, its categories, pricing and usage."
      />

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} alignItems="center" justifyContent="flex-end">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_event, next) => changeView(next)}
          sx={{ '& .MuiToggleButton-root': { px: 1.25, py: 0.5, borderRadius: '8px' } }}
        >
          <ToggleButton value="cards" aria-label="Card view">
            <Tooltip title="Card view">
              <GridViewIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table view">
            <Tooltip title="Table view">
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setDialog({ open: true, mode: 'create', item: null })}
        >
          New Master Item
        </Button>
      </Stack>

      {view === 'cards' ? (
        <>
          <CardsToolbar
            search={search}
            onSearchChange={setSearch}
            filterOptions={filterOptions}
            filterValues={filters}
            onFilterChange={setFilter}
            onExportCsv={exportCsv}
          />

          {status === 'loading' ? (
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : items.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
              }}
            >
              <Typography color="text.secondary">No master items yet. Create your first item.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <MasterItemCard
                    item={item}
                    onView={() => setDialog({ open: true, mode: 'view', item })}
                    onEdit={() => setDialog({ open: true, mode: 'edit', item })}
                    onDelete={() => setConfirmDelete(item)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event, next) => setPage(next)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          )}
        </>
      ) : (
        <DataTable
          columns={COLUMNS}
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
          filters={FILTER_FIELDS.map((field) => ({
            field,
            label: CATALOG_FIELDS.find((entry) => entry.name === field)?.label || field,
            options: (filterOptions[field] || []).map((opt) => ({ value: opt._id, label: opt.name })),
          }))}
          filterValues={filters}
          onFilterChange={setFilter}
          onRowClick={(row) => setDialog({ open: true, mode: 'view', item: row })}
          actions={[
            {
              label: 'View',
              icon: <VisibilityIcon fontSize="small" />,
              onClick: (row) => setDialog({ open: true, mode: 'view', item: row }),
            },
            {
              label: 'Edit',
              icon: <EditIcon fontSize="small" />,
              onClick: (row) => setDialog({ open: true, mode: 'edit', item: row }),
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize="small" color="error" />,
              onClick: setConfirmDelete,
            },
          ]}
          onExportCsv={exportCsv}
          loading={status === 'loading'}
          emptyMessage="No master items yet. Create your first item."
          storageKey="items-master"
        />
      )}

      <MasterItemDialog
        open={dialog.open}
        mode={dialog.mode}
        item={dialog.item}
        submitting={submitting}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Master Item"
        message={`Delete "${confirmDelete?.itemName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
