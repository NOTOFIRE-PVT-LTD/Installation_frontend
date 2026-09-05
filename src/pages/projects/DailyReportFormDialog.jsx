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
import MultiVideoDropzone from '../../components/common/FileUpload/MultiVideoDropzone';
import { uploadDailyReportMedia } from '../../utils/cloudinaryUpload';

export default function DailyReportFormDialog({ open, onClose, onSubmit, submitting, title = 'Add Daily Report Entry' }) {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [comment, setComment] = useState('');
  const [issue, setIssue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (open) {
      setPhotos([]);
      setVideos([]);
      setComment('');
      setIssue('');
      setUploading(false);
      setProgress(0);
      setUploadError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setUploadError('');
    setUploading(true);
    setProgress(0);
    try {
      const media = await uploadDailyReportMedia({
        photos,
        videos,
        onProgress: setProgress,
      });
      await onSubmit({
        photos: media.photos,
        videos: media.videos,
        comment,
        issue,
      });
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const hasMedia = photos.some((p) => p.file) || videos.some((v) => v.file);
  const canSave = hasMedia || Boolean(comment.trim()) || Boolean(issue.trim());
  const busy = submitting || uploading;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
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
            disabled={busy}
          />
          <TextField
            label="Issue (optional)"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            disabled={busy}
          />
          {uploading && (
            <Stack spacing={0.75}>
              <Typography variant="caption" color="text.secondary">
                Uploading media to cloud… {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Stack>
          )}
          {uploadError && (
            <Typography variant="body2" color="error">
              {uploadError}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy || !canSave}>
          {uploading ? 'Uploading…' : submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
