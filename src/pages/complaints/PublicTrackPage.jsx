import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import SearchIcon from '@mui/icons-material/Search';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { complaintApi } from '../../api/complaintApi';
import { STATUS_CONFIG, WARRANTY_CONFIG } from './complaintUtils';
import logo from '../../assets/logo.png';
import TwoButtonPill from '../../components/common/TwoButtonPill';
import PageHeader from '../../components/common/PageHeader';

const TRACKING_STEPS = [
  { label: 'Submitted', key: 'NEW' },
  { label: 'Assigned', key: 'ASSIGNED' },
  { label: 'In Progress / Pending', key: 'IN_PROGRESS' },
  { label: 'Resolved', key: 'RESOLVED' },
];

function getActiveStep(status) {
  if (!status) return 0;
  // Past the last step so every circle, including Resolved, gets a tick.
  if (['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(status)) return TRACKING_STEPS.length;
  if (['IN_PROGRESS', 'PENDING', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_PART', 'RESOLUTION_SUBMITTED', 'In Progress'].includes(status)) return 2;
  if (['ASSIGNED', 'ACKNOWLEDGED'].includes(status)) return 1;
  return 0;
}

export default function PublicTrackPage({ embedded = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticket') || searchParams.get('ticketId') || '';

  const [ticketQuery, setTicketQuery] = useState(initialTicket);
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(null);

  const fetchTicket = async (ticketNum, verifyVal) => {
    if (!ticketNum || !ticketNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.publicTrack({
        ticket: ticketNum.trim(),
        verification: verifyVal?.trim() || undefined,
      });
      setTicketData(res.data?.data || res.data);
    } catch (err) {
      setTicketData(null);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Could not find a ticket with that number. Please check your Ticket ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket) {
      fetchTicket(initialTicket, '');
    }
  }, [initialTicket]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setSearchParams({ ticket: ticketQuery.trim() });
    fetchTicket(ticketQuery, verification);
  };

  const statusConfig = STATUS_CONFIG[ticketData?.status] || STATUS_CONFIG.NEW;
  const warrantyConfig = WARRANTY_CONFIG[ticketData?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;
  const activeStep = getActiveStep(ticketData?.status);

  return (
    <Box
      sx={{
        minHeight: embedded ? 'auto' : '100vh',
        bgcolor: embedded ? 'transparent' : '#f8fafc',
        py: embedded ? 0 : { xs: 3, md: 6 },
        px: embedded ? 0 : undefined,
      }}
    >
      <Container maxWidth={embedded ? false : 'md'} disableGutters={embedded}>
        {embedded ? (
          <PageHeader
            title="Track Ticket Status"
            subtitle="Look up real-time status, timeline, field engineer assignments, and resolution notes"
          />
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 40, width: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>
                  Service Support
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Public Complaint Tracking Portal
                </Typography>
              </Box>
            </Stack>

            <TwoButtonPill
              value="/support/track"
              options={[
                { label: 'Submit Complaint', value: '/support', icon: <SupportAgentIcon fontSize="small" />, to: '/support' },
                { label: 'Track Status', value: '/support/track', icon: <SearchIcon fontSize="small" />, to: '/support/track' },
              ]}
            />
          </Stack>
        )}

        {/* Search Box — hidden once a ticket is on screen */}
        {!ticketData && (
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '16px',
            border: '2px solid transparent',
            background:
              'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%) padding-box, linear-gradient(135deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) border-box',
            boxShadow: '0 8px 30px rgba(56, 32, 10, 0.08), 0 2px 8px rgba(229, 184, 92, 0.12)',
            mb: 4,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>
            Track Your Complaint Status
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Enter your unique Ticket ID (e.g., <code style={{ color: '#0f766e', fontWeight: 600 }}>CMP-2026-000124</code>) received via SMS or email.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                size="small"
                label="Ticket ID"
                placeholder="e.g. CMP-2026-000124"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value.toUpperCase())}
                required
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="Phone or Email (Optional Verification)"
                placeholder="Last 5 digits or email"
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !ticketQuery.trim()}
                sx={{
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) !important',
                  color: '#241404 !important',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(32, 18, 4, 0.35)',
                  transition: 'all 0.25s ease, transform 0.15s ease',
                  '&:active': { transform: 'scale(0.97)' },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 999,
                    background: 'rgba(255, 233, 151, 0.35)',
                    transform: 'translateY(50%) scale(0)',
                    transformOrigin: 'center bottom',
                    transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                    pointerEvents: 'none',
                    opacity: 0,
                  },
                  '&:hover::after': {
                    transform: 'translateY(0) scaleX(1.4) scaleY(2.2)',
                    opacity: 1,
                  },
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFF3BD 0%, #E5B85C 30%, #A37836 70%, #583714 100%) !important',
                  },
                  textTransform: 'none',
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Check Status'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* Ticket Details View */}
        {ticketData && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => {
                  setTicketData(null);
                  setError(null);
                  setSearchParams({});
                }}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#583714' }}
              >
                Track another ticket
              </Button>
            </Box>
            {/* Main Status Banner */}
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
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {ticketData.ticketNumber}
                    </Typography>
                    <Chip
                      size="small"
                      label={statusConfig.label}
                      sx={{
                        bgcolor: statusConfig.bg,
                        color: statusConfig.color,
                        border: `1px solid ${statusConfig.border}`,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Logged on {new Date(ticketData.createdAt).toLocaleDateString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  {ticketData.assignedEngineer?.name && (
                    <Typography variant="body2" sx={{ color: '#583714', fontWeight: 600, mt: 0.25 }}>
                      Assigned to {ticketData.assignedEngineer.name}
                      {ticketData.assignedEngineer.assignedAt
                        ? ` · ${new Date(ticketData.assignedEngineer.assignedAt).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : ''}
                    </Typography>
                  )}
                </Box>

                {/* Privacy Guarantee Badge */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    bgcolor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                  }}
                >
                  <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <Typography variant="caption" fontWeight={600} color="#166534">
                    Strict Privacy Guaranteed
                  </Typography>
                </Stack>
              </Stack>

              {/* Progress Stepper */}
              <Box sx={{ width: '100%', py: 2, mb: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {TRACKING_STEPS.map((step) => (
                    <Step key={step.key}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Equipment & Customer Summary */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Customer Details
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', mt: 0.5 }}>
                    {ticketData.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticketData.customerOrganization || 'Organization not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {ticketData.customerPhoneMasked}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Equipment & Warranty
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', mt: 0.5 }}>
                    {ticketData.productName || 'Industrial Equipment'}
                  </Typography>
                  {ticketData.productSerialNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      S/N: {ticketData.productSerialNumber}
                    </Typography>
                  )}
                  <Box sx={{ mt: 0.75 }}>
                    <Chip
                      size="small"
                      label={warrantyConfig.label}
                      sx={{
                        bgcolor: warrantyConfig.bg,
                        color: warrantyConfig.color,
                        border: `1px solid ${warrantyConfig.border}`,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Subject & Description */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5 }}>
                  {ticketData.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {ticketData.description}
                </Typography>
              </Box>
            </Paper>

            {/* Resolution Details Card (if resolved) */}
            {ticketData.isResolved && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '12px',
                  border: '1px solid #a7f3d0',
                  bgcolor: '#ecfdf5',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                  <CheckCircleOutlineIcon sx={{ color: '#047857', fontSize: 24 }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#065f46' }}>
                    Complaint Marked as Resolved
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#047857', mb: 1 }}>
                  Resolved on{' '}
                  {ticketData.resolutionDate
                    ? new Date(ticketData.resolutionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Record updated'}
                </Typography>
                {ticketData.resolutionSummary && (
                  <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', mt: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="#065f46" sx={{ textTransform: 'uppercase' }}>
                      Resolution Summary
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0f172a', mt: 0.5 }}>
                      {ticketData.resolutionSummary}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

