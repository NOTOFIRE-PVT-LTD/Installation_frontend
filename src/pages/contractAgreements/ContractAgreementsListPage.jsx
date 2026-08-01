import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContractAgreementDrawer from './ContractAgreementDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchContractAgreements,
  createContractAgreement,
  updateContractAgreement,
  deleteContractAgreement,
} from '../../features/contractAgreements/contractAgreementsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';

const COLUMNS = [
  {
    field: 'tenderName',
    headerName: 'Tender Name',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'caNumber',
    headerName: 'CA Number',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'caDate',
    headerName: 'CA Date',
    width: 140,
    valueFormatter: (value) => formatDate(value),
  },
];

export default function ContractAgreementsListPage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.contractAgreements);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', document: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchContractAgreements(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchContractAgreements(queryParams));
  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', document: null });

  const handleDrawerSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createContractAgreement(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Contract agreement created successfully' }));
      } else {
        await dispatch(updateContractAgreement({ id: drawerState.document._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Contract agreement updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save contract agreement', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteContractAgreement(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Contract agreement deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete contract agreement', severity: 'error' }));
    }
  };

  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'view', document: row }),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', document: row }),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      onClick: setConfirmDelete,
    },
  ];

  const addButton = (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      onClick={() => setDrawerState({ open: true, mode: 'create', document: null })}
    >
      Add Contract Agreement
    </Button>
  );

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Contract Agreement"
          subtitle="Step 2 after BG Document — CA Date, CA Number, Tender Name"
          actions={addButton}
        />
      )}
      {embedded && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {addButton}
        </Box>
      )}

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
        onExportCsv={() => exportToCsv('contract-agreements', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No contract agreements found"
        storageKey="contract-agreements"
      />

      <ContractAgreementDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        document={drawerState.document}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Contract Agreement"
        message={`Delete CA "${confirmDelete?.caNumber || 'this record'}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
