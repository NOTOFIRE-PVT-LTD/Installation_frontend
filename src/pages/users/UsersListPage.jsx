import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
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
import SetPasswordDialog from './SetPasswordDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  setUserPassword,
  updateUserPermissions,
  impersonateUser,
} from '../../features/users/usersThunks';
import { startImpersonation } from '../../features/auth/authSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { ROLES, USER_STATUS, ADMIN_TYPES } from '../../utils/constants';
import { getDefaultLandingPath } from '../../routes/routeConfig';


const AVATAR_COLORS = ['#85581A', '#0369A1', '#15803D', '#7C3AED', '#B45309', '#0F766E', '#8A3B14'];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getDesignationInfo(row) {
  if (row?.adminType === 'SUPER_ADMIN' || row?.email === 'super.admin@demo.local' || row?.email === 'admin@nfsite.com') {
    return {
      label: 'Super Admin',
      color: '#3A230B',
      bg: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)',
      border: '1px solid #C99846',
      isSuper: true,
    };
  }
  if (row?.appSuperAdmin) {
    const app =
      row.adminType === 'COMPLAINT_COORDINATOR'
        ? 'Complaint Resolution'
        : row.adminType === 'SALES_COORDINATOR'
          ? 'Attendance'
          : row.adminType === 'TENDER_COORDINATOR'
            ? 'Tenders'
            : 'App';
    return {
      label: `Super Admin · ${app}`,
      color: '#3A230B',
      bg: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)',
      border: '1px solid #C99846',
      isSuper: true,
    };
  }
  if (row?.role === ROLES.ADMIN) {
    if (row.adminType === 'COMPLAINT_COORDINATOR' || (row.permissions?.complaints && !row.permissions?.salespersonTracking)) {
      return {
        label: 'Admin · Complaint Resolution',
        color: '#8A3B14',
        bg: 'rgba(212, 163, 78, 0.22)',
        border: '1px solid rgba(212, 163, 78, 0.5)',
      };
    }
    if (row.adminType === 'SALES_COORDINATOR' || (row.permissions?.attendance && !row.permissions?.complaints)) {
      return {
        label: 'Admin · Attendance & Sales',
        color: '#583714',
        bg: 'rgba(88, 55, 20, 0.12)',
        border: '1px solid rgba(88, 55, 20, 0.3)',
      };
    }
    if (row.adminType === 'TENDER_COORDINATOR' || row.permissions?.tenders) {
      return {
        label: 'Admin · Tenders',
        color: '#4338CA',
        bg: '#EEF2FF',
        border: '1px solid #C7D2FE',
      };
    }
    return {
      label: 'Admin',
      color: '#583714',
      bg: 'rgba(212, 163, 78, 0.18)',
      border: '1px solid rgba(212, 163, 78, 0.35)',
    };
  }
  if (row?.jobRole === 'SALESPERSON') {
    return {
      label: 'Salesperson',
      color: '#15803D',
      bg: '#DCFCE7',
      border: '1px solid #BBF7D0',
    };
  }
  return {
    label: 'Field Engineer',
    color: '#0369A1',
    bg: '#E0F2FE',
    border: '1px solid #BAE6FD',
  };
}

function getUserAppAccess(row) {
  if (row?.adminType === 'SUPER_ADMIN' || row?.email === 'super.admin@demo.local' || row?.email === 'admin@nfsite.com') {
    return [{ label: 'All Apps (Full Access)', isSuper: true }];
  }
  const p = row?.permissions || {};
  const apps = [];

  if (p.attendance || p.salespersonTracking || row?.jobRole === 'SALESPERSON' || row?.adminType === 'SALES_COORDINATOR') {
    apps.push({ label: 'Attendance', color: '#85581A', bg: 'rgba(212, 163, 78, 0.16)' });
  }
  if (p.contractorAttendance) {
    apps.push({ label: 'Contractor Attendance', color: '#b45309', bg: '#fffbeb' });
  }
  if (p.complaints || row?.adminType === 'COMPLAINT_COORDINATOR') {
    apps.push({ label: 'Complaint Resolution', color: '#8A3B14', bg: '#FDF3EC' });
  }
  if (p.projects || (row.role !== ROLES.ADMIN && p.projects !== false)) {
    apps.push({ label: 'Projects', color: '#0369A1', bg: '#F0F9FF' });
  }
  if (p.tenders || row?.adminType === 'TENDER_COORDINATOR') {
    apps.push({ label: 'Tenders', color: '#4338CA', bg: '#EEF2FF' });
  }
  if (p.billing) {
    apps.push({ label: 'Billing', color: '#475569', bg: '#F1F5F9' });
  }
  if (p.financialDocuments) {
    apps.push({ label: 'Finance Docs', color: '#0F766E', bg: '#F0FDFA' });
  }
  if (p.inspections) {
    apps.push({ label: 'Inspections', color: '#B45309', bg: '#FEF3C7' });
  }
  if (p.accounts) {
    apps.push({ label: 'Accounts', color: '#6B21A8', bg: '#FAF5FF' });
  }
  if (p.atlantaPayments) {
    apps.push({ label: 'Atlanta Payments', color: '#047857', bg: '#ECFDF5' });
  }

  if (apps.length === 0) {
    return [{ label: 'Standard Access', color: '#64748B', bg: '#F8FAFC' }];
  }
  return apps;
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
    headerName: 'Role / Designation',
    width: 170,
    minWidth: 150,
    flex: 0,
    valueGetter: (_value, row) => row?.role || '',
    renderCell: (params) => {
      const info = getDesignationInfo(params.row);
      return (
        <Chip
          size="small"
          label={info.label}
          sx={{
            background: info.bg,
            color: info.color,
            fontWeight: 700,
            border: info.border,
            height: 22,
            boxShadow: info.isSuper ? '0 2px 6px rgba(88, 55, 20, 0.15)' : 'none',
            '& .MuiChip-label': { px: 0.85, fontSize: '0.6875rem' },
          }}
        />
      );
    },
  },
  {
    field: 'appAccess',
    headerName: 'App Access',
    flex: 1.8,
    minWidth: 240,
    sortable: false,
    renderCell: (params) => {
      const apps = getUserAppAccess(params.row);
      if (apps[0]?.isSuper) {
        return (
          <Chip
            size="small"
            label={apps[0].label}
            sx={{
              background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)',
              color: '#3A230B',
              fontWeight: 800,
              fontSize: '0.6875rem',
              height: 22,
              border: '1px solid #C99846',
              boxShadow: '0 2px 6px rgba(88, 55, 20, 0.15)',
            }}
          />
        );
      }
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
          {apps.slice(0, 4).map((app) => (
            <Chip
              key={app.label}
              size="small"
              label={app.label}
              sx={{
                height: 20,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: app.bg,
                color: app.color,
                border: `1px solid ${app.color}33`,
                '& .MuiChip-label': { px: 0.7 },
              }}
            />
          ))}
          {apps.length > 4 && (
            <Tooltip title={apps.slice(4).map((a) => a.label).join(', ')}>
              <Chip
                size="small"
                label={`+${apps.length - 4}`}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(212, 163, 78, 0.15)',
                  color: '#583714',
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </Tooltip>
          )}
        </Stack>
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
  const { user: currentUser, isPlatformOwner } = useAuth();
  const { items, total, status } = useAppSelector((state) => state.users);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['role', 'status', 'apps'] });

  const [dialogState, setDialogState] = useState({ open: false, mode: 'create', user: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [setPasswordUser, setSetPasswordUser] = useState(null);
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

  const handleSetPasswordSubmit = async (password) => {
    setSubmitting(true);
    try {
      await dispatch(setUserPassword({ id: setPasswordUser._id, password })).unwrap();
      dispatch(showSnackbar({ message: `Password updated for ${setPasswordUser.name}` }));
      setSetPasswordUser(null);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to set password', severity: 'error' }));
    } finally {
      setSubmitting(false);
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
    {
      label: 'Set Password',
      icon: <LockResetIcon fontSize="small" />,
      show: (row) => {
        const targetSuper = row.adminType === ADMIN_TYPES.SUPER_ADMIN || row.appSuperAdmin;
        if (!targetSuper) return true;
        if (isPlatformOwner) return true;
        return String(row._id) === String(currentUser?._id);
      },
      onClick: setSetPasswordUser,
    },
    {
      label: 'Permissions',
      icon: <AdminPanelSettingsIcon fontSize="small" />,
      show: (row) => row.adminType !== ADMIN_TYPES.SUPER_ADMIN,
      onClick: setPermissionsUser,
    },
    {
      label: 'Login as this user',
      icon: <LoginIcon fontSize="small" color="primary" />,
      show: (row) => row.status === USER_STATUS.ACTIVE,
      onClick: handleImpersonate,
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      show: (row) => row.adminType !== ADMIN_TYPES.SUPER_ADMIN,
      onClick: setConfirmDelete,
      danger: true,
    },
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
                bgcolor: 'rgba(212, 163, 78, 0.2)', color: '#583714',
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
              background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
              color: '#3A230B',
              borderRadius: '10px',
              fontWeight: 800,
              textTransform: 'none',
              px: { xs: 1.5, sm: 2.5 },
              minHeight: 36,
              boxShadow: '0 2px 8px rgba(88, 55, 20, 0.2)',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
              },
            }}
          >
            + Add User
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
        toolbarStart={
          <TextField
            select
            size="small"
            label="Staff"
            value={filters.role || ''}
            onChange={(e) => setFilter('role', e.target.value)}
            sx={{
              minWidth: 210,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFDF8',
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
              },
            }}
          >
            <MenuItem value="">All Staff</MenuItem>
            <MenuItem value={ADMIN_TYPES.SUPER_ADMIN}>Super Admins</MenuItem>
            <MenuItem value={ROLES.USER}>Salespeople & Field Staff</MenuItem>
            <MenuItem value={ROLES.ADMIN}>Admins & Coordinators</MenuItem>
          </TextField>
        }
        filters={[
          {
            field: 'role',
            label: 'Role',
            options: [
              { value: ADMIN_TYPES.SUPER_ADMIN, label: 'Super Admin' },
              { value: ROLES.ADMIN, label: 'Admin' },
              { value: ROLES.USER, label: 'User' },
            ],
          },
          { field: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          {
            field: 'apps',
            label: 'Apps',
            multiple: true,
            options: [
              { value: 'complaints', label: 'Complaint Resolution' },
              { value: 'attendance', label: 'Attendance & Visits' },
              { value: 'projects', label: 'Projects' },
              { value: 'tenders', label: 'Tenders' },
              { value: 'billing', label: 'Billing' },
              { value: 'financialDocuments', label: 'Finance Docs' },
              { value: 'inspections', label: 'Inspections' },
              { value: 'accounts', label: 'Accounts' },
              { value: 'atlantaPayments', label: 'Atlanta Payments' },
            ],
          },
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

      <SetPasswordDialog
        open={Boolean(setPasswordUser)}
        user={setPasswordUser}
        submitting={submitting}
        onClose={() => setSetPasswordUser(null)}
        onSubmit={handleSetPasswordSubmit}
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
