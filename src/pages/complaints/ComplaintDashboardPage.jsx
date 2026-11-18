import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailDrawer from './ComplaintDetailDrawer';
import DashboardKpiSection from './DashboardKpiSection';
import DashboardOverdueList from './DashboardOverdueList';
import DashboardEngineerWorkloadTable from './DashboardEngineerWorkloadTable';
import ComplaintDashboardActions from './ComplaintDashboardActions';

function usePagedComplaints(filter, refresh = 0) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let live = true;
    complaintApi.list({ ...filter, page: page + 1, pageSize: rowsPerPage })
      .then((res) => {
        if (!live) return;
        setRows(res.data?.data || []);
        setTotal(res.data?.meta?.total || 0);
      })
      .catch(() => { if (live) { setRows([]); setTotal(0); } });
    return () => { live = false; };
  }, [filterKey, page, rowsPerPage, refresh]);

  return { rows, total, page, rowsPerPage, setPage, setRowsPerPage };
}

export default function ComplaintDashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isFieldEngineer = user?.role === 'User';
  const ticketsPath = isFieldEngineer ? '/complaints/desk' : '/complaints';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [engineerPage, setEngineerPage] = useState(0);
  const [engineerRowsPerPage, setEngineerRowsPerPage] = useState(5);
  const [listTick, setListTick] = useState(0);

  const overdue = usePagedComplaints({ isOverdue: 'true', sortField: 'followUpDate', sortOrder: 'asc' }, listTick);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await complaintApi.dashboardMetrics();
      setData(res.data?.data || res.data);
    } catch {
      dispatch(showSnackbar({ message: 'Failed to load complaint dashboard', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const engineerList = data?.engineerWorkload || [];

  return (
    <Box sx={{ p: { xs: 0, md: 1 }, maxWidth: 1600, mx: 'auto', width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#241404' }}>
            {isFieldEngineer ? 'My Assigned Dashboard' : 'Service Operations Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#583714' }}>
            {isFieldEngineer ? `Assigned tickets and SLA follow-ups for ${user?.name || 'you'}` : 'Master complaint queue, SLA follow-ups, and field engineer workloads'}
          </Typography>
        </Box>
        <ComplaintDashboardActions
          loading={loading}
          isFieldEngineer={isFieldEngineer}
          ticketsPath={ticketsPath}
          onRefresh={fetchDashboard}
          onOpenQr={() => setQrOpen(true)}
        />
      </Stack>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          <DashboardKpiSection kpis={kpis} isFieldEngineer={isFieldEngineer} ticketsPath={ticketsPath} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: isFieldEngineer ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)' },
              gap: 2,
              alignItems: 'stretch',
              width: '100%',
              minWidth: 0,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <DashboardOverdueList overdue={overdue} onSelectTicket={(id) => { setSelectedTicketId(id); setDrawerOpen(true); }} />
            </Box>
            {!isFieldEngineer && (
              <Box sx={{ minWidth: 0 }}>
                <DashboardEngineerWorkloadTable
                  engineerList={engineerList}
                  engineerPage={engineerPage}
                  setEngineerPage={setEngineerPage}
                  engineerRowsPerPage={engineerRowsPerPage}
                  setEngineerRowsPerPage={setEngineerRowsPerPage}
                />
              </Box>
            )}
          </Box>
        </Stack>
      )}

      <ComplaintDetailDrawer
        open={drawerOpen}
        complaintId={selectedTicketId}
        onClose={() => { setDrawerOpen(false); setSelectedTicketId(null); }}
        onUpdated={() => { fetchDashboard(); setListTick((n) => n + 1); }}
      />
      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </Box>
  );
}
