import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import { useAppDispatch } from '../../app/hooks';
import { addStation, updateStation, removeStation } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import StationReportDownloadMenu from '../../components/projects/StationReportDownloadMenu';
import StationFormDialog from './StationFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Tooltip from '@mui/material/Tooltip';

function PhotoThumb({ photo }) {
  return (
    <Box
      component="a"
      href={photo.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
    >
      <Box component="img" src={photo.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </Box>
  );
}

export default function ProjectStationsTab({ project, canManage, onProjectUpdated }) {
  const dispatch = useAppDispatch();
  const [dialogState, setDialogState] = useState({ open: false, mode: 'create', station: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      let updated;
      if (dialogState.mode === 'create') {
        updated = await dispatch(addStation({ id: project._id, formData })).unwrap();
        dispatch(showSnackbar({ message: 'Station added successfully' }));
      } else {
        updated = await dispatch(updateStation({ id: project._id, stationId: dialogState.station._id, formData })).unwrap();
        dispatch(showSnackbar({ message: 'Station updated successfully' }));
      }
      onProjectUpdated?.(updated);
      setDialogState({ open: false, mode: 'create', station: null });
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save station', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const updated = await dispatch(removeStation({ id: project._id, stationId: confirmDelete._id })).unwrap();
      dispatch(showSnackbar({ message: 'Station deleted' }));
      onProjectUpdated?.(updated);
      setConfirmDelete(null);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete station', severity: 'error' }));
    }
  };

  const stations = project.stations || [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Stations
        </Typography>
        <Stack direction="row" spacing={1}>
          <StationReportDownloadMenu project={project} />
          {canManage && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogState({ open: true, mode: 'create', station: null })}>
              Add Station
            </Button>
          )}
        </Stack>
      </Stack>

      {stations.length > 0 ? (
        <Grid container spacing={1.5}>
          {stations.map((station) => (
            <Grid item xs={12} sm={6} key={station._id}>
              <Stack spacing={1} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" fontWeight={500}>
                    {station.name}
                  </Typography>
                  <Stack direction="row">
                    <Tooltip title="Download this station PDF report">
                      <IconButton size="small" onClick={() => downloadSingleStationReport(project, station)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canManage && (
                      <>
                        <IconButton size="small" onClick={() => setDialogState({ open: true, mode: 'edit', station })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setConfirmDelete(station)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  Complete
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {station.completePhotos?.length > 0 ? (
                    station.completePhotos.map((p) => <PhotoThumb key={p.publicId} photo={p} />)
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      None
                    </Typography>
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {station.remainingPhotos?.length > 0 ? (
                    station.remainingPhotos.map((p) => <PhotoThumb key={p.publicId} photo={p} />)
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      None
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No stations added yet
        </Typography>
      )}

      <StationFormDialog
        open={dialogState.open}
        mode={dialogState.mode}
        station={dialogState.station}
        submitting={submitting}
        onClose={() => setDialogState({ open: false, mode: 'create', station: null })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Station"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </Box>
  );
}
