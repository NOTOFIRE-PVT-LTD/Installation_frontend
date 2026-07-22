import { useCallback, useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { tenderApi } from '../../api/tenderApi';
import { formatDate } from '../../utils/formatters';
import { projectProgress } from '../../utils/projectFlow';
import TenderAccordion from '../../components/cadDrawing/TenderAccordion';
import TenderFormDrawer from './TenderFormDrawer';
import TenderDetailDrawer from './TenderDetailDrawer';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { deleteTender } from '../../features/tenders/tendersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function ProjectCadDrawingDrawer({
  open,
  project,
  loading = false,
  onClose,
  canSubmit = false,
  canManage = false,
}) {
  const dispatch = useAppDispatch();
  const [tenders, setTenders] = useState([]);
  const [tendersLoading, setTendersLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenderId, setEditingTenderId] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadTenders = useCallback(() => {
    if (!project?._id) return;
    setTendersLoading(true);
    tenderApi
      .list({ project: project._id, pageSize: 50 })
      .then(({ data }) => setTenders(data.data || []))
      .catch(() => setTenders([]))
      .finally(() => setTendersLoading(false));
  }, [project?._id]);

  useEffect(() => {
    if (open && project?._id) loadTenders();
  }, [open, project?._id, loadTenders]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteTender(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'CAD drawing deleted' }));
      setConfirmDelete(null);
      setSelectedTender(null);
      loadTenders();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete CAD drawing', severity: 'error' }));
    }
  };

  const { pct, commissioned, total } = project ? projectProgress(project) : { pct: 0, commissioned: 0, total: 0 };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: { xs: '100vw', sm: 560, md: 640 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
            <Box sx={{ minWidth: 0, pr: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {project?.projectName || 'Project'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CAD drawings for this project
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Stack alignItems="center" sx={{ mt: 6 }}>
                <CircularProgress />
              </Stack>
            ) : !project ? (
              <Typography color="text.secondary">Project not found.</Typography>
            ) : (
              <Stack spacing={3}>
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Project details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Project Name" value={project.projectName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Panel Serial No." value={project.panelSerialNo} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="LOA No." value={project.loaNo} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Railway Zone" value={project.railwayZone} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Installer" value={project.installerName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Contractor" value={project.contractor} />
                    </Grid>
                    <Grid item xs={12}>
                      <DetailItem label="Work Name" value={project.workName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem
                        label="Installation Period"
                        value={
                          [project.installationStartDate, project.installationEndDate]
                            .filter(Boolean)
                            .map((d) => formatDate(d))
                            .join(' → ') || '—'
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Target Date" value={project.targetDate ? formatDate(project.targetDate) : '—'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem label="Progress" value={`${pct}% · ${commissioned}/${total} stations commissioned`} />
                    </Grid>
                  </Grid>
                </Paper>

                <Box>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        CAD drawings ({tenders.length})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Submit zone/division drawings linked to this project
                      </Typography>
                    </Box>
                    {canSubmit && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setEditingTenderId(null);
                          setFormOpen(true);
                        }}
                        sx={{ flexShrink: 0 }}
                      >
                        Submit CAD Drawing
                      </Button>
                    )}
                  </Stack>

                  {tendersLoading ? (
                    <Stack alignItems="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </Stack>
                  ) : tenders.length === 0 ? (
                    <Paper sx={{ p: 2.5, border: '1px dashed', borderColor: 'divider', bgcolor: '#fafafa' }}>
                      <Typography variant="body2" color="text.secondary">
                        No CAD drawings submitted for this project yet.
                        {canSubmit ? ' Click "Submit CAD Drawing" to upload files.' : ''}
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1}>
                      {tenders.map((tender) => (
                        <Box key={tender._id}>
                          <TenderAccordion tender={tender} onSelect={canManage ? setSelectedTender : undefined} />
                          {canManage && (
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 1, pl: 0.5 }}>
                              <Button
                                size="small"
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => {
                                  setEditingTenderId(tender._id);
                                  setFormOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon fontSize="small" />}
                                onClick={() => setConfirmDelete(tender)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>

      <TenderFormDrawer
        open={formOpen}
        tenderId={editingTenderId}
        defaultProjectId={project?._id}
        defaultProjectName={project?.projectName}
        lockProject
        createTitle="Submit CAD Drawing"
        onClose={() => {
          setFormOpen(false);
          setEditingTenderId(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditingTenderId(null);
          loadTenders();
        }}
      />

      <TenderDetailDrawer
        open={Boolean(selectedTender)}
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
        canEdit={canManage}
        onEdit={(tender) => {
          setSelectedTender(null);
          setEditingTenderId(tender._id);
          setFormOpen(true);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete CAD Drawing"
        message={`Delete "${confirmDelete?.tenderName}" and all attached files?`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
