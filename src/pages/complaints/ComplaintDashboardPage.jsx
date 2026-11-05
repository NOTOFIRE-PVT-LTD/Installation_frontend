import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailDrawer from './ComplaintDetailDrawer';
import DashboardKpiSection from './DashboardKpiSection';
import DashboardOverdueList from './DashboardOverdueList';
import DashboardEngineerWorkloadTable from './DashboardEngineerWorkloadTable';

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
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto', width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#241404' }}>
            {isFieldEngineer ? 'My Assigned Dashboard' : 'Service Operations Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#583714' }}>
            {isFieldEngineer ? `Assigned tickets and SLA follow-ups for ${user?.name || 'you'}` : 'Master complaint queue, SLA follow-ups, and field engineer workloads'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" size="small" onClick={fetchDashboard} disabled={loading} startIcon={<RefreshIcon />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714', bgcolor: 'rgba(212, 163, 78, 0.08)' }}>
            Refresh
          </Button>
          {!isFieldEngineer && (
            <Button variant="outlined" size="small" onClick={() => setQrOpen(true)} startIcon={<QrCode2Icon />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714', bgcolor: 'rgba(212, 163, 78, 0.08)' }}>
              QR & Links
            </Button>
          )}
          <Button component={Link} to={ticketsPath} variant="outlined" size="small" startIcon={<ListAltIcon />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714', bgcolor: 'rgba(212, 163, 78, 0.08)' }}>
            All Tickets
          </Button>
          {!isFieldEngineer && (
            <Button component={Link} to="/complaints/new" variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)', color: '#3A230B', px: 2 }}>
              + Phone Intake
            </Button>
          )}
        </Stack>
      </Stack>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          <DashboardKpiSection kpis={kpis} isFieldEngineer={isFieldEngineer} ticketsPath={ticketsPath} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: isFieldEngineer ? '1fr' : '1fr 1fr' }, gap: 2, alignItems: 'stretch' }}>
            <DashboardOverdueList overdue={overdue} onSelectTicket={(id) => { setSelectedTicketId(id); setDrawerOpen(true); }} />
            {!isFieldEngineer && (
              <DashboardEngineerWorkloadTable
                engineerList={engineerList}
                engineerPage={engineerPage}
                setEngineerPage={setEngineerPage}
                engineerRowsPerPage={engineerRowsPerPage}
                setEngineerRowsPerPage={setEngineerRowsPerPage}
              />
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
