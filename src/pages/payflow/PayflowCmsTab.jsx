import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PayflowFormDialog from './PayflowFormDialog';
import { PAYFLOW_TABS } from './payflowConfig';
import { payflowApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';

const CLOSED_DIALOG = { open: false, mode: 'create', entry: null };

export default function PayflowCmsTab() {
  const dispatch = useAppDispatch();
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [tabIndex, setTabIndex] = useState(0);
  const tab = PAYFLOW_TABS[tabIndex];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState(CLOSED_DIALOG);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const columns = useMemo(
    () => tab.fields.map((f) => ({ field: f.name, headerName: f.label, flex: 1, minWidth: 160 })),
    [tab]
  );

  const paramsKey = JSON.stringify(queryParams);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowApi.list(tab.resource, queryParams);
      setRows(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || `Failed to fetch ${tab.label.toLowerCase()}`, severity: 'error' }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.resource, paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (_, value) => {
    setTabIndex(value);
    setRows([]);
    setSearch('');
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        await payflowApi.create(tab.resource, values);
        dispatch(showSnackbar({ message: `${tab.singular} created successfully` }));
      } else {
        await payflowApi.update(tab.resource, dialogState.entry._id, values);
        dispatch(showSnackbar({ message: `${tab.singular} updated successfully` }));
      }
      setDialogState(CLOSED_DIALOG);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await payflowApi.remove(tab.resource, confirmDelete._id);
      dispatch(showSnackbar({ message: `${tab.singular} deleted` }));
      setConfirmDelete(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || `Failed to delete ${tab.singular.toLowerCase()}`, severity: 'error' }));
    }
  };

  const actions = [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: (row) => setDialogState({ open: true, mode: 'edit', entry: row }) },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
  ];

  return (
    <>
      <PageHeader
        title="CMS"
        subtitle={tab.subtitle}
        actions={
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDialogState({ open: true, mode: 'create', entry: null })}>
            Add {tab.singular}
          </Button>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {PAYFLOW_TABS.map((t) => (
            <Tab key={t.resource} label={t.label} />
          ))}
        </Tabs>
      </Box>

      <DataTable
        key={tab.resource}
        columns={columns}
        rows={rows}
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
        onExportCsv={() => exportToCsv(`payflow-${tab.resource}`, rows, buildCsvColumns(columns))}
        loading={loading}
        emptyMessage={`No ${tab.label.toLowerCase()} found`}
        storageKey={`payflow-${tab.resource}`}
      />

      <PayflowFormDialog
        open={dialogState.open}
        mode={dialogState.mode}
        tab={tab}
        entry={dialogState.entry}
        submitting={submitting}
        onClose={() => setDialogState(CLOSED_DIALOG)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete ${tab.singular}`}
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
