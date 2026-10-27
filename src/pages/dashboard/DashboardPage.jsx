import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faChartPie,
  faCheckDouble,
  faClock,
  faFolderOpen,
  faGift,
  faHandshake,
  faLocationDot,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import ProjectMaterialPieCard from '../../components/projects/ProjectMaterialPieCard';
import ProjectDrawer from '../projects/ProjectDrawer';
import { dashboardApi } from '../../api/dashboardApi';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency } from '../../utils/formatters';

const TONE = {
  red: { color: '#DC1F2E', bg: '#FBECEE' },
  flame: { color: '#F2554A', bg: '#FBECEE' },
  gold: { color: '#DC1F2E', bg: '#FBECEE' },
  cream: { color: '#9B1520', bg: '#FFF8F8' },
};

const SUMMARY_CARDS = [
  {
    key: 'overallWorkDone',
    label: 'Work Done',
    icon: faChartPie,
    ...TONE.gold,
    format: (v) => `${v ?? 0}%`,
  },
  {
    key: 'totalProjects',
    label: 'Projects',
    icon: faFolderOpen,
    ...TONE.red,
    format: (v) => v ?? 0,
  },
  {
    key: 'stationsTracked',
    label: 'Stations',
    icon: faLocationDot,
    ...TONE.cream,
    format: (v) => v ?? 0,
  },
  {
    key: 'pendingApprovals',
    label: 'Approvals',
    icon: faClock,
    ...TONE.gold,
    format: (v) => v ?? 0,
  },
  {
    key: 'delayFlags',
    label: 'Delays',
    icon: faBolt,
    ...TONE.flame,
    format: (v) => v ?? 0,
  },
  {
    key: 'bonusAwarded',
    label: 'Bonus',
    icon: faGift,
    ...TONE.red,
    format: (v) => formatCurrency(v || 0),
  },
];

const FIELD_SALES_CARDS = [
  { key: 'fieldCustomers', label: 'Customers', icon: faHandshake, ...TONE.red, format: (v) => v ?? 0 },
  { key: 'fieldSalespeople', label: 'Salespeople', icon: faUsers, ...TONE.flame, format: (v) => v ?? 0 },
  { key: 'fieldPunchedIn', label: 'Punched in today', icon: faClock, ...TONE.gold, format: (v) => v ?? 0 },
  { key: 'fieldPunchedOut', label: 'Closed attendance', icon: faCheckDouble, ...TONE.cream, format: (v) => v ?? 0 },
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
        bgcolor: 'background.paper',
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
          borderRadius: '999px',
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const canManageProjects = usePermission('projects');
  const [stats, setStats] = useState(null);
  const [projectsOverview, setProjectsOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, overviewRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.projectsOverview(20),
      ]);
      setStats(statsRes.data.data);
      setProjectsOverview(overviewRes.data.data);
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
            Each project shows Panel / ASD / LHS material status as a pie chart
          </Typography>
        </Box>
        {canManageProjects && (
          <Button
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            variant="contained"
            onClick={() => setAddOpen(true)}
            sx={{
              flexShrink: 0,
              px: 1.5,
              py: 0.6,
              fontSize: '0.75rem',
            }}
          >
            Add Project
          </Button>
        )}
      </Stack>

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

      <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 1 }}>Field sales</Typography>
      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        {FIELD_SALES_CARDS.map((card) => (
          <Grid item xs={6} md={3} key={card.key} sx={{ minWidth: 0 }}>
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

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '999px',
                bgcolor: '#FFE8EA',
                color: '#DC1F2E',
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
