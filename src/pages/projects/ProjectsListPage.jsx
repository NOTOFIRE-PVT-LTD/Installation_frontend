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
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProjectProgressCard from '../../components/projects/ProjectProgressCard';
import ProjectDrawer from './ProjectDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { usePermission } from '../../hooks/usePermission';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchProjects, fetchProjectById, deleteProject } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

const PAGE_SIZE_OPTIONS = [6, 9, 12, 24];

export default function ProjectsListPage() {
  const dispatch = useAppDispatch();
  const canManage = usePermission('projects');
  const { items, total, status } = useAppSelector((state) => state.projects);
  const { page, pageSize, search, setPage, setPageSize, setSearch, queryParams } = useTableQueryParams({
    defaultPageSize: 6,
  });

  const [localSearch, setLocalSearch] = useState(search || '');
  const debouncedSearch = useDebounce(localSearch, 400);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProject, setDrawerProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const refresh = () => dispatch(fetchProjects(queryParams));
  const pageCount = Math.max(1, Math.ceil((total || 0) / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total || 0);

  const handleAdd = () => {
    setDrawerProject(null);
    setDetailLoading(false);
    setDrawerOpen(true);
  };

  const handleOpen = async (project) => {
    const id = project._id || project.projectId;
    setDrawerOpen(true);
    setDrawerProject(null);
    setDetailLoading(true);
    try {
      const full = await dispatch(fetchProjectById(id)).unwrap();
      setDrawerProject(full);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to load project', severity: 'error' }));
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerProject(null);
    setDetailLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete?._id) return;
    setDeleting(true);
    try {
      await dispatch(deleteProject(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Project deleted' }));
      setConfirmDelete(null);
      if (drawerProject?._id === confirmDelete._id) handleCloseDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete project', severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'rgba(229, 184, 92, 0.22)', color: '#543310', border: '1px solid rgba(212, 163, 78, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faFolderOpen} />
            </Box>
            <span>Projects</span>
          </Stack>
        }
        subtitle="Track installation progress, stations, and claims"
        actions={
          canManage ? (
            <Button
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              variant="contained"
              onClick={handleAdd}
              sx={{
                background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) !important',
                color: '#241404 !important',
                borderRadius: 999,
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(32, 18, 4, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFF3BD 0%, #E5B85C 30%, #A37836 70%, #583714 100%) !important',
                  boxShadow: '0 6px 18px rgba(32, 18, 4, 0.4)',
                },
              }}
            >
              Add Project
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
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              bgcolor: 'background.default',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1 },
            },
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
            borderRadius: '8px',
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
              <ProjectProgressCard
                project={project}
                onOpen={handleOpen}
                onDelete={canManage ? setConfirmDelete : undefined}
              />
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
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fff',
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', fontWeight: 600 }}>
            Showing {from}–{to} of {total || 0}
          </Typography>

          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
                fontSize: '0.75rem',
                minWidth: 28,
                height: 28,
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Per page"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            sx={{
              minWidth: 110,
              '& .MuiInputBase-root': { fontSize: '0.75rem', borderRadius: '8px' },
              '& .MuiInputLabel-root': { fontSize: '0.75rem' },
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size} sx={{ fontSize: '0.75rem' }}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      <ProjectDrawer
        open={drawerOpen}
        project={drawerProject}
        loading={detailLoading}
        onClose={handleCloseDrawer}
        onProjectSaved={(saved) => {
          refresh();
          setDrawerProject(saved);
          setDetailLoading(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Project"
        message={`Delete "${confirmDelete?.projectName || 'this project'}"? Stations, reports, and related files will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(null);
        }}
      />
    </Box>
  );
}
