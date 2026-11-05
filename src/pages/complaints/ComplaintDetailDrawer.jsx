import { useEffect, useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  WARRANTY_CONFIG,
  CATEGORY_OPTIONS,
} from './complaintUtils';

const TIMELINE_ICONS = {
  CREATED: AddCircleOutlineIcon,
  STATUS: SwapHorizIcon,
  STATUS_CHANGED: SwapHorizIcon,
  ASSIGNED: PersonAddAlt1Icon,
  PRIORITY: FlagOutlinedIcon,
  NOTE: ChatBubbleOutlineIcon,
  NOTE_ADDED: ChatBubbleOutlineIcon,
  EDITED: BuildOutlinedIcon,
  RESOLVED: CheckCircleOutlineIcon,
};

const WORKER_STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const ALL_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low — 72 hours SLA' },
  { value: 'MEDIUM', label: 'Medium — 48 hours SLA' },
  { value: 'HIGH', label: 'High — 24 hours SLA' },
  { value: 'CRITICAL', label: 'Critical — 4 hours SLA' },
];

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: '#8C5E28', display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#3A230B', letterSpacing: '0.02em' }}>
          {title}
        </Typography>
      </Stack>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#7C6752', display: 'block', ml: 3.25, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function ComplaintDetailDrawer({ open, complaintId, onClose, onUpdated }) {
  const dispatch = useAppDispatch();
  const { user, isSuperAdmin } = useAuth();
  const isFieldEngineer = user?.role === 'User';
  const [complaint, setComplaint] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Editable Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    whatsappNumber: '',
    email: '',
    customerOrganization: '',
    customerLocation: '',
    productName: '',
    productSerialNumber: '',
    category: '',
    subject: '',
    description: '',
    assignedTo: '',
    status: '',
    priority: '',
    resolutionNotes: '',
    note: '',
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !complaintId) return undefined;

    let active = true;
    setLoading(true);
    setError('');
    setSaveError('');

    Promise.all([
      complaintApi.getById(complaintId),
      complaintApi.assignees().catch(() => ({ data: { data: [] } })),
    ])
      .then(([complaintResponse, assigneeResponse]) => {
        if (!active) return;
        const doc = complaintResponse.data.data;
        setComplaint(doc);
        setFormData({
          customerName: doc.customerName || '',
          contactNumber: doc.contactNumber || '',
          whatsappNumber: doc.whatsappNumber || doc.contactNumber || '',
          email: doc.email || '',
          customerOrganization: doc.customerOrganization || doc.companyName || '',
          customerLocation: doc.customerLocation || doc.siteName || doc.location || '',
          productName: doc.productName || doc.product || '',
          productSerialNumber: doc.productSerialNumber || '',
          category: doc.category || 'Product Quality',
          subject: doc.subject || '',
          description: doc.description || '',
          assignedTo: String(doc.assignedTo?._id || ''),
          status: doc.status || 'NEW',
          priority: doc.priority || 'MEDIUM',
          resolutionNotes: doc.resolutionNotes || '',
          note: '',
        });
        setAssignees(assigneeResponse.data?.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || 'Could not load ticket details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, complaintId]);

  const assigneeOptions = useMemo(() => {
    const list = assignees.map((eng) => ({
      value: String(eng._id || eng.id),
      label: `${eng.name} (${eng.jobRole || 'Field Engineer'})`,
    }));

    if (complaint?.assignedTo && !list.some((o) => o.value === String(complaint.assignedTo._id))) {
      list.unshift({
        value: String(complaint.assignedTo._id),
        label: `${complaint.assignedTo.name} (Assigned Engineer)`,
      });
    }

    return [{ value: '', label: '⚠️ Unassigned (Review Queue)' }, ...list];
  }, [assignees, complaint]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      if (field === 'assignedTo' && value && ['NEW', 'ACKNOWLEDGED', ''].includes(prev.status)) {
        return { ...prev, assignedTo: value, status: 'ASSIGNED' };
      }
      return { ...prev, [field]: value };
    });
  };

  const statusOptions = useMemo(() => {
    const base = WORKER_STATUS_OPTIONS;
    if (formData.status && !base.some((opt) => opt.value === formData.status)) {
      return [
        { value: formData.status, label: STATUS_CONFIG[formData.status]?.label || formData.status },
        ...base,
      ];
    }
    return base;
  }, [formData.status]);

  const handleCopyTicket = () => {
    if (complaint?.ticketNo) {
      navigator.clipboard.writeText(complaint.ticketNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!complaint) return;
    setSaveError('');

    const normStatus = String(formData.status || '').toUpperCase();
    if (
      (normStatus === 'RESOLVED' || normStatus === 'CLOSED') &&
      !String(formData.resolutionNotes || complaint.resolutionNotes || '').trim()
    ) {
      setSaveError('Please add resolution notes before marking this ticket as resolved or closed.');
      return;
    }
    if (normStatus === 'PENDING' && formData.status !== complaint.status && !String(formData.note || '').trim()) {
      setSaveError('A remark is required when marking this ticket as Pending.');
      return;
    }

    const payload = {};
    if (formData.customerName !== (complaint.customerName || '')) {
      payload.customerName = formData.customerName;
    }
    if (formData.contactNumber !== (complaint.contactNumber || '')) {
      payload.contactNumber = formData.contactNumber;
    }
    if (formData.whatsappNumber !== (complaint.whatsappNumber || '')) {
      payload.whatsappNumber = formData.whatsappNumber;
    }
    if (formData.email !== (complaint.email || '')) {
      payload.email = formData.email;
    }
    if (formData.customerOrganization !== (complaint.customerOrganization || complaint.companyName || '')) {
      payload.customerOrganization = formData.customerOrganization;
      payload.companyName = formData.customerOrganization;
    }
    if (formData.customerLocation !== (complaint.customerLocation || complaint.siteName || complaint.location || '')) {
      payload.customerLocation = formData.customerLocation;
      payload.siteName = formData.customerLocation;
      payload.location = formData.customerLocation;
    }
    if (formData.productName !== (complaint.productName || complaint.product || '')) {
      payload.productName = formData.productName;
      payload.product = formData.productName;
    }
    if (formData.productSerialNumber !== (complaint.productSerialNumber || '')) {
      payload.productSerialNumber = formData.productSerialNumber;
    }
    if (formData.category !== (complaint.category || '')) {
      payload.category = formData.category;
    }
    if (formData.subject !== (complaint.subject || '')) {
      payload.subject = formData.subject;
    }
    if (formData.description !== (complaint.description || '')) {
      payload.description = formData.description;
    }
    if (formData.status !== complaint.status) {
      payload.status = formData.status;
    }
    if (formData.priority !== complaint.priority) {
      payload.priority = formData.priority;
    }
    if (formData.assignedTo !== String(complaint.assignedTo?._id || '')) {
      payload.assignedTo = formData.assignedTo || null;
    }
    if (formData.resolutionNotes !== (complaint.resolutionNotes || '')) {
      payload.resolutionNotes = formData.resolutionNotes;
    }
    if (formData.note.trim()) {
      payload.note = formData.note.trim();
      if (normStatus === 'PENDING') payload.pendingRemark = formData.note.trim();
    }

    if (!Object.keys(payload).length) {
      dispatch(showSnackbar({ message: 'No changes were made to save.' }));
      return;
    }

    setSaving(true);
    try {
      const { data } = await complaintApi.update(complaint._id, payload);
      const updated = data.data || data;
      setComplaint(updated);
      setFormData((prev) => ({
        ...prev,
        status: updated.status,
        priority: updated.priority,
        assignedTo: String(updated.assignedTo?._id || updated.assignedTo || prev.assignedTo || ''),
        resolutionNotes: updated.resolutionNotes || '',
        note: '',
      }));
      dispatch(showSnackbar({ message: 'Ticket updated successfully!', severity: 'success' }));
      onUpdated?.(updated);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not update ticket details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const photos = complaint?.photos || [];
  const companyHistory = complaint?.companyHistory || [];
  const timeline = complaint?.timeline || complaint?.activityLogs || [];
  const warranty = WARRANTY_CONFIG[complaint?.warrantyStatus] || WARRANTY_CONFIG.UNKNOWN;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 660, md: 740 },
          maxWidth: '100vw',
          background: 'linear-gradient(135deg, #FFFDF9 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          borderLeft: '2px solid #D4A34E',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(58, 35, 11, 0.25)',
        },
      }}
    >
      {/* 1. Header Banner */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          pb: 2,
          borderBottom: '1px solid #E2D3BE',
          bgcolor: 'rgba(255, 253, 248, 0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  color: '#241404',
                  letterSpacing: '0.04em',
                }}
              >
                {complaint?.ticketNo || 'Loading ticket...'}
              </Typography>
              {complaint?.ticketNo && (
                <Tooltip title={copied ? 'Copied!' : 'Copy Ticket ID'}>
                  <IconButton size="small" onClick={handleCopyTicket} sx={{ color: '#8C5E28', p: 0.5 }}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              {complaint && (
                <Chip
                  size="small"
                  label={complaint.source === 'QR' ? 'QR Scan Intake' : 'Phone / Staff Intake'}
                  sx={{
                    bgcolor: 'rgba(212, 163, 78, 0.15)',
                    color: '#583714',
                    border: '1px solid rgba(212, 163, 78, 0.4)',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                />
              )}
            </Stack>

            {complaint && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
                <Chip
                  size="small"
                  label={STATUS_CONFIG[complaint.status]?.label || complaint.status}
                  sx={{
                    bgcolor: STATUS_CONFIG[complaint.status]?.bg || '#f1f5f9',
                    color: STATUS_CONFIG[complaint.status]?.color || '#475569',
                    border: `1px solid ${STATUS_CONFIG[complaint.status]?.border || '#cbd5e1'}`,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                />
                <Chip
                  size="small"
                  label={complaint.priority}
                  sx={{
                    bgcolor: PRIORITY_CONFIG[complaint.priority]?.bg || '#f1f5f9',
                    color: PRIORITY_CONFIG[complaint.priority]?.color || '#475569',
                    border: `1px solid ${PRIORITY_CONFIG[complaint.priority]?.border || '#cbd5e1'}`,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                />
                <Chip
                  size="small"
                  label={warranty.label}
                  sx={{
                    bgcolor: warranty.bg,
                    color: warranty.color,
                    border: `1px solid ${warranty.border}`,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                />
                <Typography variant="caption" sx={{ color: '#7C6752' }}>
                  Registered: {formatDateTime(complaint.createdAt)}
                </Typography>
              </Stack>
            )}
            {(isSuperAdmin || !isFieldEngineer) && complaint?.status === 'PENDING' && complaint?.pendingRemark && (
              <Alert
                severity="warning"
                sx={{
                  mt: 1.5,
                  py: 0.5,
                  borderRadius: '10px',
                  bgcolor: '#FFF7ED',
                  border: '1px solid #FDBA74',
                  color: '#9A3412',
                  '& .MuiAlert-icon': { color: '#C2410C' },
                }}
              >
                <Typography variant="caption" fontWeight={800} display="block">
                  Pending remark{complaint.pendingRemarkBy ? ` · ${complaint.pendingRemarkBy}` : ''}
                  {complaint.pendingRemarkAt ? ` · ${formatDateTime(complaint.pendingRemarkAt)}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {complaint.pendingRemark}
                </Typography>
              </Alert>
            )}
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{
              bgcolor: 'rgba(212, 163, 78, 0.12)',
              color: '#4A2E0F',
              '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.25)', color: '#241404' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* 2. Main Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
            <CircularProgress sx={{ color: '#D4A34E' }} size={36} />
            <Typography variant="body2" sx={{ color: '#6E4D27', mt: 2, fontWeight: 600 }}>
              Loading ticket details...
            </Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : complaint ? (
          <Stack spacing={3}>
            {/* Action Alert if there are unsaved errors */}
            {saveError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {saveError}
              </Alert>
            )}

            {/* A. WORKFLOW ASSIGNMENT & STATUS CARD */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1.5px solid #D4A34E',
                background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF0DF 100%)',
                boxShadow: '0 4px 16px rgba(58, 35, 11, 0.08)',
              }}
            >
              <SectionHeader
                icon={<PersonAddAlt1Icon sx={{ fontSize: 20 }} />}
                title="Service Assignment & Lifecycle Status"
                subtitle="Select engineer to assign or reassign, update ticket status, and record resolution notes."
              />

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Assigned Engineer"
                    value={formData.assignedTo}
                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                    disabled={isFieldEngineer}
                    sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                  >
                    {assigneeOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Ticket Status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Priority & SLA"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                  >
                    {ALL_PRIORITY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Resolution Notes"
                    placeholder="Describe how the problem was resolved, parts replaced, or root cause (required for closing/resolving)..."
                    value={formData.resolutionNotes}
                    onChange={(e) => handleChange('resolutionNotes', e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    label={formData.status === 'PENDING' ? 'Pending Remark *' : 'Add Audit / Progress Note (Optional)'}
                    placeholder={
                      formData.status === 'PENDING'
                        ? 'Explain why this ticket is pending (required)...'
                        : 'Record notes from a phone call, customer discussion, or next steps...'
                    }
                    required={formData.status === 'PENDING' && formData.status !== complaint?.status}
                    value={formData.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* B. CUSTOMER INFORMATION (EDITABLE) */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                bgcolor: '#FFFFFF',
              }}
            >
              <SectionHeader
                icon={<PersonOutlineIcon sx={{ fontSize: 20 }} />}
                title="Customer Contact & Organization (Editable)"
                subtitle="Modify customer details recorded during the phone call if corrections are needed."
              />

              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact Person Name *"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone / Mobile Number *"
                    value={formData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="WhatsApp Number *"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    helperText="Ticket updates are sent on WhatsApp only"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company / Railway Division *"
                    value={formData.customerOrganization}
                    onChange={(e) => handleChange('customerOrganization', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Site / Station / Location"
                    placeholder="e.g., Kota Junction, Track Maintenance Depot 3"
                    value={formData.customerLocation}
                    onChange={(e) => handleChange('customerLocation', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* C. EQUIPMENT & WARRANTY (EDITABLE) */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                bgcolor: '#FFFFFF',
              }}
            >
              <SectionHeader
                icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
                title="Equipment & Warranty (Editable)"
                subtitle="Ensure product identification and serial numbers match physical equipment."
              />

              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Equipment / Product Name *"
                    placeholder="e.g. Fire Alarm Control Panel, GPS Sensor"
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Product Serial Number"
                    placeholder="e.g. SN-98234-A"
                    value={formData.productSerialNumber}
                    onChange={(e) => handleChange('productSerialNumber', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Complaint Category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1,
                      px: 1.5,
                      borderRadius: '8px',
                      bgcolor: '#FBF6EE',
                      border: '1px solid #E2D3BE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: 40,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6E4D27' }}>
                      WARRANTY STATUS
                    </Typography>
                    <Chip
                      size="small"
                      label={warranty.label}
                      sx={{
                        bgcolor: warranty.bg,
                        color: warranty.color,
                        border: `1px solid ${warranty.border}`,
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* D. COMPLAINT ISSUE & DESCRIPTION (EDITABLE) */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                bgcolor: '#FFFFFF',
              }}
            >
              <SectionHeader
                icon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} />}
                title="Complaint Issue & Details (Editable)"
                subtitle="Clear subject and breakdown of the customer-reported defect or service requirement."
              />

              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Issue Subject / Title *"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Detailed Problem Description *"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* E. PHOTOS & ATTACHMENTS */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                bgcolor: '#FFFFFF',
              }}
            >
              <SectionHeader
                icon={<AttachFileOutlinedIcon sx={{ fontSize: 20 }} />}
                title={`Attachments & Equipment Photos (${photos.length})`}
                subtitle="Visual proof uploaded by customer via QR self-service or field engineers."
              />

              {photos.length === 0 ? (
                <Box
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: '#FAF5EE',
                    borderRadius: '10px',
                    border: '1px dashed #D4A34E',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#7C6752' }}>
                    No photos or attachments uploaded for this ticket.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  {photos.map((photo, idx) => (
                    <Grid item xs={6} sm={4} key={photo.url || idx}>
                      <Box
                        component="a"
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          display: 'block',
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #E2D3BE',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          pt: '75%',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(58, 35, 11, 0.15)',
                            borderColor: '#D4A34E',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={photo.url}
                          alt={`Attachment ${idx + 1}`}
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 0.75,
                            bgcolor: 'rgba(36, 20, 4, 0.75)',
                            color: '#FFF2D1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Photo {idx + 1}
                          </Typography>
                          <OpenInNewIcon sx={{ fontSize: 13 }} />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {/* F. COMPANY PREVIOUS COMPLAINTS HISTORY */}
            {companyHistory.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  border: '1px solid #E2D3BE',
                  bgcolor: '#FFFFFF',
                }}
              >
                <SectionHeader
                  icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
                  title={`Past Company Tickets (${companyHistory.length})`}
                  subtitle="Other complaints and service history logged for this customer organization."
                />

                <Stack spacing={1} sx={{ mt: 1 }}>
                  {companyHistory.map((item) => {
                    const histStatus = STATUS_CONFIG[item.status] || STATUS_CONFIG.NEW;
                    return (
                    <Box
                      key={item._id}
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        border: '1px solid #EAE0D0',
                        bgcolor: '#FAF6EF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8125rem' }}>
                            {item.ticketNo}
                          </Typography>
                          <Chip
                            size="small"
                            label={histStatus.label}
                            sx={{
                              bgcolor: histStatus.bg,
                              color: histStatus.color,
                              border: `1px solid ${histStatus.border}`,
                              fontWeight: 700,
                              fontSize: '0.65rem',
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.25 }}>
                          {item.subject} • {item.productName || item.product || 'General'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#7C6752', fontWeight: 600 }}>
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Box>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            {/* G. AUDIT TRAIL / TIMELINE */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '16px',
                border: '1px solid #E2D3BE',
                bgcolor: '#FFFFFF',
              }}
            >
              <SectionHeader
                icon={<HistoryEduOutlinedIcon sx={{ fontSize: 20 }} />}
                title="Activity Log & Audit Trail"
                subtitle="Complete chronological history of assignment changes, status movements, and staff notes."
              />

              <Stack spacing={2} sx={{ mt: 1.5, pl: 0.5 }}>
                {timeline.map((entry, idx) => {
                  const Icon = TIMELINE_ICONS[entry.type || entry.action] || ChatBubbleOutlineIcon;
                  return (
                    <Stack direction="row" spacing={1.5} key={`${entry.action || entry.type}-${entry.timestamp || entry.at}-${idx}`}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'rgba(212, 163, 78, 0.2)',
                          color: '#4A2E0F',
                          border: '1px solid #D4A34E',
                        }}
                      >
                        <Icon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#241404' }}>
                          {entry.description || entry.message || `${entry.action}: ${entry.newValue || ''}`}
                        </Typography>
                        {entry.note && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              p: 1,
                              borderRadius: '8px',
                              bgcolor: '#FBF8F2',
                              border: '1px solid #EAE0D0',
                              fontSize: '0.8125rem',
                              color: '#4A2E0F',
                            }}
                          >
                            {entry.note}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#8C5E28', display: 'block', mt: 0.25 }}>
                          By {entry.actorName || entry.byName || 'System'} • {formatDateTime(entry.timestamp || entry.at)}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </Box>

      {/* 3. Sticky Footer Actions */}
      <Divider sx={{ borderColor: '#E2D3BE' }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: 'rgba(255, 253, 248, 0.98)',
          borderTop: '1px solid #E2D3BE',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            borderColor: '#D4A34E',
            color: '#583714',
            px: 2.5,
            '&:hover': {
              borderColor: '#B57F2F',
              bgcolor: 'rgba(212, 163, 78, 0.1)',
            },
          }}
        >
          Close
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading || !complaint}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlineIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.875rem',
            px: 3.5,
            py: 1,
            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
            color: '#3A230B',
            boxShadow: '0 4px 14px rgba(88, 55, 20, 0.25)',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
              boxShadow: '0 6px 18px rgba(88, 55, 20, 0.35)',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(0,0,0,0.12)',
              color: 'rgba(0,0,0,0.26)',
            },
          }}
        >
          {saving ? 'Saving changes...' : 'Save Changes'}
        </Button>
      </Stack>
    </Drawer>
  );
}
