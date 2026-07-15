import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LoginIcon from '@mui/icons-material/LoginOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserFormDrawer from './UserFormDrawer';
import PermissionsDialog from './PermissionsDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  updateUserPermissions,
  impersonateUser,
} from '../../features/users/usersThunks';
import { startImpersonation } from '../../features/auth/authSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { ROLES, USER_STATUS } from '../../utils/constants';
import { getDefaultLandingPath } from '../../routes/routeConfig';

const ROLE_STYLE = {
  [ROLES.ADMIN]: { color: '#7c3aed', bg: '#f3e8ff' },
  [ROLES.USER]: { color: '#0891b2', bg: '#e0f7fa' },
};

const AVATAR_COLORS = ['#2f6fed', '#20b486', '#d97706', '#7c3aed', '#0891b2', '#ef4444'];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const COLUMNS = [
  {
    field: 'profileImage',
    headerName: 'Photo',
    sortable: false,
    filterable: false,
    width: 56,
    minWidth: 56,
    maxWidth: 56,
    disableColumnMenu: true,
    renderCell: (params) => {
      const color = avatarColor(params.row.name);
      return (
        <Avatar
          src={params.row.profileImage?.url}
          sx={{
            width: 30,
            height: 30,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: `${color}18`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          {params.row.name?.[0]?.toUpperCase()}
        </Avatar>
      );
    },
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 140,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 600, fontSize: '0.75rem' }} noWrap title={params.row.name}>
        {params.row.name || '—'}
      </Typography>
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.2,
    minWidth: 180,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.75rem' }} noWrap title={params.row.email}>
        {params.row.email || '—'}
      </Typography>
    ),
  },
  {
    field: 'mobileNumber',
    headerName: 'Mobile',
    width: 140,
    minWidth: 130,
    flex: 0,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.75rem' }} noWrap title={params.row.mobileNumber}>
        {params.row.mobileNumber || '—'}
      </Typography>
    ),
  },
  {
    field: 'role',
    headerName: 'Role',
    width: 120,
    minWidth: 110,
    flex: 0,
    valueGetter: (_value, row) => row?.role || '',
    renderCell: (params) => {
      const role = params.row.role || params.value || '—';
      const style = ROLE_STYLE[role] || { color: '#64748b', bg: '#f1f5f9' };
      return (
        <Chip
          size="small"
          label={role}
          sx={{
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 600,
            border: 'none',
            height: 22,
            maxWidth: '100%',
            '& .MuiChip-label': { px: 0.85, fontSize: '0.6875rem' },
          }}
        />
      );
    },
  },
  { field: 'status', headerName: 'Status', width: 150, minWidth: 140, flex: 0 },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    minWidth: 110,
    flex: 0,
    valueFormatter: (value) => formatDate(value),
  },
];

export default function UsersListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, status } = useAppSelector((state) => state.users);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['role', 'status'] });

  const [dialogState, setDialogState] = useState({ open: false, mode: 'create', user: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchUsers(queryParams));

  const handleCreate = () => setDialogState({ open: true, mode: 'create', user: null });
  const handleEdit = (user) => setDialogState({ open: true, mode: 'edit', user });
  const handleView = (user) => setDialogState({ open: true, mode: 'view', user });

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        await dispatch(createUser(formData)).unwrap();
        dispatch(showSnackbar({ message: 'User created successfully' }));
      } else {
        await dispatch(updateUser({ id: dialogState.user._id, formData })).unwrap();
        dispatch(showSnackbar({ message: 'User updated successfully' }));
      }
      setDialogState({ open: false, mode: 'create', user: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Something went wrong', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'User deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete user', severity: 'error' }));
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
    try {
      await dispatch(toggleUserStatus({ id: user._id, status: newStatus })).unwrap();
      dispatch(showSnackbar({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}` }));
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update status', severity: 'error' }));
    }
  };

  const handleResetPassword = async (user) => {
    try {
      await dispatch(resetUserPassword(user._id)).unwrap();
      dispatch(showSnackbar({ message: `Password reset email sent to ${user.email}` }));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to send reset email', severity: 'error' }));
    }
  };

  const handleImpersonate = async (user) => {
    try {
      const result = await dispatch(impersonateUser(user._id)).unwrap();
      dispatch(startImpersonation(result));
      navigate(getDefaultLandingPath(result.user, result.permissions));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to log in as this user', severity: 'error' }));
    }
  };

  const handlePermissionsSubmit = async (values) => {
    setSubmitting(true);
    try {
      await dispatch(updateUserPermissions({ id: permissionsUser._id, permissions: values })).unwrap();
      dispatch(showSnackbar({ message: 'Permissions updated' }));
      setPermissionsUser(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update permissions', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const columnsWithStatusToggle = COLUMNS.map((col) =>
    col.field === 'status'
      ? {
          ...col,
          renderCell: (params) => {
            const active = params.value === USER_STATUS.ACTIVE;
            return (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Switch size="small" checked={active} onChange={() => handleToggleStatus(params.row)} />
                <Chip
                  size="small"
                  label={active ? 'Active' : 'Inactive'}
                  sx={{
                    height: 20,
                    fontWeight: 600,
                    bgcolor: active ? '#ecfdf5' : '#f1f5f9',
                    color: active ? '#059669' : '#64748b',
                    border: 'none',
                    '& .MuiChip-label': { px: 0.75, fontSize: '0.625rem' },
                  }}
                />
              </Stack>
            );
          },
        }
      : col
  );

  const actions = [
    { label: 'View', icon: <VisibilityIcon fontSize="small" />, onClick: handleView },
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: handleEdit },
    { label: 'Reset Password', icon: <LockResetIcon fontSize="small" />, onClick: handleResetPassword },
    {
      label: 'Permissions',
      icon: <AdminPanelSettingsIcon fontSize="small" />,
      onClick: setPermissionsUser,
    },
    {
      label: 'Login as this user',
      icon: <LoginIcon fontSize="small" color="primary" />,
      show: (row) => row.status === USER_STATUS.ACTIVE,
      onClick: handleImpersonate,
    },
    { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete, danger: true },
  ];

  return (
    <>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: '#f3e8ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faUsers} />
            </Box>
            <span>Users</span>
          </Stack>
        }
        subtitle="Manage admins and installers"
        actions={
          <Button
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            variant="contained"
            onClick={handleCreate}
            sx={{
              bgcolor: '#7c3aed',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#6d28d9' },
            }}
          >
            Add User
          </Button>
        }
      />

      <DataTable
        columns={columnsWithStatusToggle}
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
        filters={[
          { field: 'role', label: 'Role', options: [{ value: ROLES.ADMIN, label: 'Admin' }, { value: ROLES.USER, label: 'User' }] },
          { field: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
        filterValues={filters}
        onFilterChange={setFilter}
        actions={actions}
        onExportCsv={() => exportToCsv('users', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No users found"
        storageKey="users"
      />

      <UserFormDrawer
        open={dialogState.open}
        mode={dialogState.mode}
        user={dialogState.user}
        submitting={submitting}
        onClose={() => setDialogState({ open: false, mode: 'create', user: null })}
        onSubmit={handleSubmit}
      />

      <PermissionsDialog
        open={Boolean(permissionsUser)}
        user={permissionsUser}
        submitting={submitting}
        onClose={() => setPermissionsUser(null)}
        onSubmit={handlePermissionsSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
