import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';

import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDateTime } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import { STATUS_CONFIG } from '../complaints/complaintUtils';
import { buildTicketStatusLogs } from './ticketAudit';

const cardSx = {
  p: 1.75,
  borderRadius: '14px',
  border: '1px solid #E2D3BE',
  background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 100%)',
  cursor: 'pointer',
  '&:hover': { borderColor: '#D4A34E', boxShadow: '0 8px 20px rgba(88, 55, 20, 0.12)' },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;
  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 22,
      }}
    />
  );
}

function EmptyState({ text }) {
  return (
    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: '14px', borderColor: '#E2D3BE' }}>
      <Typography sx={{ fontWeight: 700, color: '#3A230B' }}>{text}</Typography>
    </Paper>
  );
}

export default function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const [view, setView] = useState(isAdmin ? 'people' : 'tickets');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [logs, setLogs] = useState([]);

  const loadPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintApi.assignees();
      setPeople(res.data?.data || []);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load people'), severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const loadTickets = useCallback(
    async (person) => {
      setLoading(true);
      try {
        const params = { page: 1, pageSize: 100, sortField: 'createdAt', sortOrder: 'desc' };
        if (person?._id || person?.id) params.assignedTo = person._id || person.id;
        const res = await complaintApi.list(params);
        setTickets(res.data?.data || []);
      } catch (err) {
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load tickets'), severity: 'error' }));
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const openTicketLogs = useCallback(
    async (ticket, person) => {
      setLoading(true);
      setSelectedTicket(ticket);
      setView('logs');
      try {
        const res = await complaintApi.getById(ticket._id || ticket.ticketNo);
        const detail = res.data?.data || ticket;
        setSelectedTicket(detail);
        setLogs(buildTicketStatusLogs(detail, isAdmin ? person : null));
      } catch (err) {
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load ticket logs'), severity: 'error' }));
        setLogs(buildTicketStatusLogs(ticket, isAdmin ? person : null));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, isAdmin]
  );

  useEffect(() => {
    if (isAdmin) {
      loadPeople();
    } else {
      loadTickets(null);
    }
  }, [isAdmin, loadPeople, loadTickets]);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => `${p.name} ${p.email || ''}`.toLowerCase().includes(q));
  }, [people, search]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) =>
      `${t.ticketNo} ${t.customerName || ''} ${t.subject || ''} ${t.status || ''}`.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  const goPeople = () => {
    setView('people');
    setSelectedPerson(null);
    setSelectedTicket(null);
    setLogs([]);
    setSearch('');
  };

  const goTickets = (person) => {
    setSelectedPerson(person || null);
    setSelectedTicket(null);
    setLogs([]);
    setSearch('');
    setView('tickets');
    loadTickets(person || null);
  };

  const title =
    view === 'people'
      ? 'Audit Logs'
      : view === 'tickets'
        ? selectedPerson
          ? `${selectedPerson.name}'s tickets`
          : 'My tickets'
        : selectedTicket?.ticketNo || 'Ticket log';

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, minWidth: 0 }}>
        {view !== (isAdmin ? 'people' : 'tickets') && (
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              if (view === 'logs') goTickets(selectedPerson);
              else goPeople();
            }}
            sx={{ textTransform: 'none', color: '#583714', fontWeight: 700, flexShrink: 0 }}
          >
            Back
          </Button>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>{title}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'primary.dark', display: { xs: 'none', md: 'block' } }}>
            {view === 'people' && 'Open a person to see tickets assigned to them.'}
            {view === 'tickets' && 'Open a ticket to see when it moved to in progress, pending, or resolved.'}
            {view === 'logs' &&
              (isAdmin && selectedPerson
                ? `Status changes made by ${selectedPerson.name} on this ticket.`
                : 'When this ticket was assigned, in progress, pending, and resolved.')}
          </Typography>
        </Box>
      </Stack>

      {view !== 'logs' && (
        <TextField
          size="small"
          placeholder={view === 'people' ? 'Search people' : 'Search tickets'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: { xs: '100%', sm: 320 }, bgcolor: '#fff' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} sx={{ color: '#C99846' }} />
        </Box>
      ) : view === 'people' ? (
        filteredPeople.length === 0 ? (
          <EmptyState text="No people with complaint access yet." />
        ) : (
          <Stack spacing={1}>
            {filteredPeople.map((person) => (
              <Paper
                key={String(person._id || person.id)}
                elevation={0}
                sx={cardSx}
                onClick={() => goTickets(person)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#D4A34E', color: '#3A230B', fontWeight: 800 }}>
                    {person.name?.[0]?.toUpperCase() || <PersonOutlineIcon />}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#241404' }} noWrap>
                      {person.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7C6752' }} noWrap display="block">
                      {person.email || person.jobRole || 'Field Engineer'}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: '#8C5E28' }} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )
      ) : view === 'tickets' ? (
        filteredTickets.length === 0 ? (
          <EmptyState text={selectedPerson ? `No tickets assigned to ${selectedPerson.name}.` : 'No tickets assigned to you.'} />
        ) : (
          <Stack spacing={1}>
            {filteredTickets.map((ticket) => (
              <Paper
                key={ticket._id}
                elevation={0}
                sx={cardSx}
                onClick={() => openTicketLogs(ticket, selectedPerson)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(212, 163, 78, 0.2)', color: '#4A2E0F' }}>
                    <ConfirmationNumberOutlinedIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#241404' }} noWrap>
                        {ticket.ticketNo}
                      </Typography>
                      <StatusChip status={ticket.status} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#7C6752' }} noWrap display="block">
                      {ticket.customerName || 'Customer'} • {ticket.subject || ticket.productName || ticket.product || 'Ticket'}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: '#8C5E28' }} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )
      ) : logs.length === 0 ? (
        <EmptyState
          text={
            isAdmin && selectedPerson
              ? `${selectedPerson.name} has no in-progress, pending, or resolved changes on this ticket.`
              : 'No status history on this ticket yet.'
          }
        />
      ) : (
        <Paper
          elevation={0}
          sx={{ p: 2.25, borderRadius: '16px', border: '1px solid #E2D3BE', bgcolor: '#FFFFFF' }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <HistoryEduOutlinedIcon sx={{ color: '#8C5E28' }} />
            <Typography sx={{ fontWeight: 800, color: '#3A230B' }}>
              {selectedTicket?.ticketNo} status log
            </Typography>
          </Stack>
          <Stack spacing={2}>
            {logs.map((entry) => (
              <Stack direction="row" spacing={1.5} key={entry.key} alignItems="flex-start">
                <Box
                  sx={{
                    mt: 0.5,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#D4A34E',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {entry.from ? <StatusChip status={entry.from} /> : null}
                    {entry.from && entry.to ? (
                      <Typography variant="caption" sx={{ color: '#7C6752', fontWeight: 700 }}>
                        →
                      </Typography>
                    ) : null}
                    {entry.to ? <StatusChip status={entry.to} /> : null}
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', fontWeight: 700, color: '#241404' }}>
                    {entry.reason || `Moved to ${entry.to || 'updated'}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7C6752' }}>
                    By {entry.by} • {formatDateTime(entry.at)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
