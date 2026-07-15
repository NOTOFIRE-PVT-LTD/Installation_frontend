import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import MultiVideoDropzone from '../../components/common/FileUpload/MultiVideoDropzone';

export default function DailyReportFormDialog({ open, onClose, onSubmit, submitting, title = 'Add Daily Report Entry' }) {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [comment, setComment] = useState('');
  const [issue, setIssue] = useState('');

  useEffect(() => {
    if (open) {
      setPhotos([]);
      setVideos([]);
      setComment('');
      setIssue('');
    }
  }, [open]);

  const handleSubmit = () => {
    const formData = new FormData();
    photos.filter((p) => p.file).forEach((p) => formData.append('photos', p.file));
    videos.filter((v) => v.file).forEach((v) => formData.append('videos', v.file));
    formData.append('comment', comment);
    formData.append('issue', issue);
    onSubmit(formData);
  };

  const hasMedia = photos.some((p) => p.file) || videos.some((v) => v.file);
  const canSave = hasMedia || Boolean(comment.trim()) || Boolean(issue.trim());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <ImageDropzone label="Daily Photos" value={photos} onChange={setPhotos} />
          <MultiVideoDropzone label="Daily Videos" value={videos} onChange={setVideos} />
          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label="Issue (optional)"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !canSave}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
