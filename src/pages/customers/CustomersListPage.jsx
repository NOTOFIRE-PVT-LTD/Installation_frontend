import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CustomerDrawer from './CustomerDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../features/customers/customersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { peopleApi } from '../../api/peopleApi';
import { ROLES } from '../../utils/constants';

const COLUMNS = [
  { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 180 },
  { field: 'contactPerson', headerName: 'Contact', minWidth: 140 },
  { field: 'phone', headerName: 'Phone', minWidth: 130 },
  { field: 'city', headerName: 'City', minWidth: 120 },
  { field: 'gstin', headerName: 'GSTIN', minWidth: 160 },
  {
    field: 'assignedSalesperson',
    headerName: 'Salesperson',
    minWidth: 160,
    valueGetter: (_value, row) => row.assignedSalesperson?.name || 'Unassigned',
  },
];

export default function CustomersListPage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const canEdit = user?.role === ROLES.ADMIN;
  const { items, total, status } = useAppSelector((state) => state.customers);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [drawer, setDrawer] = useState({ open: false, mode: 'create', customer: null });
  const [matches, setMatches] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [salespersonOptions, setSalespersonOptions] = useState([]);

  useEffect(() => {
    dispatch(fetchCustomers(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    if (!canEdit) return;
    peopleApi
      .list({ pageSize: 100 })
      .then(({ data }) => setSalespersonOptions((data.data || []).map((u) => ({ value: u._id, label: u.name }))))
      .catch(() => setSalespersonOptions([]));
  }, [canEdit]);

  const refresh = () => dispatch(fetchCustomers(queryParams));

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (drawer.mode === 'create') {
        await dispatch(createCustomer(values)).unwrap();
        dispatch(showSnackbar({ message: 'Customer created' }));
      } else {
        await dispatch(updateCustomer({ id: drawer.customer._id, payload: values })).unwrap();
        dispatch(showSnackbar({ message: 'Customer updated' }));
      }
      setDrawer({ open: false, mode: 'create', customer: null });
      setMatches(null);
      refresh();
    } catch (err) {
      const payload = typeof err === 'string' ? { message: err } : err;
      setMatches(payload?.matches || null);
      dispatch(showSnackbar({ message: payload?.message || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCustomer(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Customer deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete', severity: 'error' }));
    }
  };

  const actions = canEdit
    ? [
        {
          label: 'Edit',
          icon: <EditIcon fontSize="small" />,
          onClick: (row) => {
            setMatches(null);
            setDrawer({ open: true, mode: 'edit', customer: row });
          },
        },
        { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
      ]
    : [
        {
          label: 'View',
          icon: <VisibilityIcon fontSize="small" />,
          onClick: (row) => setDrawer({ open: true, mode: 'view', customer: row }),
        },
      ];

  const addButton = canEdit ? (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      onClick={() => {
        setMatches(null);
        setDrawer({ open: true, mode: 'create', customer: null });
      }}
    >
      New customer
    </Button>
  ) : null;

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Customers"
          subtitle={canEdit ? 'Field sales customer master' : 'Customers assigned to you'}
          actions={addButton}
        />
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
        loading={status === 'loading'}
        toolbarEnd={embedded ? addButton : null}
      />

      <CustomerDrawer
        open={drawer.open}
        mode={drawer.mode === 'view' ? 'edit' : drawer.mode}
        customer={drawer.customer}
        salespersonOptions={salespersonOptions}
        matches={matches}
        onClose={() => setDrawer({ open: false, mode: 'create', customer: null })}
        onSubmit={handleSubmit}
        submitting={submitting}
        readOnly={!canEdit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete customer"
        message={`Delete ${confirmDelete?.companyName || 'this customer'}?`}
        confirmLabel="Delete"
        confirmColor="error"
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
