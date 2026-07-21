import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import StageStepper from '../../components/common/StageStepper';
import StatusBadge from '../../components/common/StatusBadge';
import StationReportDownloadMenu from '../../components/projects/StationReportDownloadMenu';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { fetchProjectById, addStation } from '../../features/projects/projectsThunks';
import { clearCurrent } from '../../features/projects/projectsSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import { projectProgress, daysLeftLabel, stationStage } from '../../utils/projectFlow';
import { STATION_STAGE_LABELS } from '../../utils/constants';
import ProjectDetailsTab from './ProjectDetailsTab';
import ProjectCadDrawingTab from './ProjectCadDrawingTab';
import ProjectDailyReportingTab from './ProjectDailyReportingTab';
import AddStationDialog from './AddStationDialog';

const PROJECT_STAGES = ['LOA Issued', 'Installation Started', 'Installation Completed', 'Commissioning', 'Claims & Payment'];

const ADD_BTN_SX = {
  bgcolor: '#e25555',
  color: '#fff',
  borderRadius: '8px',
  '&:hover': { bgcolor: '#c94343' },
};

const SQUARE_PAPER = {
  borderRadius: '8px',
  boxShadow: 'none',
  border: '1px solid',
  borderColor: 'divider',
};

function computeProjectStageStatuses(project) {
  const stations = project.stations || [];
  const total = stations.length || 1;
  const commissioned = stations.filter((s) => s.commissioningDate).length;
  const values = [
    1,
    stations.some((s) => s.startDate) ? 1 : 0,
    stations.every((s) => s.completionDate) ? 1 : stations.some((s) => s.completionDate) ? 0.5 : 0,
    commissioned / total,
    stations.some((s) => ['Approved', 'Paid'].includes(s.claimStatus)) ? 1 : 0,
  ];
  return values.map((v) => (v >= 1 ? 'done' : v > 0 ? 'current' : 'pending'));
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin, permissions } = useAuth();
  const project = useAppSelector((state) => state.projects.current);
  const currentStatus = useAppSelector((state) => state.projects.currentStatus);
  const [activeTab, setActiveTab] = useState(0);
  const [addStationOpen, setAddStationOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canManageProjectDetails = isAdmin ? Boolean(permissions?.projects) : false;
  const canContributeToProject = isAdmin ? Boolean(permissions?.projects) : permissions ? permissions.projects !== false : true;
  const canViewCadDrawings = isAdmin ? Boolean(permissions?.cadDrawing) : permissions ? permissions.cadDrawing !== false : true;

  useEffect(() => {
    dispatch(fetchProjectById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (currentStatus === 'loading' || !project) {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const { pct, commissioned, total } = projectProgress(project);
  const stageStatuses = computeProjectStageStatuses(project);
  const stations = project.stations || [];
  const totalAllocated = stations.reduce((sum, s) => sum + (Number(s.installationAmount) || 0), 0);

  const handleAddStation = async (formData) => {
    setSubmitting(true);
    try {
      await dispatch(addStation({ id: project._id, formData })).unwrap();
      dispatch(showSnackbar({ message: 'Station added successfully' }));
      setAddStationOpen(false);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to add station', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link component="button" variant="body2" onClick={() => navigate('/projects')} underline="hover">
          Projects
        </Link>
        <Typography variant="body2" color="text.primary">
          {project.workName || project.projectName}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
        {project.projectName}
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, ...SQUARE_PAPER, mb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Progress of Project Tracker
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusBadge status={pct >= 100 ? 'Completed' : 'In Progress'} />
            <Typography variant="caption" color="text.secondary">
              {commissioned}/{total} stations commissioned · {daysLeftLabel(project)}
              {project.targetDate ? ` · Target ${formatDate(project.targetDate)}` : ''}
            </Typography>
          </Stack>
        </Stack>
        <StageStepper steps={PROJECT_STAGES} statuses={stageStatuses} />
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Overview" />
        <Tab label="Cad Drawing" disabled={!canViewCadDrawings} />
        <Tab label="Daily Reporting" disabled={!canContributeToProject} />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Paper sx={{ p: { xs: 2, sm: 3 }, ...SQUARE_PAPER, mb: 2.5 }}>
            <ProjectDetailsTab
              project={project}
              canManage={canManageProjectDetails}
              isAdmin={isAdmin}
              onSaved={() => dispatch(fetchProjectById(id))}
            />
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 }, ...SQUARE_PAPER, mb: 2.5, overflow: 'hidden' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Station-Wise Amount of Installation
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Auto-calculated from Station Tab.
                </Typography>
                <StationReportDownloadMenu project={project} />
              </Stack>
            </Stack>

            {stations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No stations added yet.
              </Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: 520,
                    '& th, & td': {
                      py: 1.25,
                      px: 1.5,
                      textAlign: 'left',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                    '& th': {
                      typography: 'caption',
                      fontWeight: 700,
                      color: 'text.secondary',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    },
                  }}
                >
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th">Station</Box>
                      <Box component="th">Type</Box>
                      <Box component="th">Amount Allocated</Box>
                      <Box component="th">Status</Box>
                      <Box component="th" sx={{ width: 56 }}>
                        Report
                      </Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {stations.map((station) => (
                      <Box
                        component="tr"
                        key={station._id}
                        sx={{ cursor: 'pointer', '&:hover td': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/projects/${project._id}/stations/${station._id}`)}
                      >
                        <Box component="td">
                          <Typography variant="body2" fontWeight={600}>
                            {station.name}
                          </Typography>
                        </Box>
                        <Box component="td">
                          <Typography variant="body2" color="text.secondary">
                            {station.type || 'Station'}
                          </Typography>
                        </Box>
                        <Box component="td">
                          <Typography variant="body2">{formatCurrency(station.installationAmount || 0)}</Typography>
                        </Box>
                        <Box component="td">
                          <StatusBadge status={station.claimStatus || 'Not Submitted'} />
                        </Box>
                        <Box component="td" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={`Download ${station.name} PDF report`}>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                try {
                                  await downloadSingleStationReport(project, station);
                                } catch (err) {
                                  dispatch(
                                    showSnackbar({
                                      message: err?.message || 'Failed to generate PDF',
                                      severity: 'error',
                                    })
                                  );
                                }
                              }}
                              sx={{ color: '#0f766e' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                    <Box component="tr">
                      <Box component="td" sx={{ borderBottom: 'none !important' }}>
                        <Typography variant="body2" fontWeight={700}>
                          Total
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ borderBottom: 'none !important' }} />
                      <Box component="td" sx={{ borderBottom: 'none !important' }}>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(totalAllocated)}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ borderBottom: 'none !important' }} />
                      <Box component="td" sx={{ borderBottom: 'none !important' }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Stations in this Project
            </Typography>
            {canContributeToProject && (
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddStationOpen(true)} sx={{ ...ADD_BTN_SX, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                Add Station
              </Button>
            )}
          </Stack>
          {stations.length > 0 ? (
            <Grid container spacing={2}>
              {stations.map((station) => {
                const stage = stationStage(station);
                const statusLabel =
                  stage === -1 ? 'Claim Rejected' : stage >= 0 ? STATION_STAGE_LABELS[stage] : station.claimStatus;
                return (
                  <Grid item xs={12} sm={6} md={4} key={station._id}>
                    <Paper
                      sx={{ p: 2, ...SQUARE_PAPER, cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${project._id}/stations/${station._id}`)}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {station.name}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({station.type || 'Station'})
                        </Typography>
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <StatusBadge status={statusLabel} />
                      </Box>
                      {station.reasonForDelay && (
                        <Box sx={{ mt: 1 }}>
                          <StatusBadge status="Delayed" />
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography color="text.secondary">No stations added yet.</Typography>
          )}
        </>
      )}

      {activeTab === 1 && <ProjectCadDrawingTab project={project} />}
      {activeTab === 2 && (
        <ProjectDailyReportingTab project={project} canManage={canContributeToProject} onProjectUpdated={() => dispatch(fetchProjectById(id))} />
      )}

      <AddStationDialog open={addStationOpen} submitting={submitting} onClose={() => setAddStationOpen(false)} onSubmit={handleAddStation} />
    </Box>
  );
}
