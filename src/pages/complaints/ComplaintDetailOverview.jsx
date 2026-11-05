import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import { WARRANTY_CONFIG } from './complaintUtils';

export default function ComplaintDetailOverview({
  formData,
  handleChange,
  complaint,
}) {
  const warranty = WARRANTY_CONFIG[complaint?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;

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
      </Grid>
    </Paper>
  );
}
