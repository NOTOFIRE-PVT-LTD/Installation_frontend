import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { WARRANTY_CONFIG } from './complaintUtils';

export default function ComplaintDetailOverview({
  formData,
  handleChange,
  complaint,
  onPhotoUpload,
}) {
  const warranty = WARRANTY_CONFIG[complaint?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;
  const photos = formData?.photos || complaint?.photos || [];

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', mb: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonOutlineIcon sx={{ color: '#8C5E28', fontSize: 20 }} /> Customer & Equipment Info
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Customer Name" value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Contact Mobile" value={formData.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="WhatsApp Number" value={formData.whatsappNumber} onChange={(e) => handleChange('whatsappNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Customer Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Organization / Railway" value={formData.customerOrganization} onChange={(e) => handleChange('customerOrganization', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Site / Station Location" value={formData.customerLocation} onChange={(e) => handleChange('customerLocation', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Equipment / Product Name" value={formData.productName} onChange={(e) => handleChange('productName', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Serial / Panel No" value={formData.productSerialNumber} onChange={(e) => handleChange('productSerialNumber', e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#583714', textTransform: 'uppercase' }}>
              Warranty Evaluation:
            </Typography>
            <Chip size="small" label={warranty.label} sx={{ bgcolor: warranty.bg, color: warranty.color, border: `1px solid ${warranty.border}`, fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mt: 1, pt: 1.5, borderTop: '1px dashed #E2D3BE' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#583714', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachFileOutlinedIcon sx={{ fontSize: 16 }} /> Attached Photos / Evidence ({photos.length})
              </Typography>
              <ButtonBase
                component="label"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '999px',
                  bgcolor: '#FAE2B4',
                  border: '1px solid #D4A34E',
                  color: '#3A230B',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { bgcolor: '#F5D59A' },
                }}
              >
                <input type="file" accept="image/*" multiple hidden onChange={onPhotoUpload} />
                <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 14 }} /> + Add Photo
              </ButtonBase>
            </Box>
            {photos.length > 0 ? (
              <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1 }}>
                {photos.map((p, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Click to open full picture"
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1.5px solid #D4A34E',
                      display: 'block',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Box component="img" src={p.url} alt={`photo-${i}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" sx={{ color: '#8C5E28', fontStyle: 'italic', display: 'block' }}>
                No photos attached yet. Click "+ Add Photo" to attach photos.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

