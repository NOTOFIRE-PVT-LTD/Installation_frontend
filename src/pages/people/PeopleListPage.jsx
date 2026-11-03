import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserFormDrawer from '../users/UserFormDrawer';
import SalespersonActivityDrawer from './SalespersonActivityDrawer';
import MultiVisitPlanDrawer from '../visits/MultiVisitPlanDrawer';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { peopleApi } from '../../api/peopleApi';
import { ROLES, USER_STATUS, ADMIN_TYPES, ADMIN_TYPE_LABELS } from '../../utils/constants';

function formToPayload(formData) {
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    mobileNumber: formData.get('mobileNumber'),
    gender: formData.get('gender'),
    role: formData.get('role') || ROLES.USER,
  };
  const password = formData.get('password');
  if (password) payload.password = password;
  const adminType = formData.get('adminType');
  if (adminType) payload.adminType = adminType;
  return payload;
}

export default function PeopleListPage({ embedded = false }) {
  const dispatch = useAppDispatch();
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
  } = useTableQueryParams({ filterKeys: ['role'] });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', user: null });
  const [submitting, setSubmitting] = useState(false);
  const [statusRow, setStatusRow] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  // Salesperson detailed monthly activity drawer state
  const [activityPerson, setActivityPerson] = useState(null);

  // Plan visits drawer state
  const [planVisitsForPerson, setPlanVisitsForPerson] = useState(null);

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
      const isCreatingAdmin = payload.role === ROLES.ADMIN;
      if (drawer.mode === 'create') {
        await peopleApi.create(payload);
        dispatch(
          showSnackbar({
            message: isCreatingAdmin
              ? 'Admin coordinator created successfully'
              : 'Salesperson created successfully',
          })
        );
      } else {
        await peopleApi.update(drawer.user._id, payload);
        dispatch(
          showSnackbar({
            message: isCreatingAdmin
              ? 'Admin coordinator updated'
              : 'Salesperson updated',
          })
        );
      }
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
      dispatch(
        showSnackbar({
          message: willActivate ? 'User activated' : 'User deactivated',
        })
      );
      setStatusRow(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setStatusBusy(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.2,
      minWidth: 190,
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ cursor: 'pointer', py: 0.5 }}
          onClick={(e) => {
            e.stopPropagation();
            setActivityPerson(params.row);
          }}
        >
          <Avatar
            src={params.row.profileImage?.url}
            sx={{
              width: 30,
              height: 30,
              fontSize: '0.75rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)',
              color: '#3A230B',
              boxShadow: '0 2px 4px rgba(88, 55, 20, 0.15)',
            }}
          >
            {params.row.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#241404',
                lineHeight: 1.2,
                '&:hover': { color: '#8A5D18', textDecoration: 'underline' },
              }}
              noWrap
            >
              {params.row.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#8A5D18',
                fontSize: '0.6875rem',
                fontWeight: 600,
                display: 'block',
              }}
            >
              View monthly activity →
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', minWidth: 200 },
    { field: 'mobileNumber', headerName: 'Phone', minWidth: 140 },
    {
      field: 'role',
      headerName: 'Role / Designation',
      minWidth: 190,
      renderCell: (params) => {
        const isAdmin = params.row.role === ROLES.ADMIN;
        const adminLabel = ADMIN_TYPE_LABELS[params.row.adminType] || 'Coordinator';
        return (
          <Chip
            size="small"
            label={isAdmin ? `Admin · ${adminLabel}` : 'Salesperson'}
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              borderRadius: '6px',
              height: 22,
              bgcolor: isAdmin ? 'rgba(88, 55, 20, 0.12)' : 'rgba(212, 163, 78, 0.18)',
              color: isAdmin ? '#583714' : '#8A5D18',
              border: isAdmin ? '1px solid rgba(88, 55, 20, 0.25)' : '1px solid rgba(212, 163, 78, 0.35)',
            }}
          />
        );
      },
    },
    { field: 'gender', headerName: 'Gender', minWidth: 100 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
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
      label: 'Monthly Activity',
      icon: <AssessmentIcon fontSize="small" />,
      onClick: (row) => setActivityPerson(row),
    },
    {
      label: 'Plan Visits',
      icon: <CalendarMonthIcon fontSize="small" />,
      onClick: (row) => setPlanVisitsForPerson(row),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawer({ open: true, mode: 'edit', user: row }),
    },
  ];

  const actionButtons = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setDrawer({ open: true, mode: 'create', user: { role: ROLES.USER, jobRole: 'SALESPERSON' } })}
        sx={{
          borderColor: 'rgba(88, 55, 20, 0.3)',
          color: '#583714',
          fontWeight: 700,
          borderRadius: '8px',
          textTransform: 'none',
          '&:hover': { borderColor: '#583714', bgcolor: 'rgba(255, 233, 151, 0.15)' },
        }}
      >
        + Add Salesperson
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() =>
          setDrawer({
            open: true,
            mode: 'create',
            user: { role: ROLES.ADMIN, adminType: ADMIN_TYPES.SALES_COORDINATOR },
          })
        }
        sx={{
          background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
          color: '#3A230B',
          fontWeight: 700,
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(88, 55, 20, 0.15)',
          '&:hover': {
            background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
          },
        }}
      >
        + Add Admin / Coordinator
      </Button>
    </Stack>
  );

  return (
    <>
      {!embedded && (
        <PageHeader
          title="People"
          subtitle="Salespeople & Attendance Coordinators for field tracking"
          actions={actionButtons}
        />
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
        onRowClick={(params) => setActivityPerson(params.row)}
        toolbarStart={
          <TextField
            select
            size="small"
            label="Staff Role"
            value={filters.role || ''}
            onChange={(e) => setFilter('role', e.target.value)}
            sx={{
              minWidth: 190,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFDF8',
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(212, 163, 78, 0.4)' },
              },
            }}
          >
            <MenuItem value="">All Staff</MenuItem>
            <MenuItem value={ROLES.USER}>Salespeople</MenuItem>
            <MenuItem value={ROLES.ADMIN}>Admins & Coordinators</MenuItem>
          </TextField>
        }
        toolbarEnd={embedded ? actionButtons : null}
      />

      <UserFormDrawer
        open={drawer.open}
        mode={drawer.mode}
        user={drawer.user}
        submitting={submitting}
        onClose={() => setDrawer({ open: false, mode: 'create', user: null })}
        onSubmit={handleSubmit}
      />

      {/* Detailed Monthly Activity Drawer for Punch In/Out, Visits Check-in/Out, and Expenses */}
      <SalespersonActivityDrawer
        open={Boolean(activityPerson)}
        onClose={() => setActivityPerson(null)}
        salesperson={activityPerson}
        onPlanVisits={(sp) => {
          setActivityPerson(null);
          setPlanVisitsForPerson(sp);
        }}
      />

      {/* Plan Visits Drawer with pre-selected salesperson */}
      <MultiVisitPlanDrawer
        open={Boolean(planVisitsForPerson)}
        onClose={() => setPlanVisitsForPerson(null)}
        initialSalespersonId={planVisitsForPerson?._id}
        onCreated={() => {
          setPlanVisitsForPerson(null);
          load();
        }}
      />

      <ConfirmDialog
        open={Boolean(statusRow)}
        title={willActivate ? 'Activate user' : 'Deactivate user'}
        message={
          willActivate
            ? `Do you want to activate ${statusRow?.name || 'this person'}?`
            : `Do you want to deactivate ${statusRow?.name || 'this person'}?`
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
