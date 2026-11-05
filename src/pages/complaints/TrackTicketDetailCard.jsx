import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { STATUS_CONFIG, WARRANTY_CONFIG } from './complaintUtils';

export const TRACKING_STEPS = [
  { label: 'Submitted', key: 'NEW' },
  { label: 'Assigned', key: 'ASSIGNED' },
  { label: 'In Progress / Pending', key: 'IN_PROGRESS' },
  { label: 'Resolved', key: 'RESOLVED' },
];

export function getActiveStep(status) {
  if (!status) return 0;
  if (['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(status)) return TRACKING_STEPS.length;
  if (['IN_PROGRESS', 'PENDING', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_PART', 'RESOLUTION_SUBMITTED', 'In Progress'].includes(status)) return 2;
  if (['ASSIGNED', 'ACKNOWLEDGED'].includes(status)) return 1;
  return 0;
}

export default function TrackTicketDetailCard({ ticketData }) {
  const statusConfig = STATUS_CONFIG[ticketData?.status] || STATUS_CONFIG.NEW;
  const warrantyConfig = WARRANTY_CONFIG[ticketData?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;
  const activeStep = getActiveStep(ticketData?.status);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '16px',
          border: '2px solid transparent',
          background:
            'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%) padding-box, linear-gradient(135deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) border-box',
          boxShadow: '0 8px 30px rgba(56, 32, 10, 0.08), 0 2px 8px rgba(229, 184, 92, 0.12)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                {ticketData.ticketNumber}
              </Typography>
              <Chip size="small" label={statusConfig.label} sx={{ bgcolor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}`, fontWeight: 700, fontSize: '0.75rem' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Logged on {new Date(ticketData.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
            {ticketData.assignedEngineer?.name && (
              <Typography variant="body2" sx={{ color: '#583714', fontWeight: 600, mt: 0.25 }}>
                Assigned to {ticketData.assignedEngineer.name}
              </Typography>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', px: 1.5, py: 0.75, borderRadius: '8px' }}>
            <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
            <Typography variant="caption" fontWeight={600} color="#166534">Strict Privacy Guaranteed</Typography>
          </Stack>
        </Stack>

        <Box sx={{ width: '100%', py: 2, mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {TRACKING_STEPS.map((step) => (
              <Step key={step.key}><StepLabel>{step.label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Customer Details</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', mt: 0.5 }}>{ticketData.customerName}</Typography>
            <Typography variant="body2" color="text.secondary">{ticketData.customerOrganization || 'Organization not specified'}</Typography>
            <Typography variant="body2" color="text.secondary">Phone: {ticketData.customerPhoneMasked}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Equipment & Warranty</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', mt: 0.5 }}>{ticketData.productName || 'Industrial Equipment'}</Typography>
            {ticketData.productSerialNumber && (
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>S/N: {ticketData.productSerialNumber}</Typography>
            )}
            <Box sx={{ mt: 0.75 }}>
              <Chip size="small" label={warrantyConfig.label} sx={{ bgcolor: warrantyConfig.bg, color: warrantyConfig.color, border: `1px solid ${warrantyConfig.border}`, fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5 }}>{ticketData.subject}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{ticketData.description}</Typography>
        </Box>
      </Paper>

      {ticketData.isResolved && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '12px', border: '1px solid #a7f3d0', bgcolor: '#ecfdf5' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <CheckCircleOutlineIcon sx={{ color: '#047857', fontSize: 24 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#065f46' }}>Complaint Marked as Resolved</Typography>
          </Stack>
          {ticketData.resolutionSummary && (
            <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', mt: 1 }}>
              <Typography variant="caption" fontWeight={700} color="#065f46" sx={{ textTransform: 'uppercase' }}>Resolution Summary</Typography>
              <Typography variant="body2" sx={{ color: '#0f172a', mt: 0.5 }}>{ticketData.resolutionSummary}</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Stack>
  );
}
