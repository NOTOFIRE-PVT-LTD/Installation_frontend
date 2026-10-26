import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserFormDrawer from '../users/UserFormDrawer';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { peopleApi } from '../../api/peopleApi';
import { ROLES, USER_STATUS } from '../../utils/constants';

function formToPayload(formData) {
  return {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    mobileNumber: formData.get('mobileNumber'),
    gender: formData.get('gender'),
  };
}

export default function PeopleListPage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', user: null });
  const [submitting, setSubmitting] = useState(false);
  const [statusRow, setStatusRow] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await peopleApi.list(queryParams);
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load people', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = formToPayload(formData);
      if (drawer.mode === 'create') await peopleApi.create(payload);
      else await peopleApi.update(drawer.user._id, payload);
      dispatch(showSnackbar({ message: drawer.mode === 'create' ? 'Salesperson created' : 'Salesperson updated' }));
      setDrawer({ open: false, mode: 'create', user: null });
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const willActivate = statusRow?.status !== USER_STATUS.ACTIVE;

  const confirmStatus = async () => {
    if (!statusRow) return;
    setStatusBusy(true);
    const next = willActivate ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE;
    try {
      await peopleApi.updateStatus(statusRow._id, next);
      dispatch(showSnackbar({ message: willActivate ? 'Salesperson activated' : 'Salesperson deactivated' }));
      setStatusRow(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setStatusBusy(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', minWidth: 200 },
    { field: 'mobileNumber', headerName: 'Phone', minWidth: 140 },
    { field: 'gender', headerName: 'Gender', minWidth: 110 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 170,
      sortable: false,
      renderCell: (params) => {
        const active = params.row.status === USER_STATUS.ACTIVE;
        return (
          <Stack direction="row" alignItems="center" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Switch size="small" checked={active} onChange={() => setStatusRow(params.row)} color="primary" />
            <Typography variant="caption" sx={{ fontWeight: 600, color: active ? 'success.main' : 'text.secondary' }}>
              {active ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        );
      },
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawer({ open: true, mode: 'edit', user: row }),
    },
  ];

  const addButton = (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      onClick={() => setDrawer({ open: true, mode: 'create', user: { role: ROLES.USER } })}
    >
      Create salesperson
    </Button>
  );

  return (
    <>
      {!embedded && (
        <PageHeader title="People" subtitle="Salespeople for field tracking" actions={addButton} />
      )}
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
        searchValue={search}
        onSearchChange={setSearch}
        actions={actions}
        loading={loading}
        toolbarEnd={embedded ? addButton : null}
      />
      <UserFormDrawer
        open={drawer.open}
        mode={drawer.mode}
        user={drawer.user}
        submitting={submitting}
        onClose={() => setDrawer({ open: false, mode: 'create', user: null })}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(statusRow)}
        title={willActivate ? 'Activate salesperson' : 'Deactivate salesperson'}
        message={
          willActivate
            ? `Do you want to activate ${statusRow?.name || 'this salesperson'}?`
            : `Do you want to deactivate ${statusRow?.name || 'this salesperson'}?`
        }
        confirmLabel={willActivate ? 'Activate' : 'Deactivate'}
        confirmColor={willActivate ? 'primary' : 'error'}
        loading={statusBusy}
        onClose={() => setStatusRow(null)}
        onConfirm={confirmStatus}
      />
    </>
  );
}
