import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faChartPie,
  faCheckDouble,
  faClock,
  faFileInvoice,
  faFileSignature,
  faFolderOpen,
  faGift,
  faLocationDot,
  faMoneyBillWave,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';
import ProjectMaterialPieCard from '../../components/projects/ProjectMaterialPieCard';
import ProjectDrawer from '../projects/ProjectDrawer';
import { dashboardApi } from '../../api/dashboardApi';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency } from '../../utils/formatters';

const SUMMARY_CARDS = [
  {
    key: 'overallWorkDone',
    label: 'Work Done',
    icon: faChartPie,
    color: '#0f766e',
    bg: '#ccfbf1',
    format: (v) => `${v ?? 0}%`,
  },
  {
    key: 'totalProjects',
    label: 'Projects',
    icon: faFolderOpen,
    color: '#2f6fed',
    bg: '#eaf2ff',
    format: (v) => v ?? 0,
  },
  {
    key: 'stationsTracked',
    label: 'Stations',
    icon: faLocationDot,
    color: '#0891b2',
    bg: '#e0f7fa',
    format: (v) => v ?? 0,
  },
  {
    key: 'pendingApprovals',
    label: 'Approvals',
    icon: faClock,
    color: '#d97706',
    bg: '#fff7ed',
    format: (v) => v ?? 0,
  },
  {
    key: 'delayFlags',
    label: 'Delays',
    icon: faBolt,
    color: '#dc2626',
    bg: '#fef2f2',
    format: (v) => v ?? 0,
  },
  {
    key: 'bonusAwarded',
    label: 'Bonus',
    icon: faGift,
    color: '#059669',
    bg: '#ecfdf5',
    format: (v) => formatCurrency(v || 0),
  },
];

function SummaryStat({ label, value, icon, color, bg }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        bgcolor: '#fff',
        height: '100%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 13,
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          title={String(value)}
          sx={{
            fontWeight: 700,
            fontSize: '0.9375rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            mt: 0.15,
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

function MiniMetricBox({ label, value, color = 'text.primary', bg = '#f8fafc' }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '8px',
        bgcolor: bg,
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.625rem',
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      <Typography
        title={String(value)}
        sx={{
          mt: 0.25,
          fontWeight: 800,
          fontSize: '0.95rem',
          color,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ModuleSectionCard({ title, subtitle, icon, color, bg, onViewAll, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        bgcolor: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: bg,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={icon} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>{title}</Typography>
            {subtitle && (
              <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {onViewAll && (
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onViewAll}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
          >
            View All
          </Button>
        )}
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>{children}</Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const canManageProjects = usePermission('projects');
  const [stats, setStats] = useState(null);
  const [projectsOverview, setProjectsOverview] = useState([]);
  const [modulesOverview, setModulesOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, overviewRes, modulesRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.projectsOverview(20),
        dashboardApi.modulesOverview().catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data.data);
      setProjectsOverview(overviewRes.data.data);
      setModulesOverview(modulesRes.data?.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openProject = (project) => {
    navigate(`/projects/${project.projectId || project._id}`);
  };

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  const quotations = modulesOverview?.quotations;
  const proformaInvoices = modulesOverview?.proformaInvoices;
  const deliveryChallans = modulesOverview?.deliveryChallans;
  const atlantaPayments = modulesOverview?.atlantaPayments;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 1.75 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>Dashboard</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.15 }}>
            Unified overview of Projects, Quotations, Proforma Invoices, Delivery Challans & Atlanta Payments
          </Typography>
        </Box>
        {canManageProjects && (
          <Button
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            variant="contained"
            onClick={() => setAddOpen(true)}
            sx={{
              flexShrink: 0,
              bgcolor: '#2f6fed',
              borderRadius: '8px',
              px: 1.5,
              py: 0.6,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#1746b7' },
            }}
          >
            Add Project
          </Button>
        )}
      </Stack>

      {/* Top Project KPI Row */}
      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        {SUMMARY_CARDS.map((card) => (
          <Grid item xs={6} sm={4} md={2} key={card.key} sx={{ minWidth: 0 }}>
            <SummaryStat
              label={card.label}
              value={card.format(stats?.[card.key])}
              icon={card.icon}
              color={card.color}
              bg={card.bg}
            />
          </Grid>
        ))}
      </Grid>

      {/* 4 Modules Stacked in a 2x2 Grid */}
      {modulesOverview && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {/* 1. Quotations Overview */}
          <Grid item xs={12} lg={6}>
            <ModuleSectionCard
              title="Quotations"
              subtitle="Summary of quotations and quoted value"
              icon={faFileInvoice}
              color="#4f46e5"
              bg="#eef2ff"
              onViewAll={() => navigate('/quotations')}
            >
              <Grid container spacing={1.25}>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox label="Total Quotations" value={quotations?.totalCount ?? 0} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox
                    label="Total Quoted Value"
                    value={formatCurrency(quotations?.totalAmount || 0)}
                    color="#4f46e5"
                    bg="#eef2ff"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MiniMetricBox
                    label="Accepted / Sent"
                    value={`${quotations?.byStatus?.accepted ?? 0} / ${quotations?.byStatus?.sent ?? 0}`}
                    color="#15803d"
                  />
                </Grid>
              </Grid>
            </ModuleSectionCard>
          </Grid>

          {/* 2. Proforma Invoices Overview */}
          <Grid item xs={12} lg={6}>
            <ModuleSectionCard
              title="Proforma Invoices"
              subtitle="Net invoice values and GST summary"
              icon={faFileSignature}
              color="#0369a1"
              bg="#e0f2fe"
              onViewAll={() => navigate('/proforma-invoices')}
            >
              <Grid container spacing={1.25}>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox label="Total PIs" value={proformaInvoices?.totalCount ?? 0} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox
                    label="Total Net Value"
                    value={formatCurrency(proformaInvoices?.totalNetAmount || 0)}
                    color="#0369a1"
                    bg="#e0f2fe"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MiniMetricBox
                    label="Total GST"
                    value={formatCurrency(proformaInvoices?.totalGstAmount || 0)}
                    color="#0f766e"
                  />
                </Grid>
              </Grid>
            </ModuleSectionCard>
          </Grid>

          {/* 3. Delivery Challans Overview */}
          <Grid item xs={12} lg={6}>
            <ModuleSectionCard
              title="Delivery Challans"
              subtitle="Dispatch value across companies"
              icon={faTruck}
              color="#0e7490"
              bg="#ecfeff"
              onViewAll={() => navigate('/delivery-challans')}
            >
              <Grid container spacing={1.25}>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox label="Total Challans" value={deliveryChallans?.totalCount ?? 0} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <MiniMetricBox
                    label="Total Dispatch Value"
                    value={formatCurrency(deliveryChallans?.totalValue || 0)}
                    color="#0e7490"
                    bg="#ecfeff"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MiniMetricBox
                    label="Notofire / Valuecon"
                    value={`${deliveryChallans?.bySeller?.notofire ?? 0} / ${deliveryChallans?.bySeller?.valuecon ?? 0}`}
                  />
                </Grid>
              </Grid>
            </ModuleSectionCard>
          </Grid>

          {/* 4. Atlanta Payments Overview */}
          <Grid item xs={12} lg={6}>
            <ModuleSectionCard
              title="Atlanta Payments"
              subtitle="Expenses, payments received and amount to give"
              icon={faMoneyBillWave}
              color="#dc2626"
              bg="#fef2f2"
              onViewAll={() => navigate('/atlanta-payments')}
            >
              <Grid container spacing={1.25}>
                <Grid item xs={6} sm={3}>
                  <MiniMetricBox label="Total Records" value={atlantaPayments?.totalCount ?? 0} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MiniMetricBox
                    label="Total Expense"
                    value={formatCurrency(atlantaPayments?.totalExpense || 0)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MiniMetricBox
                    label="Total Received"
                    value={formatCurrency(atlantaPayments?.totalReceivedAmount || 0)}
                    color="#15803d"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MiniMetricBox
                    label="Amount to Give"
                    value={formatCurrency(atlantaPayments?.totalAmountToGive || 0)}
                    color="#dc2626"
                    bg="#fef2f2"
                  />
                </Grid>
              </Grid>
            </ModuleSectionCard>
          </Grid>
        </Grid>
      )}

      {/* Projects Section */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          bgcolor: '#fff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                bgcolor: '#eaf2ff',
                color: '#2f6fed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
              }}
            >
              <FontAwesomeIcon icon={faCheckDouble} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Projects</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', fontWeight: 600 }}>
            Avg work {stats?.avgCompletion ?? 0}% · {projectsOverview.length} total
          </Typography>
        </Stack>

        {projectsOverview.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontSize: '0.75rem', py: 2 }}>
            No projects yet
          </Typography>
        ) : (
          <Grid container spacing={1.5}>
            {projectsOverview.map((project) => (
              <Grid item xs={12} sm={6} lg={4} key={project.projectId} sx={{ minWidth: 0 }}>
                <ProjectMaterialPieCard project={project} onOpen={openProject} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <ProjectDrawer
        open={addOpen}
        project={null}
        onClose={() => setAddOpen(false)}
        onProjectSaved={(saved) => {
          setAddOpen(false);
          loadDashboard();
          navigate(`/projects/${saved._id}`);
        }}
      />
    </Box>
  );
}
