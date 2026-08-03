import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BgApplicationDrawer from './BgApplicationDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchBgApplications,
  createBgApplication,
  updateBgApplication,
  deleteBgApplication,
} from '../../features/bgApplications/bgApplicationsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { downloadBgApplicationPdf } from '../../utils/bgApplicationExport';

function firstLine(value) {
  if (!value) return '';
  return String(value).split(/\r?\n/)[0].trim();
}

const COLUMNS = [
  {
    field: 'applicantNameAddress',
    headerName: 'Applicant',
    flex: 1,
    minWidth: 160,
    valueGetter: (value) => firstLine(value),
  },
  {
    field: 'beneficiaryNameAddress',
    headerName: 'Beneficiary',
    flex: 1,
    minWidth: 160,
    valueGetter: (value) => firstLine(value),
  },
  { field: 'typeOfBG', headerName: 'Type of BG', width: 130 },
  { field: 'bgAmountFigures', headerName: 'BG Amount', width: 150 },
  { field: 'expiryDate', headerName: 'Expiry Date', width: 130, valueFormatter: (value) => formatDate(value) },
  { field: 'claimExpiryDate', headerName: 'Claim Expiry Date', width: 150, valueFormatter: (value) => formatDate(value) },
  { field: 'branchName', headerName: 'Branch Name', width: 150 },
];

export default function AccountsListPage() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.bgApplications);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', application: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBgApplications(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchBgApplications(queryParams));

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createBgApplication(payload)).unwrap();
        dispatch(showSnackbar({ message: 'BG application created successfully' }));
      } else {
        await dispatch(updateBgApplication({ id: drawerState.application._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'BG application updated successfully' }));
      }
      setDrawerState({ open: false, mode: 'create', application: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save BG application', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteBgApplication(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'BG application deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete BG application', severity: 'error' }));
    }
  };

  const actions = [
    { label: 'View', icon: <VisibilityIcon fontSize="small" />, onClick: (row) => setDrawerState({ open: true, mode: 'view', application: row }) },
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: (row) => setDrawerState({ open: true, mode: 'edit', application: row }) },
    {
      label: 'Download PDF',
      icon: <PrintIcon fontSize="small" />,
      onClick: (row) => downloadBgApplicationPdf(row),
    },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
  ];

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Bank Guarantee applications — fill, save, and print"
        actions={
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDrawerState({ open: true, mode: 'create', application: null })}>
            Add BG Application
          </Button>
        }
      />

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
        onRowClick={(row) => setDrawerState({ open: true, mode: 'view', application: row })}
        onExportCsv={() => exportToCsv('bg-applications', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No BG applications found"
        storageKey="bg-applications"
      />

      <BgApplicationDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        application={drawerState.application}
        submitting={submitting}
        onClose={() => setDrawerState({ open: false, mode: 'create', application: null })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete BG Application"
        message={`Are you sure you want to delete the BG application for "${firstLine(confirmDelete?.applicantNameAddress)}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
