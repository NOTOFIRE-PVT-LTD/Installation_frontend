import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PageHeader from '../../components/common/PageHeader';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailDrawer from './ComplaintDetailDrawer';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EngineeringIcon from '@mui/icons-material/Engineering';

const DASH_CARD_SX = {
  p: 2.5,
  borderRadius: '16px',
  border: '1.5px solid #E2D3BE',
  background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
  height: '100%',
  transform: 'translate3d(0, 0, 0)',
  transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease',
  willChange: 'transform',
  '&:hover': {
    transform: 'translate3d(0, -12px, 0)',
    boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)',
  },
};

function usePagedComplaints(filter, refresh = 0) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let live = true;
    complaintApi
      .list({ ...filter, page: page + 1, pageSize: rowsPerPage })
      .then((res) => {
        if (!live) return;
        setRows(res.data?.data || []);
        setTotal(res.data?.meta?.total || 0);
      })
      .catch(() => {
        if (live) {
          setRows([]);
          setTotal(0);
        }
      });
    return () => {
      live = false;
    };
  }, [filterKey, page, rowsPerPage, refresh]);

  return { rows, total, page, rowsPerPage, setPage, setRowsPerPage };
}

function ListPager({ page, rowsPerPage, total, setPage, setRowsPerPage }) {
  if (total <= 0) return null;
  return (
    <TablePagination
      component="div"
      count={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, next) => setPage(next)}
      onRowsPerPageChange={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      }}
      rowsPerPageOptions={[5, 10, 25]}
      sx={{
        borderTop: '1px solid #E2D3BE',
        mt: 1,
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#583714',
        },
      }}
    />
  );
}

function KpiCard({ label, count, color, bg, border, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: 108,
        cursor: onClick ? 'pointer' : 'default',
        transform: 'translate3d(0, 0, 0)',
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
        '&:hover': { transform: 'translate3d(0, -12px, 0)' },
        '&:hover .kpi-card-paper': {
          borderColor: '#D4A34E',
          boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)',
        },
      }}
    >
    <Paper
      elevation={0}
      className="kpi-card-paper"
      sx={{
        p: 2,
        borderRadius: '14px',
        border: `1.5px solid ${border || '#E2D3BE'}`,
        background: bg || 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 108,
        boxShadow: '0 2px 8px rgba(36, 20, 4, 0.03)',
        transition: 'box-shadow 0.32s ease, border-color 0.2s ease',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: color || '#583714',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'block',
          fontSize: '0.6875rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: '#241404', mt: 0.5, lineHeight: 1.1 }}
      >
        {count ?? 0}
      </Typography>
    </Paper>
    </Box>
  );
}

export default function ComplaintDashboardPage() {
  const navigate = useNavigate();
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

  const overdue = usePagedComplaints(
    { isOverdue: 'true', sortField: 'followUpDate', sortOrder: 'asc' },
    listTick
  );

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await complaintApi.dashboardMetrics();
      setData(res.data?.data || res.data);
    } catch (err) {
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
  const paginatedEngineers = engineerList.slice(
    engineerPage * engineerRowsPerPage,
    engineerPage * engineerRowsPerPage + engineerRowsPerPage
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto', width: '100%' }}>
      {/* Top Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#241404' }}>
            {isFieldEngineer ? 'My Assigned Dashboard' : 'Service Operations Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#583714' }}>
            {isFieldEngineer
              ? `Assigned tickets and SLA follow-ups for ${user?.name || 'you'}`
              : 'Master complaint queue, SLA follow-ups, and field engineer workloads'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            onClick={fetchDashboard}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#D4A34E',
              color: '#583714',
              bgcolor: 'rgba(212, 163, 78, 0.08)',
              '&:hover': {
                borderColor: '#B57F2F',
                bgcolor: 'rgba(212, 163, 78, 0.18)',
              },
            }}
          >
            Refresh
          </Button>

          {!isFieldEngineer && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setQrOpen(true)}
            startIcon={<QrCode2Icon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#D4A34E',
              color: '#583714',
              bgcolor: 'rgba(212, 163, 78, 0.08)',
              '&:hover': {
                borderColor: '#B57F2F',
                bgcolor: 'rgba(212, 163, 78, 0.18)',
              },
            }}
          >
            QR & Links
          </Button>
          )}

          <Button
            component={Link}
            to={ticketsPath}
            variant="outlined"
            size="small"
            startIcon={<ListAltIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#D4A34E',
              color: '#583714',
              bgcolor: 'rgba(212, 163, 78, 0.08)',
              '&:hover': {
                borderColor: '#B57F2F',
                bgcolor: 'rgba(212, 163, 78, 0.18)',
              },
            }}
          >
            All Tickets
          </Button>

          {!isFieldEngineer && (
          <Button
            component={Link}
            to="/complaints/new"
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
              color: '#3A230B',
              px: 2,
              boxShadow: '0 2px 8px rgba(88, 55, 20, 0.2)',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
              },
            }}
          >
            + Phone Intake
          </Button>
          )}
        </Stack>
      </Stack>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Prominent NEW TICKETS Alert Banner */}
          {!isFieldEngineer && kpis.newTicketsCount > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #fecaca',
                bgcolor: '#fef2f2',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#ef4444',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  <NotificationsActiveIcon />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={800} color="#991b1b">
                      {kpis.newTicketsCount} Unprocessed New Complaint{kpis.newTicketsCount > 1 ? 's' : ''}
                    </Typography>
                    <Chip
                      size="small"
                      label="Action Needed"
                      sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="#7f1d1d">
                    New customer complaints awaiting handler acknowledgment and engineer allocation.
                  </Typography>
                </Box>
              </Stack>

              <Button
                component={Link}
                to={`${ticketsPath}?isNewOnly=true`}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#dc2626',
                  '&:hover': { bgcolor: '#b91c1c' },
                  borderRadius: '16px',
                  fontWeight: 700,
                  textTransform: 'none',
                  shrink: 0,
                }}
              >
                Review New Queue
              </Button>
            </Paper>
          )}

                    {/* 5 Operational KPIs */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)',
              },
              gap: 2,
              pt: 1.5,
              overflow: 'visible',
              alignItems: 'stretch',
            }}
          >
            <KpiCard
              label="Total Open"
              count={kpis.totalOpenCount}
              color="#583714"
              onClick={() => navigate(ticketsPath)}
            />
            <KpiCard
              label="Assigned"
              count={kpis.assignedCount}
              color="#85581A"
              onClick={() => navigate(`${ticketsPath}?status=ASSIGNED`)}
            />
            <KpiCard
              label="In Progress"
              count={kpis.inProgressCount}
              color="#B37A22"
              onClick={() => navigate(`${ticketsPath}?status=IN_PROGRESS`)}
            />
            <KpiCard
              label="Resolved"
              count={kpis.resolvedCount}
              color="#2E623B"
              onClick={() => navigate(`${ticketsPath}?status=RESOLVED`)}
            />
            <KpiCard
              label="Closed"
              count={kpis.closedCount}
              color="#6B5E4F"
              onClick={() => navigate(`${ticketsPath}?status=CLOSED`)}
            />
          </Box>

          {/* Overdue Follow-ups + Field Engineer Workload */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: isFieldEngineer ? '1fr' : '1fr 1fr' },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            {/* Overdue Follow-ups */}
            <Paper elevation={0} sx={{ ...DASH_CARD_SX, minHeight: 240 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <WarningAmberIcon sx={{ color: '#dc2626' }} />
                  <Typography variant="subtitle1" fontWeight={800} color="#991b1b">
                    Overdue Follow-ups (Action Required)
                  </Typography>
                </Stack>

                {overdue.rows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    Excellent! No overdue tickets currently.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {overdue.rows.map((t) => (
                      <Box
                        key={t._id}
                        onClick={() => {
                          setSelectedTicketId(t._id);
                          setDrawerOpen(true);
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: '16px',
                          border: '1px solid #fecaca',
                          bgcolor: '#fef2f2',
                          cursor: 'pointer',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={700} color="#b91c1c">
                            {t.ticketNo} • {t.customerName}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="#dc2626">
                            Passed: {new Date(t.followUpDate || t.dueAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="#7f1d1d" noWrap sx={{ display: 'block', mt: 0.25 }}>
                          Assigned: {t.assignedTo?.name || 'Unassigned'} • Issue: {t.subject}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
                <ListPager {...overdue} />
              </Paper>

          {!isFieldEngineer && (
          <Paper elevation={0} sx={DASH_CARD_SX}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <EngineeringIcon sx={{ color: '#583714' }} />
              <Typography variant="subtitle1" fontWeight={800} color="#241404">
                Field Engineer Workload & Active Ticket Distribution
              </Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Engineer Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department / Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Assigned</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>In Progress</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Active</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Resolved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEngineers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No field engineers registered for ticket allocation.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEngineers.map((eng) => {
                      const displayRole =
                        eng.department === 'INSTALLER' || !eng.department
                          ? 'Field Engineer'
                          : eng.department;
                      const isCoordinator = displayRole.includes('Coordinator') || displayRole.includes('Admin');
                      return (
                        <TableRow key={eng.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{eng.name}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={displayRole}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.6875rem',
                                bgcolor: isCoordinator ? 'rgba(212, 163, 78, 0.16)' : '#E0F2FE',
                                color: isCoordinator ? '#85581A' : '#0369A1',
                                border: '1px solid',
                                borderColor: isCoordinator ? 'rgba(212, 163, 78, 0.35)' : '#BAE6FD',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{eng.assigned}</TableCell>
                          <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#4338ca' }}>
                            {eng.inProgress}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              size="small"
                              label={eng.totalActive}
                              sx={{
                                fontWeight: 800,
                                bgcolor: eng.totalActive > 3 ? '#fef2f2' : '#f0fdfa',
                                color: eng.totalActive > 3 ? '#b91c1c' : '#0f766e',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', color: '#047857', fontWeight: 600 }}>
                            {eng.resolved}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={engineerList.length}
              rowsPerPage={engineerRowsPerPage}
              page={engineerPage}
              onPageChange={(_event, newPage) => setEngineerPage(newPage)}
              onRowsPerPageChange={(event) => {
                setEngineerRowsPerPage(parseInt(event.target.value, 10));
                setEngineerPage(0);
              }}
              sx={{
                borderTop: '1px solid #E2D3BE',
                mt: 1,
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#583714',
                },
              }}
            />
          </Paper>
          )}
          </Box>
        </Stack>
      )}

      {/* Drawer Overlay for Editing & Details */}
      <ComplaintDetailDrawer
        open={drawerOpen}
        complaintId={selectedTicketId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        onUpdated={() => {
          fetchDashboard();
          setListTick((n) => n + 1);
        }}
      />

      {/* QR Code Dialog */}
      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </Box>
  );
}

