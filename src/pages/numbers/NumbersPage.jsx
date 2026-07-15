import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NumberFormDialog from './NumberFormDialog';
import NumberImportDialog from './NumberImportDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { fetchNumbers, createNumber, updateNumber, deleteNumber, importNumbers } from '../../features/numbers/numbersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { NUMBER_CATEGORIES } from '../../utils/constants';

const CATEGORIES = Object.values(NUMBER_CATEGORIES);

const COLUMNS = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
  { field: 'number', headerName: 'Number', width: 180 },
  { field: 'region', headerName: 'Region', width: 180 },
];

export default function NumbersPage() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.numbers);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dialogState, setDialogState] = useState({ open: false, mode: 'create', entry: null });
  const [importState, setImportState] = useState({ open: false, result: null, error: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fullParams = { ...queryParams, category };

  useEffect(() => {
    dispatch(fetchNumbers(fullParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fullParams)]);

  const refresh = () => dispatch(fetchNumbers(fullParams));

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        await dispatch(createNumber(values)).unwrap();
        dispatch(showSnackbar({ message: 'Entry created successfully' }));
      } else {
        await dispatch(updateNumber({ id: dialogState.entry._id, payload: values })).unwrap();
        dispatch(showSnackbar({ message: 'Entry updated successfully' }));
      }
      setDialogState({ open: false, mode: 'create', entry: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteNumber(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Entry deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete entry', severity: 'error' }));
    }
  };

  const handleImport = async (formData) => {
    setSubmitting(true);
    try {
      const data = await dispatch(importNumbers(formData)).unwrap();
      setImportState((prev) => ({ ...prev, result: data.data, error: null }));
      refresh();
    } catch (err) {
      setImportState((prev) => ({ ...prev, result: null, error: err || 'Import failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: (row) => setDialogState({ open: true, mode: 'edit', entry: row }) },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
  ];

  return (
    <>
      <PageHeader
        title="Numbers"
        subtitle="Government Official, Installer, and Management contact directory"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<UploadFileIcon />}
              variant="outlined"
              onClick={() => setImportState({ open: true, result: null, error: null })}
            >
              Import from Excel
            </Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDialogState({ open: true, mode: 'create', entry: null })}>
              Add Entry
            </Button>
          </Stack>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={category}
          onChange={(e, value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          {CATEGORIES.map((cat) => (
            <Tab key={cat} value={cat} label={`${cat} Number`} />
          ))}
        </Tabs>
      </Box>

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
        actions={actions}
        onExportCsv={() => exportToCsv(`${category.toLowerCase().replace(/\s+/g, '-')}-numbers`, items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage={`No ${category} numbers found`}
        storageKey="numbers"
      />

      <NumberFormDialog
        open={dialogState.open}
        mode={dialogState.mode}
        entry={dialogState.entry}
        category={category}
        submitting={submitting}
        onClose={() => setDialogState({ open: false, mode: 'create', entry: null })}
        onSubmit={handleSubmit}
      />

      <NumberImportDialog
        open={importState.open}
        category={category}
        submitting={submitting}
        result={importState.result}
        error={importState.error}
        onClose={() => setImportState({ open: false, result: null, error: null })}
        onSubmit={handleImport}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Entry"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
