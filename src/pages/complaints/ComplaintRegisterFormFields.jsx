import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { MAX_PHOTOS, MAX_PHOTO_MB, PUBLIC_PRIORITIES, categorySelectOptions } from './complaintRegisterSchema';

export default function ComplaintRegisterFormFields({
  onSubmit,
  submitting,
  submitError,
  photos,
  previews,
  photoError,
  onSelectFiles,
  removePhoto,
}) {
  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a' }}>Submit a Service Complaint</Typography>
        <Typography variant="body2" color="text.secondary">Fill out the form below to receive an instant Ticket ID. No account or password required.</Typography>
      </Box>
      <Divider />
      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Contact Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><RHFTextField name="customerName" label="Your Full Name *" autoFocus autoComplete="name" /></Grid>
        <Grid item xs={12} sm={6}><RHFTextField name="contactNumber" label="Phone / Mobile Number *" autoComplete="tel" /></Grid>
        <Grid item xs={12} sm={6}><RHFTextField name="whatsappNumber" label="WhatsApp Number *" autoComplete="tel" helperText="Required — updates are sent on WhatsApp only" /></Grid>
        <Grid item xs={12} sm={6}><RHFTextField name="email" label="Email Address (optional)" type="email" autoComplete="email" /></Grid>
        <Grid item xs={12} sm={6}><RHFTextField name="companyName" label="Company / Railway Division (optional)" autoComplete="organization" /></Grid>
      </Grid>
      <Divider />
      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Site & Equipment Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><RHFTextField name="siteName" label="Site / Station / Plant Name" /></Grid>
        <Grid item xs={12} sm={6}><RHFTextField name="location" label="Location / City / State" /></Grid>
        <Grid item xs={12} sm={4}><RHFTextField name="product" label="Product / Equipment Name" /></Grid>
        <Grid item xs={12} sm={4}><RHFTextField name="productModel" label="Model / Sub-system" /></Grid>
        <Grid item xs={12} sm={4}><RHFTextField name="productSerialNumber" label="Serial Number (for 2-yr Warranty)" placeholder="e.g. SN-88219" /></Grid>
      </Grid>
      <Divider />
      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Complaint Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><RHFSelect name="category" label="Complaint Category *" options={categorySelectOptions} /></Grid>
        <Grid item xs={12} sm={6}><RHFSelect name="priority" label="Urgency / Severity *" options={PUBLIC_PRIORITIES} /></Grid>
        <Grid item xs={12}><RHFTextField name="subject" label="Complaint Subject *" placeholder="Brief summary of fault" /></Grid>
        <Grid item xs={12}><RHFTextField name="description" label="Detailed Description *" placeholder="Describe symptoms, alarms, error codes..." multiline minRows={4} /></Grid>
      </Grid>
      <Divider />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>4. Photos / Evidence (Optional)</Typography>
        <Typography variant="caption" color="text.secondary">Attach up to {MAX_PHOTOS} photos (max {MAX_PHOTO_MB} MB each).</Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap">
          {previews.map((item, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 84, height: 84, borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <Box component="img" src={item.url} alt={`photo-${idx}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton size="small" onClick={() => removePhoto(idx)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }, p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
          {photos.length < MAX_PHOTOS && (
            <Button component="label" variant="outlined" sx={{ width: 84, height: 84, borderRadius: '8px', borderStyle: 'dashed', borderColor: '#cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textTransform: 'none', p: 0 }}>
              <AddPhotoAlternateOutlinedIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Add Photo</Typography>
              <input type="file" accept="image/*" multiple hidden onChange={onSelectFiles} />
            </Button>
          )}
        </Stack>
        {photoError && <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>{photoError}</Typography>}
      </Box>
      {submitError && <Alert severity="error" sx={{ borderRadius: '8px' }}>{submitError}</Alert>}
      <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#0d655e' }, py: 1.25, borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}>
        {submitting ? <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={20} color="inherit" /><span>Submitting...</span></Stack> : 'Submit Service Complaint'}
      </Button>
    </Stack>
  );
}
