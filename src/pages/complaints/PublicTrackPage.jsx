import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { complaintApi } from '../../api/complaintApi';
import logo from '../../assets/logo.png';
import TwoButtonPill from '../../components/common/TwoButtonPill';
import PageHeader from '../../components/common/PageHeader';
import TrackTicketSearchCard from './TrackTicketSearchCard';
import TrackTicketDetailCard from './TrackTicketDetailCard';

export default function PublicTrackPage({ embedded = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticket') || searchParams.get('ticketId') || '';
  const [ticketQuery, setTicketQuery] = useState(initialTicket);
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(null);

  const fetchTicket = async (ticketNum, verifyVal) => {
    if (!ticketNum?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.publicTrack({ ticket: ticketNum.trim(), verification: verifyVal?.trim() || undefined });
      setTicketData(res.data?.data || res.data);
    } catch (err) {
      setTicketData(null);
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not find a ticket with that number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket) fetchTicket(initialTicket, '');
  }, [initialTicket]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setSearchParams({ ticket: ticketQuery.trim() });
    fetchTicket(ticketQuery, verification);
  };

  const handleReset = () => {
    setTicketData(null);
    setError(null);
    setSearchParams({});
    setTicketQuery('');
    setVerification('');
  };

  return (
    <Box sx={{ minHeight: embedded ? 'auto' : '100vh', bgcolor: embedded ? 'transparent' : '#f8fafc', py: embedded ? 0 : { xs: 3, md: 6 } }}>
      <Container maxWidth={embedded ? false : 'md'} disableGutters={embedded}>
        {embedded ? (
          <PageHeader title="Track Ticket Status" subtitle="Look up real-time status, timeline, field engineer assignments, and resolution notes" />
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="img" src={logo} alt="Logo" sx={{ height: 40, width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>Service Support</Typography>
                <Typography variant="caption" color="text.secondary">Public Complaint Tracking Portal</Typography>
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

        {!ticketData && (
          <TrackTicketSearchCard
            ticketQuery={ticketQuery}
            setTicketQuery={setTicketQuery}
            verification={verification}
            setVerification={setVerification}
            loading={loading}
            onSubmit={handleSearch}
          />
        )}

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

        {ticketData && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleReset} sx={{ textTransform: 'none', fontWeight: 700, color: '#583714' }}>
                Track another ticket
              </Button>
            </Box>
            <TrackTicketDetailCard ticketData={ticketData} />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
