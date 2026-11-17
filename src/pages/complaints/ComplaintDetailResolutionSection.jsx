import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { CATEGORY_OPTIONS } from './complaintUtils';

export default function ComplaintDetailResolutionSection({
  formData,
  handleChange,
  complaint,
}) {
  const photos = complaint?.photos || [];

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', mb: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionOutlinedIcon sx={{ color: '#8C5E28', fontSize: 20 }} /> Issue Description & Resolution
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth size="small" label="Category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
            {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Subject" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline minRows={3} size="small" label="Problem Description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline minRows={3} size="small" label="Resolution Notes / Action Taken" placeholder="Mandatory before closing or resolving ticket" value={formData.resolutionNotes} onChange={(e) => handleChange('resolutionNotes', e.target.value)} />
        </Grid>
        {photos.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#583714', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <AttachFileOutlinedIcon sx={{ fontSize: 16 }} /> Attached Photos ({photos.length})
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {photos.map((p, i) => (
                <Box key={i} component="a" href={p.url} target="_blank" rel="noreferrer" sx={{ width: 72, height: 72, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2D3BE' }}>
                  <Box component="img" src={p.url} alt={`photo-${i}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

