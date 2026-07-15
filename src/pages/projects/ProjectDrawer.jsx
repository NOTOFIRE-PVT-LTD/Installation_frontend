import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import ProjectDetailsTab from './ProjectDetailsTab';
import ProjectCadDrawingTab from './ProjectCadDrawingTab';
import ProjectStationsTab from './ProjectStationsTab';
import ProjectDailyReportingTab from './ProjectDailyReportingTab';
import { projectProgress } from '../../utils/projectFlow';
import { formatDate } from '../../utils/formatters';

function SummaryStat({ label, value }) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mt: 0.15, color: 'text.primary' }} noWrap title={String(value)}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ProjectDrawer({ open, project, loading = false, onClose, onProjectSaved }) {
  const navigate = useNavigate();
  const { isAdmin, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [currentProject, setCurrentProject] = useState(project);

  const canManageProjectDetails = isAdmin ? Boolean(permissions?.projects) : false;
  const canContributeToProject = isAdmin ? Boolean(permissions?.projects) : permissions ? permissions.projects !== false : true;
  const canViewCadDrawings = isAdmin ? Boolean(permissions?.cadDrawing) : permissions ? permissions.cadDrawing !== false : true;

  useEffect(() => {
    if (open) {
      setCurrentProject(project);
      setActiveTab(0);
    }
  }, [open, project]);

  const isNew = !loading && !currentProject;
  const showExisting = !loading && Boolean(currentProject);

  const handleSaved = (saved) => {
    setCurrentProject(saved);
    onProjectSaved?.(saved);
  };

  const { pct, commissioned, total } = showExisting
    ? projectProgress(currentProject)
    : { pct: 0, commissioned: 0, total: 0 };

  const statusChip =
    pct >= 100
      ? { label: 'Completed', color: '#15803d', bg: '#dcfce7' }
      : pct > 0
        ? { label: 'In Progress', color: '#1d4ed8', bg: '#dbeafe' }
        : { label: 'Not Started', color: '#64748b', bg: '#f1f5f9' };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: '-8px 0 32px rgba(31, 42, 68, 0.1)',
        },
      }}
    >
      <Box sx={{ width: { xs: '100vw', sm: 720 }, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
        <Box
          sx={{
            px: 1.75,
            pt: 1.5,
            pb: 1.25,
            background: 'linear-gradient(180deg, #e6fffb 0%, #ffffff 72%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#ccfbf1',
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  mt: 0.15,
                }}
              >
                <FontAwesomeIcon icon={isNew ? faFolderPlus : faFolderOpen} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                  {loading ? 'Loading project…' : isNew ? 'Add Project' : currentProject.projectName}
                </Typography>
                {showExisting && (
                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.25 }}>
                    {[
                      currentProject.panelSerialNo ? `Panel ${currentProject.panelSerialNo}` : null,
                      currentProject.railwayZone,
                      currentProject.loaNo ? `LOA ${currentProject.loaNo}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Project details'}
                  </Typography>
                )}
                {isNew && (
                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.25 }}>
                    Fill details below to create a new project
                  </Typography>
                )}
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
              {showExisting && (
                <Button
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    onClose();
                    navigate(`/projects/${currentProject._id}`);
                  }}
                  sx={{ fontSize: '0.6875rem', color: '#0f766e', fontWeight: 600 }}
                >
                  Full page
                </Button>
              )}
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ borderRadius: '8px', bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {showExisting && (
            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  label={statusChip.label}
                  sx={{ bgcolor: statusChip.bg, color: statusChip.color, fontWeight: 600, border: 'none', height: 20 }}
                />
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: 'text.secondary' }}>
                  {pct}% · {commissioned}/{total} stations
                </Typography>
                {currentProject.targetDate && (
                  <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                    · Target {formatDate(currentProject.targetDate)}
                  </Typography>
                )}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 5,
                  borderRadius: 999,
                  bgcolor: '#e0f2f1',
                  mb: 1.25,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: pct >= 100 ? '#23b26d' : '#0f766e',
                  },
                }}
              />
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: '#f8fafc',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <SummaryStat label="Installer" value={currentProject.installerName || '—'} />
                <Box sx={{ width: '1px', bgcolor: 'divider', flexShrink: 0 }} />
                <SummaryStat label="Contractor" value={currentProject.contractor || '—'} />
                <Box sx={{ width: '1px', bgcolor: 'divider', flexShrink: 0 }} />
                <SummaryStat label="Stations" value={`${currentProject.stations?.length || 0}`} />
              </Stack>
            </Box>
          )}
        </Box>

        {!isNew && (
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              px: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fafbfc',
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0.75,
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
              },
              '& .Mui-selected': { color: '#0f766e' },
              '& .MuiTabs-indicator': { bgcolor: '#0f766e', height: 2 },
            }}
          >
            <Tab label="Details" disabled={loading} />
            <Tab label="Cad Drawing" disabled={loading || !canViewCadDrawings} />
            <Tab label="Stations" disabled={loading || !canContributeToProject} />
            <Tab label="Daily Reporting" disabled={loading || !canContributeToProject} />
          </Tabs>
        )}

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress size={28} />
              <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
                Loading project details…
              </Typography>
            </Stack>
          ) : (
            <>
              {(isNew || activeTab === 0) && (
                <ProjectDetailsTab
                  project={currentProject}
                  canManage={canManageProjectDetails || isNew}
                  isAdmin={isAdmin}
                  onSaved={handleSaved}
                />
              )}
              {!isNew && activeTab === 1 && <ProjectCadDrawingTab project={currentProject} />}
              {!isNew && activeTab === 2 && (
                <ProjectStationsTab project={currentProject} canManage={canContributeToProject} onProjectUpdated={handleSaved} />
              )}
              {!isNew && activeTab === 3 && (
                <ProjectDailyReportingTab
                  project={currentProject}
                  canManage={canContributeToProject}
                  onProjectUpdated={handleSaved}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
