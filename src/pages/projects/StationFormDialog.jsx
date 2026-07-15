import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';

export default function StationFormDialog({ open, mode = 'create', station, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState('');
  const [completePhotos, setCompletePhotos] = useState([]);
  const [remainingPhotos, setRemainingPhotos] = useState([]);
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(station?.name || '');
      setCompletePhotos(station?.completePhotos || []);
      setRemainingPhotos(station?.remainingPhotos || []);
      setInitialPhotos([...(station?.completePhotos || []), ...(station?.remainingPhotos || [])]);
      setError('');
    }
  }, [open, station]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Station name is required');
      return;
    }
    const formData = new FormData();
    formData.append('name', name.trim());

    completePhotos.filter((p) => p.file).forEach((p) => formData.append('completePhotos', p.file));
    remainingPhotos.filter((p) => p.file).forEach((p) => formData.append('remainingPhotos', p.file));

    if (isEdit) {
      const remaining = [...completePhotos, ...remainingPhotos];
      const removedIds = initialPhotos
        .filter((p) => !remaining.some((c) => c.publicId === p.publicId))
        .map((p) => p.publicId);
      formData.append('removePhotoIds', JSON.stringify(removedIds));
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          <ImageDropzone label="Complete Photos" value={completePhotos} onChange={setCompletePhotos} />
          <ImageDropzone label="Remaining Photos" value={remainingPhotos} onChange={setRemainingPhotos} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
