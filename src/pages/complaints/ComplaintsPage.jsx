import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DataTable from '../../components/common/DataTable/DataTable';
import SlidingPills from '../../components/common/SlidingPills';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { complaintApi } from '../../api/complaintApi';
import { CATEGORY_OPTIONS } from './complaintUtils';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailDrawer from './ComplaintDetailDrawer';
import ComplaintStatsHeader from './ComplaintStatsHeader';
import ComplaintReassignDialog from './ComplaintReassignDialog';
import { buildComplaintColumns } from './complaintTableColumns';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PhoneIcon from '@mui/icons-material/Phone';
import DashboardIcon from '@mui/icons-material/Dashboard';

const EMPTY_STATS = { assigned: 0, total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, overdue: 0, unassigned: 0, today: 0, myTickets: 0 };
const STATUS_FILTER_OPTIONS = [
  { value: 'NEW', label: 'New' }, { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
];
const PRIORITY_FILTER_OPTIONS = [{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' }];
const CATEGORY_FILTER_OPTIONS = CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }));

export default function ComplaintsPage({ embedded = false }) {
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

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, ticketId: null, ticketNo: '', customerName: '', fromEngineerName: '', toEngineerId: '', toEngineerName: '', reason: '', loading: false,
  });

  const { page, pageSize, search, filters, sortField, sortOrder, queryParams, setPage, setPageSize, setSearch, setFilters, setSort } =
    useTableQueryParams({ defaultSortField: 'createdAt', defaultSortOrder: 'desc', defaultPageSize: 25, filterKeys: ['status', 'priority', 'category', 'assignedTo', 'isOverdue'] });

  useEffect(() => {
    if (sortField && sortField !== 'createdAt' && sortField !== 'resolvedAt') setSort('createdAt', 'desc');
  }, [sortField, setSort]);

  const dynamicFilters = useMemo(() => [
    { field: 'status', label: 'Status', type: 'select', options: STATUS_FILTER_OPTIONS },
    { field: 'priority', label: 'Priority', type: 'select', options: PRIORITY_FILTER_OPTIONS },
    {
      field: 'assignedTo', label: 'Engineer', type: 'select',
      options: [{ value: 'unassigned', label: '⚠️ Unassigned (Review Queue)' }, ...assignees.map((e) => ({ value: String(e._id || e.id), label: `${e.name}${e.jobRole ? ` (${e.jobRole})` : ''}` }))],
    },
    { field: 'category', label: 'Category', type: 'select', options: CATEGORY_FILTER_OPTIONS },
  ], [assignees]);

  const handleSelectEngineerFromTable = (row, newEngId, newEngName) => {
    if (String(row.assignedTo?._id || '') === String(newEngId || '')) return;
    setConfirmDialog({
      open: true, ticketId: row._id, ticketNo: row.ticketNo, customerName: row.customerName,
      fromEngineerName: row.assignedTo?.name || 'Unassigned', toEngineerId: newEngId || null, toEngineerName: newEngName, reason: '', loading: false,
    });
  };

  const handleConfirmReassign = async () => {
    if (!confirmDialog.ticketId) return;
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      const payload = { assignedTo: confirmDialog.toEngineerId || null };
      if (confirmDialog.reason?.trim()) {
        const isFirst = !confirmDialog.fromEngineerName || confirmDialog.fromEngineerName === 'Unassigned';
        payload.note = isFirst ? `Assigned to ${confirmDialog.toEngineerName}: ${confirmDialog.reason.trim()}` : `Reassigned from ${confirmDialog.fromEngineerName} to ${confirmDialog.toEngineerName}: ${confirmDialog.reason.trim()}`;
      }
      await complaintApi.update(confirmDialog.ticketId, payload);
      dispatch(showSnackbar({ message: `Ticket ${confirmDialog.ticketNo} assigned to ${confirmDialog.toEngineerName}`, severity: 'success' }));
      setConfirmDialog({ open: false, ticketId: null, ticketNo: '', customerName: '', fromEngineerName: '', toEngineerId: '', toEngineerName: '', reason: '', loading: false });
      loadList();
      loadStats();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to reassign engineer', severity: 'error' }));
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = useMemo(() => buildComplaintColumns({
    onSelectTicket: (id) => { setSelectedComplaintId(id); setDrawerOpen(true); },
    assignees,
    onSelectEngineer: handleSelectEngineerFromTable,
    isFieldEngineer,
  }), [assignees, isFieldEngineer]);

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
        total: kpis.totalOpenCount || 0, open: kpis.newTicketsCount || 0, assigned: kpis.assignedCount || 0,
        inProgress: kpis.inProgressCount || 0, resolved: kpis.resolvedCount || 0, closed: kpis.closedCount || 0,
        overdue: kpis.overdueCount || 0, unassigned: kpis.unassignedCount != null ? kpis.unassignedCount : (kpis.newTicketsCount || 0),
        today: kpis.newTicketsCount || 0, myTickets: kpis.myTicketsCount || 0,
      });
    } catch {
      setStats(EMPTY_STATS);
    }
  };

  useEffect(() => {
    complaintApi.assignees().then((res) => setAssignees(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadList();
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'my_tickets') setFilters({ assignedTo: String(user?._id || ''), status: '', isOverdue: '' });
    else if (newTab === 'assigned') setFilters({ status: 'ASSIGNED', assignedTo: '', isOverdue: '' });
    else if (newTab === 'unassigned') setFilters({ assignedTo: 'unassigned', status: '', isOverdue: '' });
    else if (newTab === 'in_progress') setFilters({ status: 'IN_PROGRESS,PENDING', assignedTo: isFieldEngineer ? String(user?._id || '') : '', isOverdue: '' });
    else if (newTab === 'resolved') setFilters({ status: 'RESOLVED,CLOSED', assignedTo: isFieldEngineer ? String(user?._id || '') : '', isOverdue: '' });
    else if (newTab === 'overdue') setFilters({ isOverdue: 'true', status: '', assignedTo: '' });
    else setFilters({ assignedTo: '', status: '', isOverdue: '' });
  };

  const queueTabs = useMemo(() => isFieldEngineer ? [
    { id: 'my_tickets', label: 'Assigned Tickets', count: stats.myTickets, showCount: true },
    { id: 'in_progress', label: 'In Progress & Follow-ups', count: stats.inProgress, showCount: true },
    { id: 'resolved', label: 'Resolved & Closed', count: stats.resolved + stats.closed, showCount: true },
    { id: 'all', label: 'All Tickets', showCount: false },
  ] : [
    { id: 'all', label: 'All Tickets', showCount: false },
    { id: 'assigned', label: 'Assigned Tickets', count: stats.assigned, showCount: true },
    { id: 'unassigned', label: '⚠️ Unassigned Queue', count: stats.unassigned, isAlert: true, showCount: true },
    { id: 'in_progress', label: 'In Progress & Follow-ups', count: stats.inProgress, showCount: true },
    { id: 'resolved', label: 'Resolved & Closed', count: stats.resolved + stats.closed, showCount: true },
  ], [isFieldEngineer, stats]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'primary.main', minWidth: 0, flex: '1 1 auto' }}>
            {isFieldEngineer ? 'Complaints' : 'Complaint Resolution'}
          </Typography>
          {!isFieldEngineer && (
            <>
              <Tooltip title="Operations Dashboard"><IconButton component={Link} to="/complaints/dashboard" size="small" sx={{ color: '#583714', border: '1px solid #D4A34E', bgcolor: 'rgba(212, 163, 78, 0.08)' }}><DashboardIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Customer QR Poster"><IconButton size="small" onClick={() => setQrOpen(true)} sx={{ color: '#583714', border: '1px solid #D4A34E', bgcolor: 'rgba(212, 163, 78, 0.08)' }}><QrCode2Icon fontSize="small" /></IconButton></Tooltip>
              <Button component={Link} to="/complaints/new" variant="contained" size="small" startIcon={<PhoneIcon fontSize="small" />} sx={{ background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)', color: '#3A230B', fontWeight: 800, textTransform: 'none' }}>+ Phone Intake</Button>
            </>
          )}
        </Stack>
      </Box>

      <ComplaintStatsHeader stats={stats} isFieldEngineer={isFieldEngineer} onFilterClick={handleTabChange} />

      <Box sx={{ mb: 1.5, overflowX: 'auto', WebkitOverflowScrolling: 'touch', minHeight: 48, display: 'flex', alignItems: 'center' }}>
        <SlidingPills tabs={queueTabs} activeTab={activeTab} onChange={handleTabChange} />
      </Box>

      <DataTable
        columns={columns} rows={rows} totalCount={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null} onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search} onSearchChange={setSearch} filterConfigs={dynamicFilters} filterValues={filters} onFilterChange={setFilters}
        loading={loading} onRowClick={(row) => { setSelectedComplaintId(row._id); setDrawerOpen(true); }}
      />

      <ComplaintDetailDrawer open={drawerOpen} complaintId={selectedComplaintId} onClose={() => { setDrawerOpen(false); setSelectedComplaintId(null); }} onUpdated={() => { loadList(); loadStats(); }} />
      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
      <ComplaintReassignDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} onConfirm={handleConfirmReassign} />
    </>
  );
}
