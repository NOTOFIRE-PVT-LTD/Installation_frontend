import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import HistoryIcon from '@mui/icons-material/History';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  WARRANTY_CONFIG,
  ALLOWED_TRANSITIONS,
  publicTrackLink,
} from './complaintUtils';
import ComplaintQrDialog from './ComplaintQrDialog';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isSuperAdmin, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [assignees, setAssignees] = useState([]);

  // Modals state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignReason, setAssignReason] = useState('');

  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [workLogForm, setWorkLogForm] = useState({
    workPerformed: '',
    findings: '',
    actionTaken: '',
    partsUsed: '',
    testPerformed: '',
    testResult: '',
    nextAction: '',
    followUpDate: '',
    remarks: '',
  });

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    resolutionReason: '',
    resolutionActionTaken: '',
    resolutionSummary: '',
    resolutionPartsUsed: '',
    resolutionRemarks: '',
  });

  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [qrOpen, setQrOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPublic, setNoteIsPublic] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await complaintApi.getById(id);
      setTicket(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    complaintApi
      .assignees()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAssignees(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      setSavingAction(true);
      await complaintApi.acknowledge(ticket._id || ticket.id);
      dispatch(showSnackbar({ message: 'Complaint acknowledged successfully', severity: 'success' }));
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to acknowledge complaint', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigneeId) return;
    try {
      setSavingAction(true);
      await complaintApi.assign(ticket._id || ticket.id, {
        engineerId: assigneeId,
        reason: assignReason,
      });
      dispatch(showSnackbar({ message: 'Engineer assigned successfully', severity: 'success' }));
      setAssignOpen(false);
      setAssignReason('');
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Assignment failed', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!nextStatus) return;
    if (nextStatus === 'PENDING' && !String(statusReason || '').trim()) {
      dispatch(showSnackbar({ message: 'A remark is required when marking a ticket as Pending.', severity: 'error' }));
      return;
    }
    try {
      setSavingAction(true);
      await complaintApi.updateStatus(ticket._id || ticket.id, {
        nextStatus,
        reason: statusReason,
      });
      dispatch(showSnackbar({ message: `Status updated to ${nextStatus}`, severity: 'success' }));
      setStatusOpen(false);
      setStatusReason('');
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Status update failed', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleWorkLogSubmit = async (e) => {
    e.preventDefault();
    if (!workLogForm.workPerformed.trim()) return;
    try {
      setSavingAction(true);
      await complaintApi.addWorkLog(ticket._id || ticket.id, workLogForm);
      dispatch(showSnackbar({ message: 'Investigation work log recorded', severity: 'success' }));
      setWorkLogOpen(false);
      setWorkLogForm({
        workPerformed: '',
        findings: '',
        actionTaken: '',
        partsUsed: '',
        testPerformed: '',
        testResult: '',
        nextAction: '',
        followUpDate: '',
        remarks: '',
      });
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to save work log', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveForm.resolutionReason || !resolveForm.resolutionActionTaken || !resolveForm.resolutionSummary) {
      dispatch(showSnackbar({ message: 'Root cause, action taken, and resolution summary are required', severity: 'warning' }));
      return;
    }
    try {
      setSavingAction(true);
      await complaintApi.resolve(ticket._id || ticket.id, resolveForm);
      dispatch(showSnackbar({ message: 'Complaint resolved! Customer notification email dispatched.', severity: 'success' }));
      setResolveOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to resolve ticket', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    try {
      setSavingAction(true);
      await complaintApi.reopen(ticket._id || ticket.id, { reason: reopenReason });
      dispatch(showSnackbar({ message: 'Complaint reopened successfully', severity: 'success' }));
      setReopenOpen(false);
      setReopenReason('');
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to reopen ticket', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      setSavingAction(true);
      await complaintApi.addComment(ticket._id || ticket.id, {
        content: noteContent.trim(),
        visibility: noteIsPublic ? 'CUSTOMER_VISIBLE' : 'INTERNAL',
      });
      dispatch(showSnackbar({ message: noteIsPublic ? 'Customer-visible update posted' : 'Internal note saved', severity: 'success' }));
      setNoteContent('');
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to add note', severity: 'error' }));
    } finally {
      setSavingAction(false);
    }
  };

  if (loading && !ticket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2, display: 'inline-flex' }}>
          {error || 'Complaint not found'}
        </Alert>
        <Box>
          <Button component={Link} to="/complaints" variant="outlined">
            Back to Complaints List
          </Button>
        </Box>
      </Box>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.NEW;
  const prioCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
  const warrantyCfg = WARRANTY_CONFIG[ticket.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;
  const allowedTransitions = (ALLOWED_TRANSITIONS[ticket.status] || []).filter((st) =>
    ['IN_PROGRESS', 'PENDING', 'RESOLVED'].includes(st)
  );
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(ticket.status);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Top Breadcrumb & Quick Actions Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          <Button
            component={Link}
            to="/complaints"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Complaints
          </Button>
          <Typography color="text.secondary">/</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a' }}>
            {ticket.ticketNo}
          </Typography>

          {/* Status Pill */}
          <Chip
            size="small"
            label={statusCfg.label}
            sx={{
              bgcolor: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.border}`,
              fontWeight: 700,
            }}
          />

          {/* Priority Chip */}
          <Chip
            size="small"
            label={`Priority: ${prioCfg.label}`}
            sx={{
              bgcolor: prioCfg.bg,
              color: prioCfg.color,
              border: `1px solid ${prioCfg.border}`,
              fontWeight: 600,
            }}
          />

          {/* Warranty Badge */}
          <Chip
            size="small"
            label={warrantyCfg.label}
            sx={{
              bgcolor: warrantyCfg.bg,
              color: warrantyCfg.color,
              border: `1px solid ${warrantyCfg.border}`,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        {/* Action Toolbar */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            onClick={() => setQrOpen(true)}
            startIcon={<QrCode2Icon />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            QR & Tracking Link
          </Button>

          {!ticket.isAcknowledged && (
            <Button
              variant="contained"
              size="small"
              onClick={handleAcknowledge}
              disabled={savingAction}
              startIcon={<CheckCircleOutlineIcon />}
              sx={{
                bgcolor: '#f59e0b',
                '&:hover': { bgcolor: '#d97706' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Acknowledge
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setAssigneeId(ticket.assignedTo?._id || ticket.assignedTo || '');
              setAssignOpen(true);
            }}
            startIcon={<PersonAddAlt1Icon />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            {ticket.assignedTo ? 'Reassign' : 'Assign Engineer'}
          </Button>

          {allowedTransitions.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setNextStatus(allowedTransitions[0]);
                setStatusOpen(true);
              }}
              startIcon={<SwapHorizIcon />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Update Status
            </Button>
          )}

          {!isResolvedOrClosed && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setWorkLogOpen(true)}
                startIcon={<BuildCircleOutlinedIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                + Work Log
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={() => setResolveOpen(true)}
                startIcon={<CheckCircleOutlineIcon />}
                sx={{
                  bgcolor: '#047857',
                  '&:hover': { bgcolor: '#065f46' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Resolve Ticket
              </Button>
            </>
          )}

          {isResolvedOrClosed && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setReopenOpen(true)}
              startIcon={<ReplayIcon />}
              sx={{
                bgcolor: '#7e22ce',
                '&:hover': { bgcolor: '#6b21a8' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Reopen Ticket
            </Button>
          )}
        </Stack>
      </Stack>

      {(isSuperAdmin || isAdmin) && ticket.status === 'PENDING' && ticket.pendingRemark && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: '10px',
            bgcolor: '#FFF7ED',
            border: '1px solid #FDBA74',
            color: '#9A3412',
            '& .MuiAlert-icon': { color: '#C2410C' },
          }}
        >
          <Typography variant="caption" fontWeight={800} display="block">
            Pending remark
            {ticket.pendingRemarkBy ? ` · ${ticket.pendingRemarkBy}` : ''}
            {ticket.pendingRemarkAt
              ? ` · ${new Date(ticket.pendingRemarkAt).toLocaleString('en-IN')}`
              : ''}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {ticket.pendingRemark}
          </Typography>
        </Alert>
      )}

      {/* Grid: Left Column Details & Right Column Tabs */}
      <Grid container spacing={3}>
        {/* Left Column: Customer & Equipment Cards */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            {/* Customer Information Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Customer Information
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Contact Person</Typography>
                  <Typography variant="body2" fontWeight={700} color="#0f172a">{ticket.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body2" fontWeight={600} color="#0f172a">{ticket.contactNumber}</Typography>
                </Box>
                {ticket.email && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                    <Typography variant="body2" color="#0f172a">{ticket.email}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Organization / Company</Typography>
                  <Typography variant="body2" color="#0f172a">
                    {ticket.customerOrganization || ticket.companyName || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Site / Location</Typography>
                  <Typography variant="body2" color="#0f172a">
                    {ticket.customerLocation || ticket.location || ticket.siteName || '-'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Company Ticket History Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  color="#241404"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  Company Complaint History ({ticket.companyHistory?.length || 0})
                </Typography>
                {(ticket.customerOrganization || ticket.companyName) && (
                  <Button
                    component={Link}
                    to={`/complaints?search=${encodeURIComponent(ticket.customerOrganization || ticket.companyName)}`}
                    size="small"
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    View All
                  </Button>
                )}
              </Stack>

              {(!ticket.companyHistory || ticket.companyHistory.length === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  First recorded complaint for this company. All future tickets from this customer will be tracked here.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {ticket.companyHistory.map((past) => (
                    <Box
                      key={past._id}
                      onClick={() => navigate(`/complaints/${past._id}`)}
                      sx={{
                        p: 1.25,
                        borderRadius: '10px',
                        border: '1px solid rgba(212, 163, 78, 0.3)',
                        bgcolor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#D4A34E',
                          boxShadow: '0 2px 8px rgba(88, 55, 20, 0.08)',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={700} color="#85581A">
                          {past.ticketNo}
                        </Typography>
                        <Chip
                          size="small"
                          label={past.status}
                          sx={{
                            height: 20,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            bgcolor: ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(past.status)
                              ? '#ECFDF5'
                              : '#FEF3C7',
                            color: ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(past.status)
                              ? '#059669'
                              : '#B45309',
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.primary" fontWeight={600} noWrap sx={{ display: 'block', mt: 0.25 }}>
                        {past.subject || past.category || 'Complaint'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                        {new Date(past.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Equipment & Warranty Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Equipment & 2-Year Warranty
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Equipment / Product</Typography>
                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                    {ticket.productName || ticket.product || 'Not Specified'}
                  </Typography>
                </Box>
                {ticket.productModel && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Model</Typography>
                    <Typography variant="body2" color="#0f172a">{ticket.productModel}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
                    {ticket.productSerialNumber || 'No serial on file'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Warranty Status</Typography>
                  <Box sx={{ mt: 0.25 }}>
                    <Chip
                      size="small"
                      label={warrantyCfg.label}
                      sx={{
                        bgcolor: warrantyCfg.bg,
                        color: warrantyCfg.color,
                        border: `1px solid ${warrantyCfg.border}`,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
                {ticket.dispatchDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Dispatch Date</Typography>
                    <Typography variant="body2">
                      {new Date(ticket.dispatchDate).toLocaleDateString('en-IN')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Staff Assignment & SLAs Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assignment & SLAs
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#583714', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                    Assigned Engineer
                  </Typography>
                  <Typography variant="body2" fontWeight={800} sx={{ color: ticket.assignedTo ? '#583714' : '#8A3B14', mb: 0.5 }}>
                    {ticket.assignedTo?.name || 'Unassigned (In Queue)'}
                  </Typography>
                  {ticket.assignedTo?.email && (
                    <Typography variant="caption" sx={{ color: '#583714', display: 'block', mb: 1 }}>
                      {ticket.assignedTo.email} {ticket.assignedTo.phone ? `• ${ticket.assignedTo.phone}` : ''}
                    </Typography>
                  )}
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Choose Engineer to Assign"
                    value={ticket.assignedTo?._id || ticket.assignedTo?.id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      setAssigneeId(selectedId);
                      setAssignOpen(true);
                    }}
                    sx={{
                      mt: 0.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        borderColor: '#E2D3BE',
                        '&:hover fieldset': {
                          borderColor: '#D4A34E',
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>{ticket.assignedTo ? 'Select to Reassign...' : 'Select Engineer to Assign...'}</em>
                    </MenuItem>
                    {assignees.map((eng) => (
                      <MenuItem key={eng._id || eng.id} value={eng._id || eng.id}>
                        {eng.name} ({eng.department || eng.jobRole || 'Field Service'})
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Intake Source</Typography>
                  <Typography variant="body2" color="#0f172a">{ticket.source}</Typography>
                </Box>
                {ticket.followUpDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Target Follow-up Date</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1d4ed8">
                      {new Date(ticket.followUpDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}
                {ticket.dueAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">SLA Resolution Target</Typography>
                    <Typography variant="body2" color="#0f172a">
                      {new Date(ticket.dueAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Complaint Subject/Description & Tabs */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            {/* Subject & Description Banner */}
            <Box sx={{ p: { xs: 2.5, md: 3 }, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Category: {ticket.category}
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', mt: 0.5 }}>
                {ticket.subject}
              </Typography>
              <Typography variant="body2" color="#334155" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </Typography>
            </Box>

            {/* Resolution Verification Banner (if resolved) */}
            {ticket.resolutionSummary && (
              <Box sx={{ p: 2.5, bgcolor: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircleOutlineIcon sx={{ color: '#047857' }} />
                  <Typography variant="subtitle2" fontWeight={800} color="#065f46">
                    Resolution Verification Details (Section 40)
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#047857" fontWeight={700}>Root Cause:</Typography>
                    <Typography variant="body2">{ticket.resolutionReason || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#047857" fontWeight={700}>Action Taken:</Typography>
                    <Typography variant="body2">{ticket.resolutionActionTaken || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="#047857" fontWeight={700}>Parts Used:</Typography>
                    <Typography variant="body2">{ticket.resolutionPartsUsed || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="#047857" fontWeight={700}>Resolution Summary:</Typography>
                    <Typography variant="body2" fontWeight={600}>{ticket.resolutionSummary}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Reopened Justification Banner (if reopened) */}
            {ticket.status === 'REOPENED' && ticket.reopenReason && (
              <Box sx={{ p: 2.5, bgcolor: '#faf5ff', borderBottom: '1px solid #e9d5ff' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <ReplayIcon sx={{ color: '#7e22ce' }} />
                  <Typography variant="subtitle2" fontWeight={800} color="#6b21a8">
                    Reopening Justification (Section 41)
                  </Typography>
                </Stack>
                <Typography variant="body2" color="#581c87">{ticket.reopenReason}</Typography>
              </Box>
            )}

            {/* Tabs Navigation */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: '1px solid #e2e8f0', px: 2 }}
            >
              <Tab label={`Work Logs (${ticket.workLogs?.length || 0})`} />
              <Tab label={`Activity Audit (${ticket.activityLogs?.length || 0})`} />
              <Tab label={`Assignments (${ticket.assignmentHistory?.length || 0})`} />
              <Tab label={`Notes & Updates (${ticket.comments?.length || 0})`} />
              {ticket.photos?.length > 0 && <Tab label={`Photos (${ticket.photos.length})`} />}
            </Tabs>

            {/* Tab 0: Investigation Work Logs */}
            {activeTab === 0 && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                    Chronological Field Work Logs
                  </Typography>
                  {!isResolvedOrClosed && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BuildCircleOutlinedIcon />}
                      onClick={() => setWorkLogOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                      + Add Work Log
                    </Button>
                  )}
                </Stack>

                {(!ticket.workLogs || ticket.workLogs.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No investigation work logs recorded yet. Engineers record work performed, findings, test results, and next actions here.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {ticket.workLogs.map((log, idx) => (
                      <Paper
                        key={log._id || idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#f8fafc',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight={700} color="#0f766e">
                            {log.engineerName || log.engineer?.name || 'Field Engineer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.workDate || log.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ mb: 0.5 }}>
                          {log.workPerformed}
                        </Typography>

                        {log.findings && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Findings:</strong> {log.findings}
                          </Typography>
                        )}
                        {log.actionTaken && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Action Taken:</strong> {log.actionTaken}
                          </Typography>
                        )}
                        {log.partsUsed && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Parts Used:</strong> {log.partsUsed}
                          </Typography>
                        )}
                        {log.testPerformed && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Test Performed:</strong> {log.testPerformed} {log.testResult ? `• Result: ${log.testResult}` : ''}
                          </Typography>
                        )}
                        {log.nextAction && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Next Steps:</strong> {log.nextAction}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Tab 1: Append-Only Activity Log / Audit Trail */}
            {activeTab === 1 && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 2 }}>
                  Immutable Append-Only Audit Trail
                </Typography>

                {(!ticket.activityLogs || ticket.activityLogs.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No audit records available.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {ticket.activityLogs.map((act, idx) => (
                      <Box
                        key={act._id || idx}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          bgcolor: '#f8fafc',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip size="small" label={act.action} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                            <Typography variant="caption" fontWeight={700} color="#0f172a">
                              {act.actorName || act.actor?.name || 'System'}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(act.timestamp || act.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="#334155" sx={{ mt: 0.5 }}>
                          {act.description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Tab 2: Assignment History */}
            {activeTab === 2 && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 2 }}>
                  Engineer Allocation History (Section 39)
                </Typography>

                {(!ticket.assignmentHistory || ticket.assignmentHistory.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No engineer reassignment recorded yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {ticket.assignmentHistory.map((h, idx) => (
                      <Paper
                        key={h._id || idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#f8fafc',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={700} color="#0f766e">
                            {h.fromEngineerName || 'Unassigned'} → {h.toEngineerName || h.toEngineer?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(h.timestamp || h.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <strong>Assigned by:</strong> {h.assignedByName || 'Staff'} • <strong>Reason:</strong> {h.reason || 'Not specified'}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Tab 3: Notes & Communications */}
            {activeTab === 3 && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Add Note Form */}
                <Box component="form" onSubmit={handleAddComment} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    placeholder="Record an internal note or public customer update..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={noteIsPublic}
                          onChange={(e) => setNoteIsPublic(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="caption" fontWeight={600} color={noteIsPublic ? '#16a34a' : 'text.secondary'}>
                          {noteIsPublic ? 'Visible to Customer on /track Portal' : 'Internal Staff Note Only'}
                        </Typography>
                      }
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={savingAction || !noteContent.trim()}
                      startIcon={<SendIcon />}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: noteIsPublic ? '#16a34a' : '#0f766e',
                        '&:hover': { bgcolor: noteIsPublic ? '#15803d' : '#0d655e' },
                      }}
                    >
                      Post Note
                    </Button>
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No notes recorded yet.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {ticket.comments.map((c, idx) => (
                      <Box
                        key={c._id || idx}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          border: `1px solid ${c.visibility === 'CUSTOMER_VISIBLE' ? '#bbf7d0' : '#e2e8f0'}`,
                          bgcolor: c.visibility === 'CUSTOMER_VISIBLE' ? '#f0fdf4' : '#f8fafc',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" fontWeight={700} color="#0f172a">
                              {c.authorName || c.author?.name || 'Staff'}
                            </Typography>
                            <Chip
                              size="small"
                              label={c.visibility === 'CUSTOMER_VISIBLE' ? 'Public Customer Update' : 'Internal Note'}
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: c.visibility === 'CUSTOMER_VISIBLE' ? '#dcfce7' : '#f1f5f9',
                                color: c.visibility === 'CUSTOMER_VISIBLE' ? '#166534' : '#475569',
                              }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="#334155" sx={{ whiteSpace: 'pre-wrap' }}>
                          {c.content}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Tab 4: Photos Gallery (if any) */}
            {activeTab === 4 && ticket.photos?.length > 0 && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={2}>
                  {ticket.photos.map((p, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Box
                        component="a"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          display: 'block',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          height: 180,
                        }}
                      >
                        <Box
                          component="img"
                          src={p.url}
                          alt={`Evidence-${idx}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: Assign / Reassign Engineer */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Field Engineer</DialogTitle>
        <Box component="form" onSubmit={handleAssignSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Select Engineer *"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {assignees.map((eng) => (
                  <MenuItem key={eng._id || eng.id} value={eng._id || eng.id}>
                    {eng.name} ({eng.department || eng.jobRole || 'Field Service'})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Assignment / Reassignment Reason"
                placeholder="e.g. Zone-specialist engineer allocated; field visit required."
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction || !assigneeId}
              sx={{
                background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                color: '#3A230B',
                fontWeight: 800,
                borderRadius: '8px',
                px: 2.5,
                boxShadow: '0 3px 12px rgba(88, 55, 20, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                },
              }}
            >
              Confirm Assignment
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog: Update Status */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Ticket Status</DialogTitle>
        <Box component="form" onSubmit={handleStatusSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Next Status *"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                {allowedTransitions.map((st) => (
                  <MenuItem key={st} value={st}>
                    {STATUS_CONFIG[st]?.label || st}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label={nextStatus === 'PENDING' ? 'Pending Remark *' : 'Reason for status change'}
                placeholder={nextStatus === 'PENDING' ? 'Explain why this ticket is pending...' : 'Record operational reason...'}
                required={nextStatus === 'PENDING'}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction || !nextStatus}
              sx={{
                background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                color: '#3A230B',
                fontWeight: 800,
                borderRadius: '8px',
                px: 2.5,
                boxShadow: '0 3px 12px rgba(88, 55, 20, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                },
              }}
            >
              Update Status
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog: Add Investigation Work Log */}
      <Dialog open={workLogOpen} onClose={() => setWorkLogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Field Work Log</DialogTitle>
        <Box component="form" onSubmit={handleWorkLogSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  label="Work Performed *"
                  placeholder="Describe the diagnostics, disassembly, inspection, adjustments or repairs carried out."
                  value={workLogForm.workPerformed}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, workPerformed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Findings / Root Cause"
                  placeholder="Root cause identified on site"
                  value={workLogForm.findings}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, findings: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Action Taken"
                  placeholder="Corrective actions executed"
                  value={workLogForm.actionTaken}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, actionTaken: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Parts / Consumables Used"
                  placeholder="Spare parts or items replaced"
                  value={workLogForm.partsUsed}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, partsUsed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Performed & Result"
                  placeholder="Pressure test, electrical test, pass/fail"
                  value={workLogForm.testPerformed}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, testPerformed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Next Action Planned"
                  placeholder="Follow-up visit or pending customer sign-off"
                  value={workLogForm.nextAction}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, nextAction: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Next Follow-up Date"
                  InputLabelProps={{ shrink: true }}
                  value={workLogForm.followUpDate}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, followUpDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setWorkLogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction || !workLogForm.workPerformed.trim()}
              sx={{
                background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
                color: '#3A230B',
                fontWeight: 800,
                borderRadius: '8px',
                px: 2.5,
                boxShadow: '0 3px 12px rgba(88, 55, 20, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
                },
              }}
            >
              Record Work Log
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog: Resolve Complaint */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Resolve Complaint Verification</DialogTitle>
        <Box component="form" onSubmit={handleResolveSubmit}>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Per Section 40, resolving a ticket requires mandatory verification of root cause, corrective action, and resolution summary. An automated notification will be emailed to the customer.
            </Typography>

            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                size="small"
                label="Root Cause / Defect Reason *"
                placeholder="e.g. Loose wiring terminal on sensor junction box"
                value={resolveForm.resolutionReason}
                onChange={(e) => setResolveForm({ ...resolveForm, resolutionReason: e.target.value })}
              />

              <TextField
                required
                fullWidth
                size="small"
                label="Action Taken *"
                placeholder="e.g. Replaced connector terminal and recalibrated sensor"
                value={resolveForm.resolutionActionTaken}
                onChange={(e) => setResolveForm({ ...resolveForm, resolutionActionTaken: e.target.value })}
              />

              <TextField
                required
                fullWidth
                multiline
                minRows={3}
                label="Resolution Summary (Visible to Customer) *"
                placeholder="Provide a clear, professional summary of resolution to be communicated to the customer."
                value={resolveForm.resolutionSummary}
                onChange={(e) => setResolveForm({ ...resolveForm, resolutionSummary: e.target.value })}
              />

              <TextField
                fullWidth
                size="small"
                label="Spare Parts Replaced (Optional)"
                placeholder="e.g. 1x NF-SENSOR-V2"
                value={resolveForm.resolutionPartsUsed}
                onChange={(e) => setResolveForm({ ...resolveForm, resolutionPartsUsed: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction}
              sx={{ bgcolor: '#047857', '&:hover': { bgcolor: '#065f46' } }}
            >
              Confirm Resolution & Dispatch Email
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog: Reopen Complaint */}
      <Dialog open={reopenOpen} onClose={() => setReopenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reopen Ticket</DialogTitle>
        <Box component="form" onSubmit={handleReopenSubmit}>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Per Section 41, reopening preserves historical resolution records while capturing justification.
            </Typography>

            <TextField
              required
              fullWidth
              multiline
              minRows={3}
              label="Reopening Justification / Customer Feedback *"
              placeholder="Why is this ticket being reopened? e.g. Customer reported recurrence of sensor false alarm within 48 hours."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setReopenOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction || !reopenReason.trim()}
              sx={{ bgcolor: '#7e22ce', '&:hover': { bgcolor: '#6b21a8' } }}
            >
              Reopen Ticket
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* QR Code Dialog */}
      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </Box>
  );
}

