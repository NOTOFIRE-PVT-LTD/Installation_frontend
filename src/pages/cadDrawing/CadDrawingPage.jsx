import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompassDrafting } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../components/common/PageHeader';
import ProjectProgressCard from '../../components/projects/ProjectProgressCard';
import ManageDivisionsDialog from './ManageDivisionsDialog';
import ProjectCadDrawingDrawer from './ProjectCadDrawingDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchProjects, fetchProjectById } from '../../features/projects/projectsThunks';
import { fetchDivisions } from '../../features/divisions/divisionsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

const PAGE_SIZE_OPTIONS = [6, 9, 12, 24];

export default function CadDrawingPage() {
  const dispatch = useAppDispatch();
  const { isAdmin, permissions } = useAuth();
  const { items, total, status } = useAppSelector((state) => state.projects);
  const { page, pageSize, search, setPage, setPageSize, setSearch, queryParams } = useTableQueryParams({
    defaultPageSize: 6,
  });

  const canSubmitCad = isAdmin ? Boolean(permissions?.cadDrawing) : permissions ? permissions.cadDrawing !== false : true;
  const canManageCad = isAdmin && Boolean(permissions?.cadDrawing);

  const [localSearch, setLocalSearch] = useState(search || '');
  const debouncedSearch = useDebounce(localSearch, 400);
  const [manageDivisionsOpen, setManageDivisionsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    dispatch(fetchProjects(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    if (canManageCad) dispatch(fetchDivisions({ pageSize: 100 }));
  }, [dispatch, canManageCad]);

  const pageCount = Math.max(1, Math.ceil((total || 0) / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total || 0);

  const handleOpenProject = async (project) => {
    const id = project._id || project.projectId;
    setDrawerOpen(true);
    setSelectedProject(null);
    setDetailLoading(true);
    try {
      const full = await dispatch(fetchProjectById(id)).unwrap();
      setSelectedProject(full);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to load project', severity: 'error' }));
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedProject(null);
    setDetailLoading(false);
  };

  return (
    <>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: '#ffe7f3',
                color: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faCompassDrafting} />
            </Box>
            <span>CAD Drawing</span>
          </Stack>
        }
        subtitle="Select a project to view details and submit CAD drawings"
        actions={
          canManageCad ? (
            <Button startIcon={<SettingsIcon />} variant="outlined" onClick={() => setManageDivisionsOpen(true)}>
              Manage Divisions
            </Button>
          ) : null
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1.75 }}
      >
        <TextField
          size="small"
          placeholder="Search projects…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          sx={{
            width: '100%',
            minWidth: { xs: 0, sm: 220 },
            maxWidth: { xs: '100%', sm: 360 },
            flex: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: 'background.default' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', fontWeight: 600, flexShrink: 0 }}>
          {total || 0} projects
        </Typography>
      </Stack>

      {status === 'loading' ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : items.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: '10px',
            bgcolor: '#fff',
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            No projects found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {items.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <ProjectProgressCard project={project} onOpen={handleOpenProject} />
            </Grid>
          ))}
        </Grid>
      )}

      {(total > 0 || status === 'succeeded') && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={1.25}
          sx={{
            mt: 2,
            px: 1.5,
            py: 1.25,
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fff',
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', fontWeight: 600 }}>
            Showing {from}–{to} of {total || 0}
          </Typography>
          <Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="primary" size="small" />
          <TextField
            select
            size="small"
            label="Per page"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      <ProjectCadDrawingDrawer
        open={drawerOpen}
        project={selectedProject}
        loading={detailLoading}
        onClose={handleCloseDrawer}
        canSubmit={canSubmitCad}
        canManage={canManageCad}
      />

      {canManageCad && (
        <ManageDivisionsDialog
          open={manageDivisionsOpen}
          onClose={() => setManageDivisionsOpen(false)}
          onChanged={() => dispatch(fetchDivisions({ pageSize: 100 }))}
        />
      )}
    </>
  );
}
