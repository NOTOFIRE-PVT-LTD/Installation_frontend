import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import PaidIcon from '@mui/icons-material/PaidOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PaymentDrawer from './PaymentDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
} from '../../features/payments/paymentsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_STATUS } from '../../utils/constants';

const COLUMNS = [
  {
    field: 'project',
    headerName: 'Project',
    flex: 1,
    minWidth: 160,
    valueGetter: (value, row) => row.project?.projectName || '-',
    csvValue: (row) => row.project?.projectName,
  },
  { field: 'method', headerName: 'Method', width: 130 },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 140,
    valueFormatter: (value) => formatCurrency(value),
  },
  { field: 'status', headerName: 'Status', width: 130 },
];

export default function PaymentsListPage() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.payments);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['status'] });

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', payment: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchPayments(queryParams));

  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', payment: null });

  const handleDrawerSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createPayment(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Payment created successfully' }));
      } else {
        await dispatch(updatePayment({ id: drawerState.payment._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Payment updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save payment', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePayment(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Payment deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete payment', severity: 'error' }));
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      await dispatch(updatePaymentStatus({ id: row._id, status: newStatus })).unwrap();
      dispatch(showSnackbar({ message: `Payment marked as ${newStatus}` }));
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update payment status', severity: 'error' }));
    }
  };

  const actions = [
    { label: 'View', icon: <VisibilityIcon fontSize="small" />, onClick: (row) => setDrawerState({ open: true, mode: 'view', payment: row }) },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      show: (row) => row.status === PAYMENT_STATUS.PENDING,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', payment: row }),
    },
    {
      label: 'Approve',
      icon: <CheckCircleIcon fontSize="small" color="success" />,
      show: (row) => row.status === PAYMENT_STATUS.PENDING,
      onClick: (row) => handleStatusChange(row, PAYMENT_STATUS.APPROVED),
    },
    {
      label: 'Mark Paid',
      icon: <PaidIcon fontSize="small" color="primary" />,
      show: (row) => row.status === PAYMENT_STATUS.APPROVED,
      onClick: (row) => handleStatusChange(row, PAYMENT_STATUS.PAID),
    },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Track installer and contractor payments"
        actions={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setDrawerState({ open: true, mode: 'create', payment: null })}
          >
            Add Payment
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
        statusField="status"
        filters={[{ field: 'status', label: 'Status', options: Object.values(PAYMENT_STATUS).map((s) => ({ value: s, label: s })) }]}
        filterValues={filters}
        onFilterChange={setFilter}
        actions={actions}
        onExportCsv={() => exportToCsv('payments', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No payments found"
        storageKey="payments"
      />

      <PaymentDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        payment={drawerState.payment}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? This cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
