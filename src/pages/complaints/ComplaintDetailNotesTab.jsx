import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';
import { formatDateTime } from '../../utils/formatters';

export default function ComplaintDetailNotesTab({
  comments = [],
  noteContent,
  setNoteContent,
  noteIsPublic,
  setNoteIsPublic,
  onAddComment,
  submitting,
}) {
  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 1.5 }}>Add Note or Update</Typography>
        <TextField fullWidth multiline minRows={2} size="small" placeholder="Add an internal note or customer-visible update..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
          <FormControlLabel control={<Switch checked={noteIsPublic} onChange={(e) => setNoteIsPublic(e.target.checked)} size="small" />} label={<Typography variant="caption" fontWeight={600}>Visible to customer on portal</Typography>} />
          <Button variant="contained" size="small" endIcon={<SendIcon />} onClick={onAddComment} disabled={submitting || !noteContent.trim()} sx={{ background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)', color: '#3A230B', fontWeight: 800, textTransform: 'none' }}>
            Post Note
          </Button>
        </Stack>
      </Paper>

      {comments.map((c, i) => (
        <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={800}>{c.authorName || 'Staff'}</Typography>
              <Chip size="small" label={c.visibility === 'CUSTOMER_VISIBLE' ? 'Public' : 'Internal'} sx={{ fontSize: '0.65rem', height: 20, bgcolor: c.visibility === 'CUSTOMER_VISIBLE' ? '#e0f2fe' : '#f1f5f9', color: c.visibility === 'CUSTOMER_VISIBLE' ? '#0369a1' : '#475569' }} />
            </Stack>
            <Typography variant="caption" color="text.secondary">{formatDateTime(c.createdAt)}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
        </Paper>
      ))}
    </Stack>
  );
}

