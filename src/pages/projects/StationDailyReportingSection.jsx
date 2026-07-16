import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import VideoFileIcon from '@mui/icons-material/VideoFileOutlined';
import { useAppDispatch } from '../../app/hooks';
import { addStationDailyReport, removeStationDailyReport } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDate } from '../../utils/formatters';
import DailyReportFormDialog from './DailyReportFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function StationDailyReportingSection({ projectId, station, canManage, onUpdated }) {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const updated = await dispatch(
        addStationDailyReport({ id: projectId, stationId: station._id, formData })
      ).unwrap();
      dispatch(showSnackbar({ message: 'Daily station report added' }));
      onUpdated?.(updated);
      setDialogOpen(false);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to add daily report', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const updated = await dispatch(
        removeStationDailyReport({ id: projectId, stationId: station._id, reportId: confirmDelete._id })
      ).unwrap();
      dispatch(showSnackbar({ message: 'Daily report deleted' }));
      onUpdated?.(updated);
      setConfirmDelete(null);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete daily report', severity: 'error' }));
    }
  };

  const entries = [...(station.dailyReports || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Daily Photos & Videos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload daily progress photos and videos for this station
          </Typography>
        </Box>
        {canManage && (
          <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Entry
          </Button>
        )}
      </Stack>

      {entries.length > 0 ? (
        <Grid container spacing={1.5}>
          {entries.map((entry) => (
            <Grid item xs={12} sm={6} key={entry._id}>
              <Stack spacing={1} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(entry.createdAt)}
                  </Typography>
                  {canManage && (
                    <IconButton size="small" onClick={() => setConfirmDelete(entry)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                </Stack>

                {entry.photos?.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {entry.photos.map((photo) => (
                      <Box
                        key={photo.publicId}
                        component="a"
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box component="img" src={photo.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Stack>
                )}

                {entry.videos?.length > 0 && (
                  <Stack spacing={0.5}>
                    {entry.videos.map((video, index) => (
                      <Stack
                        key={video.publicId}
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        component="a"
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        <VideoFileIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">Video {index + 1}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}

                {entry.comment && <Typography variant="body2">{entry.comment}</Typography>}
                {entry.issue && (
                  <Typography variant="body2" color="error.main">
                    Issue: {entry.issue}
                  </Typography>
                )}
              </Stack>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No daily photos or videos uploaded yet
        </Typography>
      )}

      <DailyReportFormDialog
        open={dialogOpen}
        submitting={submitting}
        title="Add Station Daily Photos & Videos"
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Daily Entry"
        message="Are you sure you want to delete this daily report entry? This cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </Paper>
  );
}
