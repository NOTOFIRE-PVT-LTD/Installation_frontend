import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import DataTable from '../../components/common/DataTable/DataTable';
import SlidingPills from '../../components/common/SlidingPills';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { complaintApi } from '../../api/complaintApi';
import { formatDate } from '../../utils/formatters';
import {
  STATUS_CONFIG,
  WARRANTY_CONFIG,
  CATEGORY_OPTIONS,
} from './complaintUtils';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailDrawer from './ComplaintDetailDrawer';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function StatCard({ label, value, icon, color, bg, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: 88,
        cursor: onClick ? 'pointer' : 'default',
        transform: 'translate3d(0, 0, 0)',
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
        '&:hover': { transform: 'translate3d(0, -12px, 0)' },
        '&:hover .stat-card-paper': {
          borderColor: '#D4A34E',
          boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)',
        },
      }}
    >
    <Paper
      elevation={0}
      className="stat-card-paper"
      sx={{
        p: 1.75,
        borderRadius: '16px',
        border: '1px solid #E2D3BE',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
        minHeight: 88,
        height: '100%',
        boxShadow: '0 2px 8px rgba(36, 20, 4, 0.04)',
        transition: 'box-shadow 0.32s ease, border-color 0.2s ease',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#6E4D27',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: '#241404', mt: 0.25 }}>
          {(value ?? 0).toLocaleString('en-IN')}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '16px',
          bgcolor: 'rgba(229, 184, 92, 0.22)',
          border: '1px solid rgba(212, 163, 78, 0.4)',
          color: '#38200A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Paper>
    </Box>
  );
}

function EngineerDropdownCell({ row, assignees, onSelectEngineer, disabled = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentEng = row.assignedTo;
  const isUnassigned = !currentEng;

  if (disabled) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: isUnassigned ? '#DC2626' : '#16a34a',
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" fontWeight={700} color="#241404" noWrap sx={{ fontSize: '0.8125rem' }}>
          {currentEng?.name || 'Unassigned'}
        </Typography>
      </Box>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setAnchorEl(null);
  };

  const handlePick = (e, newEngId, newEngName) => {
    e.stopPropagation();
    setAnchorEl(null);
    onSelectEngineer(row, newEngId, newEngName);
  };

  return (
    <Box sx={{ minWidth: 0, width: '100%' }} onClick={(e) => e.stopPropagation()}>
      <Button
        size="small"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon sx={{ fontSize: 16 }} />}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          px: 1,
          py: 0.35,
          fontWeight: 700,
          fontSize: '0.75rem',
          minWidth: 0,
          border: isUnassigned ? '1.5px solid #FCA5A5' : '1px solid #D4A34E',
          bgcolor: isUnassigned ? '#FEF2F2' : 'rgba(212, 163, 78, 0.12)',
          color: isUnassigned ? '#DC2626' : '#241404',
          '&:hover': {
            bgcolor: isUnassigned ? '#FEE2E2' : 'rgba(212, 163, 78, 0.22)',
            borderColor: isUnassigned ? '#EF4444' : '#B57F2F',
          },
        }}
      >
        {isUnassigned ? (
          '⚠️ Unassigned'
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#16A34A',
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }} noWrap>
              {currentEng.name}
            </Typography>
          </Box>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            mt: 0.5,
            maxHeight: 320,
            width: 290,
            borderRadius: '12px',
            border: '1px solid #E2D3BE',
            boxShadow: '0 8px 24px rgba(36, 20, 4, 0.15)',
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF0DF 100%)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid #E2D3BE' }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#6E4D27', textTransform: 'uppercase' }}>
            Assign / Reassign Engineer
          </Typography>
        </Box>

        <MenuItem
          onClick={(e) => handlePick(e, '', 'Unassigned (Review Queue)')}
          selected={isUnassigned}
          sx={{
            py: 1,
            color: '#DC2626',
            fontWeight: 700,
            fontSize: '0.8125rem',
            '&.Mui-selected': { bgcolor: 'rgba(220, 38, 38, 0.1)' },
          }}
        >
          ⚠️ Leave Unassigned (Review Queue)
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {assignees.map((eng) => {
          const isSelected = String(currentEng?._id) === String(eng._id || eng.id);
          return (
            <MenuItem
              key={String(eng._id || eng.id)}
              onClick={(e) => handlePick(e, String(eng._id || eng.id), eng.name)}
              selected={isSelected}
              sx={{
                py: 0.75,
                fontSize: '0.8125rem',
                '&.Mui-selected': { bgcolor: 'rgba(212, 163, 78, 0.2)', fontWeight: 800 },
              }}
            >
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600, color: '#241404' }} noWrap>
                  {eng.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#7C6752' }} noWrap display="block">
                  {eng.jobRole || 'Field Engineer'}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

const STATUS_FILTER_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const CATEGORY_FILTER_OPTIONS = CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }));

const EMPTY_STATS = {
  assigned: 0,
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  overdue: 0,
  unassigned: 0,
  today: 0,
  myTickets: 0,
};

export default function ComplaintsPage({ embedded = false }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isFieldEngineer = user?.role === 'User';
  const [stats, setStats] = useState(EMPTY_STATS);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Reassignment Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    ticketId: null,
    ticketNo: '',
    customerName: '',
    fromEngineerName: '',
    toEngineerId: '',
    toEngineerName: '',
    reason: '',
    loading: false,
  });

  const {
    page,
    pageSize,
    search,
    filters,
    sortField,
    sortOrder,
    queryParams,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    setFilters,
    setSort,
  } = useTableQueryParams({
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    defaultPageSize: 25,
    filterKeys: ['status', 'priority', 'category', 'assignedTo', 'isOverdue'],
  });

  useEffect(() => {
    if (sortField && sortField !== 'createdAt' && sortField !== 'resolvedAt') {
      setSort('createdAt', 'desc');
    }
  }, [sortField, setSort]);

  const dynamicFilters = useMemo(() => {
    const engineerOptions = [
      { value: 'unassigned', label: '⚠️ Unassigned (Review Queue)' },
      ...assignees.map((eng) => ({
        value: String(eng._id || eng.id),
        label: `${eng.name}${eng.jobRole ? ` (${eng.jobRole})` : ''}`,
      })),
    ];

    return [
      {
        field: 'status',
        label: 'Status',
        type: 'select',
        options: STATUS_FILTER_OPTIONS,
      },
      {
        field: 'priority',
        label: 'Priority',
        type: 'select',
        options: PRIORITY_FILTER_OPTIONS,
      },
      {
        field: 'assignedTo',
        label: 'Engineer',
        type: 'select',
        options: engineerOptions,
      },
      {
        field: 'category',
        label: 'Category',
        type: 'select',
        options: CATEGORY_FILTER_OPTIONS,
      },
    ];
  }, [assignees]);

  const handleSelectEngineerFromTable = (row, newEngId, newEngName) => {
    const currentId = String(row.assignedTo?._id || '');
    if (currentId === String(newEngId || '')) {
      return;
    }

    setConfirmDialog({
      open: true,
      ticketId: row._id,
      ticketNo: row.ticketNo,
      customerName: row.customerName,
      fromEngineerName: row.assignedTo?.name || 'Unassigned',
      toEngineerId: newEngId || null,
      toEngineerName: newEngName,
      reason: '',
      loading: false,
    });
  };

  const handleConfirmReassign = async () => {
    if (!confirmDialog.ticketId) return;
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      const payload = {
        assignedTo: confirmDialog.toEngineerId || null,
      };
      if (confirmDialog.reason?.trim()) {
        const isFirst = !confirmDialog.fromEngineerName || confirmDialog.fromEngineerName === 'Unassigned';
        payload.note = isFirst
          ? `Assigned to ${confirmDialog.toEngineerName}: ${confirmDialog.reason.trim()}`
          : `Reassigned from ${confirmDialog.fromEngineerName} to ${confirmDialog.toEngineerName}: ${confirmDialog.reason.trim()}`;
      }

      await complaintApi.update(confirmDialog.ticketId, payload);
      dispatch(
        showSnackbar({
          message: `Ticket ${confirmDialog.ticketNo} assigned to ${confirmDialog.toEngineerName}`,
          severity: 'success',
        })
      );
      setConfirmDialog({
        open: false,
        ticketId: null,
        ticketNo: '',
        customerName: '',
        fromEngineerName: '',
        toEngineerId: '',
        toEngineerName: '',
        reason: '',
        loading: false,
      });
      loadList();
      loadStats();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to reassign engineer',
          severity: 'error',
        })
      );
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const COLUMNS = [
    {
      field: 'ticketNo',
      headerName: 'Ticket',
      width: 145,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            cursor: 'pointer',
            fontFamily: 'monospace',
            color: '#9E7432',
            letterSpacing: '0.02em',
            '&:hover': { textDecoration: 'underline', color: '#583714' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComplaintId(params.row._id);
            setDrawerOpen(true);
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 110,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'resolvedAt',
      headerName: 'Resolved',
      width: 110,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {params.value ? formatDate(params.value) : '—'}
        </Typography>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap color="#0f172a">
            {params.row.customerName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {params.row.customerOrganization || params.row.companyName || params.row.contactNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'subject',
      headerName: 'Complaint / Equipment',
      flex: 1.3,
      minWidth: 220,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const prod = params.row.productName || params.row.product;
        return (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap color="#0f172a">
              {params.value}
            </Typography>
            {prod && (
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {prod} {params.row.productSerialNumber ? `• S/N: ${params.row.productSerialNumber}` : ''}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'warrantyStatus',
      headerName: 'Warranty',
      width: 135,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const w = WARRANTY_CONFIG[params.value] || WARRANTY_CONFIG.UNKNOWN;
        return (
          <Chip
            size="small"
            label={w.label}
            sx={{
              bgcolor: w.bg,
              color: w.color,
              border: `1px solid ${w.border}`,
              fontWeight: 700,
              fontSize: '0.65rem',
            }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const s = STATUS_CONFIG[params.value] || STATUS_CONFIG.NEW;
        return (
          <Chip
            size="small"
            label={s.label}
            sx={{
              bgcolor: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`,
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        );
      },
    },
    {
      field: 'assignedTo',
      headerName: 'Engineer',
      width: 195,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <EngineerDropdownCell
          row={params.row}
          assignees={assignees}
          onSelectEngineer={handleSelectEngineerFromTable}
          disabled={isFieldEngineer}
        />
      ),
    },
  ];

  const loadList = async () => {
    try {
      setLoading(true);
      const { data } = await complaintApi.list(queryParams);
      setRows(data?.data || []);
      setTotal(data?.meta?.total || 0);
    } catch {
      setRows([]);
      setTotal(0);
      dispatch(showSnackbar({ message: 'Failed to load complaints', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await complaintApi.dashboardMetrics();
      const kpis = data?.data?.kpis || data?.kpis || {};
      setStats({
        total: kpis.totalOpenCount || 0,
        open: kpis.newTicketsCount || 0,
        assigned: kpis.assignedCount || 0,
        inProgress: kpis.inProgressCount || 0,
        resolved: kpis.resolvedCount || 0,
        closed: kpis.closedCount || 0,
        overdue: kpis.overdueCount || 0,
        unassigned: kpis.unassignedCount != null ? kpis.unassignedCount : (kpis.newTicketsCount || 0),
        today: kpis.newTicketsCount || 0,
        myTickets: kpis.myTicketsCount || 0,
      });
    } catch {
      setStats(EMPTY_STATS);
    }
  };

  useEffect(() => {
    complaintApi
      .assignees()
      .then((res) => {
        setAssignees(res.data?.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'my_tickets') {
      setFilters({ assignedTo: String(user?._id || ''), status: '', isOverdue: '' });
    } else if (newTab === 'assigned') {
      setFilters({ status: 'ASSIGNED', assignedTo: '', isOverdue: '' });
    } else if (newTab === 'unassigned') {
      setFilters({ assignedTo: 'unassigned', status: '', isOverdue: '' });
    } else if (newTab === 'in_progress') {
      setFilters({ status: 'IN_PROGRESS,PENDING', assignedTo: isFieldEngineer ? String(user?._id || '') : '', isOverdue: '' });
    } else if (newTab === 'resolved') {
      setFilters({ status: 'RESOLVED,CLOSED', assignedTo: isFieldEngineer ? String(user?._id || '') : '', isOverdue: '' });
    } else {
      setFilters({ assignedTo: '', status: '', isOverdue: '' });
    }
  };

  useEffect(() => {
    if (isFieldEngineer && user?._id && !filters.assignedTo && !filters.status && !filters.isOverdue) {
      setActiveTab('my_tickets');
      setFilters({ assignedTo: String(user._id), status: '', isOverdue: '' });
    }
  }, [isFieldEngineer, user?._id]);

  useEffect(() => {
    if (user?._id && filters.assignedTo === String(user._id) && !filters.status && !filters.isOverdue) {
      setActiveTab('my_tickets');
    } else if (filters.status === 'ASSIGNED') {
      setActiveTab('assigned');
    } else if (filters.assignedTo === 'unassigned') {
      setActiveTab('unassigned');
    } else if (filters.status === 'RESOLVED,CLOSED' || filters.status === 'RESOLVED' || filters.status === 'CLOSED') {
      setActiveTab('resolved');
    } else if (filters.status === 'IN_PROGRESS' || filters.status === 'IN_PROGRESS,PENDING' || filters.status === 'PENDING') {
      setActiveTab('in_progress');
    } else if (!filters.status && !filters.assignedTo && !filters.isOverdue) {
      setActiveTab('all');
    }
  }, [filters.status, filters.assignedTo, filters.isOverdue, user?._id]);

  const QUEUE_TABS = useMemo(() => {
    if (isFieldEngineer) {
      return [
        { id: 'my_tickets', label: 'Assigned Tickets', count: stats.myTickets, showCount: true },
        { id: 'in_progress', label: 'In Progress & Follow-ups', count: stats.inProgress, showCount: true },
        { id: 'resolved', label: 'Resolved & Closed', count: stats.resolved + stats.closed, showCount: true },
        { id: 'all', label: 'All Tickets', showCount: false },
      ];
    }
    return [
      { id: 'all', label: 'All Tickets', showCount: false },
      { id: 'assigned', label: 'Assigned Tickets', count: stats.assigned, showCount: true },
      { id: 'unassigned', label: '⚠️ Unassigned Queue', count: stats.unassigned, isAlert: true, showCount: true },
      { id: 'in_progress', label: 'In Progress & Follow-ups', count: stats.inProgress, showCount: true },
      { id: 'resolved', label: 'Resolved & Closed', count: stats.resolved + stats.closed, showCount: true },
    ];
  }, [isFieldEngineer, stats]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: 1.3,
              color: 'primary.main',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {isFieldEngineer ? 'Complaints' : 'Complaint Resolution'}
          </Typography>
          {!isFieldEngineer && (
            <>
              <Tooltip title="Operations Dashboard">
                <IconButton
                  component={Link}
                  to="/complaints/dashboard"
                  size="small"
                  sx={{
                    flexShrink: 0,
                    color: '#583714',
                    border: '1px solid #D4A34E',
                    bgcolor: 'rgba(212, 163, 78, 0.1)',
                    '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.2)' },
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="QR & Links">
                <IconButton
                  size="small"
                  onClick={() => setQrOpen(true)}
                  sx={{
                    flexShrink: 0,
                    color: '#583714',
                    border: '1px solid #D4A34E',
                    bgcolor: 'rgba(212, 163, 78, 0.1)',
                    '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.2)' },
                  }}
                >
                  <QrCode2Icon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Phone Intake">
            <IconButton
              component={Link}
              to="/complaints/new"
              size="small"
              sx={{
                flexShrink: 0,
                color: '#3A230B',
                background: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                boxShadow: '0 2px 8px rgba(88, 55, 20, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                },
              }}
            >
              <PhoneIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {!isFieldEngineer && (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
          pt: 1.5,
          overflow: 'visible',
          alignItems: 'stretch',
        }}
      >
        <StatCard
          label="Total Active"
          value={stats.total}
          icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 19 }} />}
          color="#0f766e"
          bg="#f0fdfa"
          onClick={() => handleTabChange('all')}
        />
        <StatCard
          label="Unassigned Queue"
          value={stats.unassigned}
          icon={<PersonOffOutlinedIcon sx={{ fontSize: 19 }} />}
          color="#dc2626"
          bg="#fef2f2"
          onClick={() => handleTabChange('unassigned')}
        />
        <StatCard
          label="New / Unprocessed"
          value={stats.open}
          icon={<ReportProblemOutlinedIcon sx={{ fontSize: 19 }} />}
          color="#b91c1c"
          bg="#fef2f2"
          onClick={() => setFilter('status', 'NEW')}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<AutorenewIcon sx={{ fontSize: 19 }} />}
          color="#4338ca"
          bg="#eef2ff"
          onClick={() => handleTabChange('in_progress')}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<TodayOutlinedIcon sx={{ fontSize: 19 }} />}
          color="#047857"
          bg="#ecfdf5"
          onClick={() => handleTabChange('resolved')}
        />
      </Box>
      )}

      {/* Unassigned Review Queue Notice Banner */}
      {activeTab === 'unassigned' && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: '12px',
            border: '1.5px solid #FCA5A5',
            bgcolor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ReportProblemOutlinedIcon sx={{ color: '#DC2626', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight={800} color="#991B1B">
                Unassigned Complaints Queue ({stats.unassigned} Pending Allocation)
              </Typography>
              <Typography variant="caption" color="#B91C1C">
                These tickets have not been assigned to any engineer yet. Use the <strong>"⚠️ Unassigned"</strong> dropdown in each row below to assign an engineer immediately.
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            onClick={() => handleTabChange('all')}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#991B1B', fontSize: '0.75rem' }}
          >
            View All Tickets ➔
          </Button>
        </Paper>
      )}

      {/* Main Complaints Table (No Action column, in-row engineer dropdown & click-to-open drawer) */}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={{ field: sortField || 'createdAt', sort: sortOrder || 'desc' }}
        onSortChange={(model) => {
          if (!model?.field) {
            setSort('createdAt', 'desc');
            return;
          }
          setSort(model.field, model.sort || 'desc');
        }}
        searchValue={search}
        onSearchChange={setSearch}
        toolbarStart={
          <SlidingPills items={QUEUE_TABS} value={activeTab} onChange={handleTabChange} />
        }
        filters={dynamicFilters}
        filterValues={filters}
        onFilterChange={setFilter}
        statusField="status"
        onRowClick={(row) => {
          setSelectedComplaintId(row._id);
          setDrawerOpen(true);
        }}
        loading={loading}
        emptyMessage="No complaints found matching the criteria. Use + Phone Intake or share QR code for self-service registration."
        storageKey="complaints"
      />

      {/* Confirmation Dialog for Engineer Assignment / Reassignment */}
      {(() => {
        const isFirstAssignment = !confirmDialog.fromEngineerName || confirmDialog.fromEngineerName === 'Unassigned';
        return (
          <Dialog
            open={confirmDialog.open}
            onClose={() => !confirmDialog.loading && setConfirmDialog((prev) => ({ ...prev, open: false }))}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                border: '1.5px solid #D4A34E',
                background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF0DF 100%)',
                boxShadow: '0 12px 32px rgba(36, 20, 4, 0.2)',
              },
            }}
          >
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #E2D3BE' }}>
              <Typography variant="h6" fontWeight={800} color="#241404">
                {isFirstAssignment ? 'Confirm Engineer Assignment' : 'Confirm Engineer Reassignment'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ticket: {confirmDialog.ticketNo}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#FFFDF9', border: '1px solid #E2D3BE', mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {isFirstAssignment ? 'ASSIGNMENT' : 'REASSIGNMENT FLOW'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" fontWeight={700} color="#6E4D27">
                    {confirmDialog.fromEngineerName || 'Unassigned'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ➔
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#241404">
                    {confirmDialog.toEngineerName}
                  </Typography>
                </Stack>
              </Box>

              <Typography variant="body2" color="#3A230B" sx={{ mb: 2 }}>
                Are you sure you want to {isFirstAssignment ? 'assign' : 'reassign'} ticket{' '}
                <strong>{confirmDialog.ticketNo}</strong> to <strong>{confirmDialog.toEngineerName}</strong>?
              </Typography>

              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label={isFirstAssignment ? 'Assignment Note (Optional)' : 'Reassignment Note / Reason (Optional)'}
                placeholder={
                  isFirstAssignment
                    ? 'e.g., Assigned for immediate inspection and diagnostic check...'
                    : 'e.g., Assigned to regional specialist, workload rebalance...'
                }
                value={confirmDialog.reason}
                onChange={(e) => setConfirmDialog((prev) => ({ ...prev, reason: e.target.value }))}
                sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #E2D3BE' }}>
              <Button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                disabled={confirmDialog.loading}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#583714' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmReassign}
                disabled={confirmDialog.loading}
                startIcon={confirmDialog.loading ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                  color: '#3A230B',
                  borderRadius: '10px',
                  px: 2.5,
                  boxShadow: '0 2px 8px rgba(88, 55, 20, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                  },
                }}
              >
                {confirmDialog.loading
                  ? isFirstAssignment
                    ? 'Assigning...'
                    : 'Reassigning...'
                  : isFirstAssignment
                  ? 'Confirm Assignment'
                  : 'Confirm Reassign'}
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* Overlay Drawer */}
      <ComplaintDetailDrawer
        open={drawerOpen}
        complaintId={selectedComplaintId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedComplaintId(null);
        }}
        onUpdated={() => {
          loadList();
          loadStats();
        }}
      />

      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}
