import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { WARRANTY_CONFIG } from './complaintUtils';
import { formatDate } from '../../utils/formatters';

function InfoField({ label, value, mono = false }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.6875rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: '#241404', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function ComplaintDetailOverviewTab({ ticket }) {
  const warranty = WARRANTY_CONFIG[ticket?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;
  const photos = ticket?.photos || [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', height: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 2 }}>Customer & Site Information</Typography>
          <InfoField label="Customer Contact" value={ticket?.customerName} />
          <InfoField label="Phone / Mobile" value={ticket?.contactNumber} />
          <InfoField label="WhatsApp Number" value={ticket?.whatsappNumber} />
          <InfoField label="Email Address" value={ticket?.email} />
          <InfoField label="Organization" value={ticket?.customerOrganization || ticket?.companyName} />
          <InfoField label="Site / Station" value={ticket?.siteName || ticket?.customerLocation} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', height: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 2 }}>Equipment & Warranty</Typography>
          <InfoField label="Equipment Name" value={ticket?.productName || ticket?.product} />
          <InfoField label="Model / Sub-system" value={ticket?.productModel} />
          <InfoField label="Serial Number" value={ticket?.productSerialNumber} mono />
          <InfoField label="Dispatch Date" value={formatDate(ticket?.dispatchDate)} />
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.6875rem' }}>Warranty Status</Typography>
            <Box sx={{ mt: 0.5 }}><Chip size="small" label={warranty.label} sx={{ bgcolor: warranty.bg, color: warranty.color, border: `1px solid ${warranty.border}`, fontWeight: 700 }} /></Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 1 }}>Fault & Problem Summary</Typography>
          <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a', mb: 1 }}>{ticket?.subject}</Typography>
          <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{ticket?.description}</Typography>
          {photos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#583714', textTransform: 'uppercase' }}>Attached Photos ({photos.length})</Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} flexWrap="wrap">
                {photos.map((p, i) => (
                  <Box key={i} component="a" href={p.url} target="_blank" rel="noreferrer" sx={{ width: 80, height: 80, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2D3BE' }}>
                    <Box component="img" src={p.url} alt={`photo-${i}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
