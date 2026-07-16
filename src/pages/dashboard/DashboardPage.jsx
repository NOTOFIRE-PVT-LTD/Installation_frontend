import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faChartPie,
  faCheckDouble,
  faClock,
  faFolderOpen,
  faGift,
  faLocationDot,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import ProjectProgressCard from '../../components/projects/ProjectProgressCard';
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

function claimChipStyle(station) {
  if (station.commissioningDate) return { label: 'Commissioned', color: '#15803d', bg: '#dcfce7' };
  const status = station.claimStatus || 'Not started';
  if (status === 'Pending Approval') return { label: status, color: '#b45309', bg: '#fef3c7' };
  if (status === 'Approved') return { label: status, color: '#1d4ed8', bg: '#dbeafe' };
  if (status === 'Paid') return { label: status, color: '#047857', bg: '#d1fae5' };
  if (status === 'Rejected') return { label: status, color: '#b91c1c', bg: '#fee2e2' };
  return { label: status, color: '#64748b', bg: '#f1f5f9' };
}

function CircularWorkDone({ value = 0, size = 44, color = '#0f766e', thickness = 4 }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0, width: size, height: size }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: '#e8eef5', position: 'absolute', left: 0, top: 0 }}
      />
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={thickness}
        sx={{
          color: pct >= 100 ? '#23b26d' : color,
          position: 'absolute',
          left: 0,
          top: 0,
          [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: size <= 40 ? '0.5625rem' : '0.625rem', fontWeight: 700, lineHeight: 1 }}>
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
}

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

  const projectsWithStations = projectsOverview.filter((p) => p.stations?.length > 0);

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
            Track projects, stations, and percentage-wise work done
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

      <Grid container spacing={1.5}>
        <Grid item xs={12} lg={projectsWithStations.length ? 7 : 12} sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              bgcolor: '#fff',
              height: '100%',
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
              <Stack spacing={1}>
                {projectsOverview.map((project) => (
                  <ProjectProgressCard key={project.projectId} project={project} onOpen={openProject} />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {projectsWithStations.length > 0 && (
          <Grid item xs={12} lg={5} sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                bgcolor: '#fff',
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    bgcolor: '#e0f7fa',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                  }}
                >
                  <FontAwesomeIcon icon={faLocationDot} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Station board</Typography>
              </Stack>

              <Stack spacing={1.5}>
                {projectsWithStations.map((project) => (
                  <Box key={project.projectId} sx={{ minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1, minWidth: 0 }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          fontWeight={600}
                          noWrap
                          title={project.projectName}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {project.projectName}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.625rem', fontWeight: 600 }}>
                          {project.commissioned}/{project.stationCount} commissioned
                        </Typography>
                      </Box>
                      <CircularWorkDone value={project.completion ?? 0} size={46} color="#0f766e" />
                      <Button
                        size="small"
                        onClick={() => openProject(project)}
                        sx={{ flexShrink: 0, fontSize: '0.6875rem', minWidth: 0, px: 0.75 }}
                      >
                        View
                      </Button>
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                        gap: 0.85,
                      }}
                    >
                      {project.stations.map((station) => {
                        const chip = claimChipStyle(station);
                        const workDone = station.workDone ?? station.completion ?? 0;
                        const stationId = station.id || station._id;
                        return (
                          <Box
                            key={stationId || station.name}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (!stationId) return;
                              navigate(`/projects/${project.projectId}/stations/${stationId}`);
                            }}
                            onKeyDown={(e) => {
                              if ((e.key === 'Enter' || e.key === ' ') && stationId) {
                                e.preventDefault();
                                navigate(`/projects/${project.projectId}/stations/${stationId}`);
                              }
                            }}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 0.65,
                              p: 1,
                              borderRadius: '10px',
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: '#fafbfc',
                              minWidth: 0,
                              textAlign: 'center',
                              cursor: stationId ? 'pointer' : 'default',
                              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                              '&:hover': stationId
                                ? {
                                    borderColor: 'primary.light',
                                    boxShadow: '0 4px 12px rgba(47, 111, 237, 0.1)',
                                  }
                                : undefined,
                            }}
                          >
                            <CircularWorkDone value={workDone} size={52} color={chip.color} thickness={4.5} />
                            <Typography
                              title={station.name}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.6875rem',
                                lineHeight: 1.25,
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {station.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={chip.label}
                              sx={{
                                maxWidth: '100%',
                                bgcolor: chip.bg,
                                color: chip.color,
                                border: 'none',
                                height: 18,
                                '& .MuiChip-label': {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  px: 0.6,
                                  fontSize: '0.5625rem',
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

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
