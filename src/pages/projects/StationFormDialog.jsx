import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import { uploadFilesToCloudinary } from '../../utils/cloudinaryUpload';

export default function StationFormDialog({ open, mode = 'create', station, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState('');
  const [installationAmount, setInstallationAmount] = useState('');
  const [completePhotos, setCompletePhotos] = useState([]);
  const [remainingPhotos, setRemainingPhotos] = useState([]);
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setName(station?.name || '');
      setInstallationAmount(station?.installationAmount ?? '');
      setCompletePhotos(station?.completePhotos || []);
      setRemainingPhotos(station?.remainingPhotos || []);
      setInitialPhotos([...(station?.completePhotos || []), ...(station?.remainingPhotos || [])]);
      setError('');
      setUploading(false);
      setProgress(0);
    }
  }, [open, station]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Station name is required');
      return;
    }
    const completeFiles = completePhotos.filter((p) => p.file).map((p) => p.file);
    const remainingFiles = remainingPhotos.filter((p) => p.file).map((p) => p.file);
    const totalFiles = completeFiles.length + remainingFiles.length;
    setUploading(true);
    setProgress(0);

    try {
      let uploadedCount = 0;
      const uploadGroup = async (files) => {
        const uploaded = await uploadFilesToCloudinary(files, 'image', (fileProgress) => {
          setProgress(Math.round(((uploadedCount + fileProgress / 100) / Math.max(totalFiles, 1)) * 100));
        });
        uploadedCount += files.length;
        setProgress(Math.round((uploadedCount / Math.max(totalFiles, 1)) * 100));
        return uploaded;
      };

      const uploadedCompletePhotos = await uploadGroup(completeFiles);
      const uploadedRemainingPhotos = await uploadGroup(remainingFiles);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('installationAmount', installationAmount === '' ? 0 : installationAmount);
      if (uploadedCompletePhotos.length) formData.append('directCompletePhotos', JSON.stringify(uploadedCompletePhotos));
      if (uploadedRemainingPhotos.length) formData.append('directRemainingPhotos', JSON.stringify(uploadedRemainingPhotos));

      if (isEdit) {
        const remaining = [...completePhotos, ...remainingPhotos];
        const removedIds = initialPhotos
          .filter((p) => !remaining.some((c) => c.publicId === p.publicId))
          .map((p) => p.publicId);
        formData.append('removePhotoIds', JSON.stringify(removedIds));
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err?.message || 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const busy = submitting || uploading;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Station' : 'Add Station'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Station Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            autoFocus
            fullWidth
          />
          <TextField
            label="Installation Amount Allocated (₹)"
            type="number"
            value={installationAmount}
            onChange={(e) => setInstallationAmount(e.target.value)}
            inputProps={{ min: 0, step: 'any' }}
            fullWidth
          />
          <ImageDropzone label="Complete Photos" value={completePhotos} onChange={setCompletePhotos} />
          <ImageDropzone label="Remaining Photos" value={remainingPhotos} onChange={setRemainingPhotos} />
          {uploading && (
            <Stack spacing={0.75}>
              <Typography variant="caption" color="text.secondary">
                Uploading photos to cloud… {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
