import { useEffect, useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { STATUS_CONFIG } from './complaintUtils';
import ComplaintDetailHeader from './ComplaintDetailHeader';
import ComplaintDetailStatusSection from './ComplaintDetailStatusSection';
import ComplaintDetailOverview from './ComplaintDetailOverview';
import ComplaintDetailResolutionSection from './ComplaintDetailResolutionSection';
import ComplaintDetailTimeline from './ComplaintDetailTimeline';

const WORKER_STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
];

function buildPayload(formData, complaint) {
  const p = {};
  const normStatus = String(formData.status || '').toUpperCase();
  const fields = ['customerName', 'contactNumber', 'whatsappNumber', 'email', 'productSerialNumber', 'category', 'subject', 'description', 'resolutionNotes'];
  fields.forEach((k) => { if (formData[k] !== (complaint[k] || '')) p[k] = formData[k]; });
  if (formData.customerOrganization !== (complaint.customerOrganization || complaint.companyName || '')) {
    p.customerOrganization = formData.customerOrganization; p.companyName = formData.customerOrganization;
  }
  if (formData.customerLocation !== (complaint.customerLocation || complaint.siteName || complaint.location || '')) {
    p.customerLocation = formData.customerLocation; p.siteName = formData.customerLocation; p.location = formData.customerLocation;
  }
  if (formData.productName !== (complaint.productName || complaint.product || '')) {
    p.productName = formData.productName; p.product = formData.productName;
  }
  if (formData.status !== complaint.status) p.status = formData.status;
  if (formData.priority !== complaint.priority) p.priority = formData.priority;
  if (formData.assignedTo !== String(complaint.assignedTo?._id || '')) p.assignedTo = formData.assignedTo || null;
  if (formData.note.trim()) {
    p.note = formData.note.trim();
    if (normStatus === 'PENDING') p.pendingRemark = formData.note.trim();
  }
  return p;
}

export default function ComplaintDetailDrawer({ open, complaintId, onClose, onUpdated }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isFieldEngineer = user?.role === 'User';
  const [complaint, setComplaint] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '', contactNumber: '', whatsappNumber: '', email: '', customerOrganization: '',
    customerLocation: '', productName: '', productSerialNumber: '', category: '', subject: '',
    description: '', assignedTo: '', status: '', priority: '', resolutionNotes: '', note: '',
  });

  const initFormData = (doc) => ({
    customerName: doc.customerName || '', contactNumber: doc.contactNumber || '',
    whatsappNumber: doc.whatsappNumber || doc.contactNumber || '', email: doc.email || '',
    customerOrganization: doc.customerOrganization || doc.companyName || '',
    customerLocation: doc.customerLocation || doc.siteName || doc.location || '',
    productName: doc.productName || doc.product || '', productSerialNumber: doc.productSerialNumber || '',
    category: doc.category || 'Product Quality', subject: doc.subject || '', description: doc.description || '',
    assignedTo: String(doc.assignedTo?._id || ''), status: doc.status || 'NEW', priority: doc.priority || 'MEDIUM',
    resolutionNotes: doc.resolutionNotes || '', note: '',
  });

  useEffect(() => {
    if (!open || !complaintId) return;
    setLoading(true);
    setSaveError('');
    Promise.all([complaintApi.getById(complaintId), complaintApi.assignees().catch(() => ({ data: { data: [] } }))])
      .then(([cRes, aRes]) => {
        const doc = cRes.data.data;
        setComplaint(doc);
        setFormData(initFormData(doc));
        setAssignees(aRes.data?.data || []);
      })
      .catch((err) => setSaveError(err.response?.data?.message || 'Could not load ticket.'))
      .finally(() => setLoading(false));
  }, [open, complaintId]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      if (field === 'assignedTo' && value && ['NEW', 'ACKNOWLEDGED', ''].includes(prev.status)) {
        return { ...prev, assignedTo: value, status: 'ASSIGNED' };
      }
      return { ...prev, [field]: value };
    });
  };

  const statusOptions = useMemo(() => {
    if (formData.status && !WORKER_STATUS_OPTIONS.some((opt) => opt.value === formData.status)) {
      return [{ value: formData.status, label: STATUS_CONFIG[formData.status]?.label || formData.status }, ...WORKER_STATUS_OPTIONS];
    }
    return WORKER_STATUS_OPTIONS;
  }, [formData.status]);

  const assigneeOptions = useMemo(() => {
    const list = assignees.map((e) => ({ value: String(e._id || e.id), label: `${e.name} (${e.jobRole || 'Field Engineer'})` }));
    if (complaint?.assignedTo && !list.some((o) => o.value === String(complaint.assignedTo._id))) {
      list.unshift({ value: String(complaint.assignedTo._id), label: `${complaint.assignedTo.name} (Assigned Engineer)` });
    }
    return [{ value: '', label: '⚠️ Unassigned (Review Queue)' }, ...list];
  }, [assignees, complaint]);

  const handleCopyTicket = () => {
    if (complaint?.ticketNo) {
      navigator.clipboard.writeText(complaint.ticketNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateBeforeSave = (normStatus) => {
    if ((normStatus === 'RESOLVED' || normStatus === 'CLOSED') && !String(formData.resolutionNotes || complaint.resolutionNotes || '').trim()) {
      setSaveError('Please add resolution notes before marking ticket as resolved or closed.');
      return false;
    }
    if (normStatus === 'PENDING' && formData.status !== complaint.status && !String(formData.note || '').trim()) {
      setSaveError('A remark is required when marking this ticket as Pending.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!complaint) return;
    const normStatus = String(formData.status || '').toUpperCase();
    if (!validateBeforeSave(normStatus)) return;
    const payload = buildPayload(formData, complaint);
    if (!Object.keys(payload).length) {
      dispatch(showSnackbar({ message: 'No changes to save.' }));
      return;
    }
    setSaving(true);
    try {
      const { data } = await complaintApi.update(complaint._id, payload);
      const updated = data.data || data;
      setComplaint(updated);
      setFormData(initFormData(updated));
      dispatch(showSnackbar({ message: 'Ticket updated successfully!', severity: 'success' }));
      if (onUpdated) onUpdated();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 620 }, bgcolor: '#FAF7F2' } }}>
      <ComplaintDetailHeader complaint={complaint} onClose={onClose} onCopy={handleCopyTicket} copied={copied} />
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2}>
            {saveError && <Alert severity="error">{saveError}</Alert>}
            <ComplaintDetailStatusSection formData={formData} handleChange={handleChange} statusOptions={statusOptions} assigneeOptions={assigneeOptions} disabled={isFieldEngineer} />
            <ComplaintDetailOverview formData={formData} handleChange={handleChange} complaint={complaint} />
            <ComplaintDetailResolutionSection formData={formData} handleChange={handleChange} complaint={complaint} />
            <ComplaintDetailTimeline activityLogs={complaint?.activityLogs || []} />
          </Stack>
        )}
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #E2D3BE', bgcolor: '#FFFDF8', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button onClick={onClose} sx={{ color: '#583714', textTransform: 'none', fontWeight: 600 }}>Close</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || loading} sx={{ background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)', color: '#3A230B', fontWeight: 800, textTransform: 'none', px: 3 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
    </Drawer>
  );
}
