import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { complaintApi } from '../../api/complaintApi';
import axiosInstance from '../../api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import ComplaintIntakeCustomerSection from './ComplaintIntakeCustomerSection';
import ComplaintIntakeEquipmentSection from './ComplaintIntakeEquipmentSection';
import ComplaintIntakeResolutionSection from './ComplaintIntakeResolutionSection';

function todayInputValue() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function ComplaintIntakePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin, isSalesperson } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loadingPrereqs, setLoadingPrereqs] = useState(true);

  const [source, setSource] = useState('PHONE');
  const [complaintDate, setComplaintDate] = useState(todayInputValue());
  const [stationName, setStationName] = useState('');
  const [panelSerialNo, setPanelSerialNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [complaintReceiver, setComplaintReceiver] = useState('');
  const [problem, setProblem] = useState('');
  const [solutions, setSolutions] = useState('');
  const [visitPersonId, setVisitPersonId] = useState('');
  const [takenTime, setTakenTime] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('UNKNOWN');
  const [attempt, setAttempt] = useState('1');
  const [pendingReason, setPendingReason] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [email, setEmail] = useState('');
  const [customerOrganization, setCustomerOrganization] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Product Quality');
  const [priority, setPriority] = useState('MEDIUM');

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setLoadingPrereqs(true);
        const [custRes, assigneesRes] = await Promise.all([
          axiosInstance.get('/customers?pageSize=500&active=true').catch(() => ({ data: { data: [] } })),
          complaintApi.assignees().catch(() => ({ data: { data: [] } })),
        ]);
        setCustomers(custRes.data?.data || custRes.data?.items || []);
        setAssignees(assigneesRes.data?.data || assigneesRes.data || []);
        setComplaintReceiver(user?.name || '');
        if (!isAdmin && user?._id) setVisitPersonId(user._id);
      } catch (err) {
        console.warn('Could not load prerequisites', err);
      } finally {
        setLoadingPrereqs(false);
      }
    };
    loadPrerequisites();
  }, [isAdmin, user?._id, user?.name]);

  const triggerDuplicateCheck = async (phoneVal, serialVal) => {
    if ((!phoneVal || phoneVal.length < 7) && (!serialVal || serialVal.length < 3)) {
      setDuplicateWarning(null);
      return;
    }
    try {
      const res = await complaintApi.checkDuplicate({ phone: phoneVal || undefined, serialNumber: serialVal || undefined });
      const data = res.data?.data || res.data;
      setDuplicateWarning(data?.isDuplicate ? data.message : null);
    } catch {
      setDuplicateWarning(null);
    }
  };

  const handleCustomerChange = (_event, selectedCust) => {
    if (selectedCust) {
      setCustomerId(selectedCust._id || selectedCust.id);
      setCustomerName(selectedCust.contactPerson || selectedCust.companyName || '');
      setMobileNo(selectedCust.phone || '');
      setWhatsappNo(selectedCust.phone || '');
      setEmail(selectedCust.email || '');
      setCustomerOrganization(selectedCust.companyName || '');
      setStationName(selectedCust.city || selectedCust.address || '');
      triggerDuplicateCheck(selectedCust.phone, panelSerialNo);
    } else {
      setCustomerId(null);
    }
  };

  const buildPayload = () => ({
    source, customerId, customerName: customerName.trim(), contactNumber: mobileNo.trim(), whatsappNumber: whatsappNo.trim(),
    email: email.trim(), customerOrganization: customerOrganization.trim(), siteName: stationName.trim(), stationName: stationName.trim(),
    customerLocation: stationName.trim(), productName: productName.trim(), productSerialNumber: panelSerialNo.trim(),
    panelSerialNo: panelSerialNo.trim(), category, priority, subject: problem.trim().slice(0, 60), description: problem.trim(),
    problem: problem.trim(), complaintDate: complaintDate || undefined, complaintReceiverName: complaintReceiver.trim(),
    solutions: solutions.trim(), takenTime: takenTime.trim(), attempt: Number(attempt) || 1, pendingRemark: pendingReason.trim(),
    pendingReason: pendingReason.trim(), deliveryStatus: deliveryStatus.trim(), warrantyStatus, notifyChannel: 'whatsapp',
    assignedTo: isAdmin ? visitPersonId || null : user?._id || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!customerName.trim() || !mobileNo.trim() || !whatsappNo.trim() || !problem.trim()) {
      setError('Customer Name, Mobile No, WhatsApp No, and Problem are mandatory.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await complaintApi.createInternal(buildPayload());
      const created = res.data?.data || res.data;
      dispatch(showSnackbar({ message: `Ticket ${created.ticketNo} registered successfully!`, severity: 'success' }));
      navigate(isAdmin ? '/complaints' : isSalesperson ? '/attendance' : '/complaints/desk');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to record complaint intake.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Button component={Link} to="/complaints" size="small" startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}>
          Back to Complaints
        </Button>
      </Stack>
      <Paper elevation={0} component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(88, 55, 20, 0.25)', border: '1.5px solid #FFFFFF' }}>
            <PhoneInTalkIcon sx={{ fontSize: 26, color: '#3A230B' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#241404' }}>Create complaint ticket</Typography>
            <Typography variant="body2" color="text.secondary">Register caller issue, suggest immediate solutions, and assign engineer</Typography>
          </Box>
        </Stack>

        {duplicateWarning && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3, borderRadius: '8px' }}>{duplicateWarning}</Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

        <Grid container spacing={2.5}>
          <ComplaintIntakeCustomerSection
            customers={customers} handleCustomerChange={handleCustomerChange} customerName={customerName} setCustomerName={setCustomerName}
            mobileNo={mobileNo} setMobileNo={setMobileNo} whatsappNo={whatsappNo} setWhatsappNo={setWhatsappNo} email={email} setEmail={setEmail}
            customerOrganization={customerOrganization} setCustomerOrganization={setCustomerOrganization} stationName={stationName} setStationName={setStationName}
            onPhoneBlur={() => triggerDuplicateCheck(mobileNo, panelSerialNo)}
          />
          <ComplaintIntakeEquipmentSection
            complaintDate={complaintDate} setComplaintDate={setComplaintDate} source={source} setSource={setSource} productName={productName}
            setProductName={setProductName} panelSerialNo={panelSerialNo} setPanelSerialNo={setPanelSerialNo} category={category} setCategory={setCategory}
            priority={priority} setPriority={setPriority} warrantyStatus={warrantyStatus} setWarrantyStatus={setWarrantyStatus}
            onSerialBlur={() => triggerDuplicateCheck(mobileNo, panelSerialNo)}
          />
          <ComplaintIntakeResolutionSection
            problem={problem} setProblem={setProblem} solutions={solutions} setSolutions={setSolutions} isAdmin={isAdmin} visitPersonId={visitPersonId}
            setVisitPersonId={setVisitPersonId} assignees={assignees} complaintReceiver={complaintReceiver} setComplaintReceiver={setComplaintReceiver}
            takenTime={takenTime} setTakenTime={setTakenTime} attempt={attempt} setAttempt={setAttempt} deliveryStatus={deliveryStatus}
            setDeliveryStatus={setDeliveryStatus} pendingReason={pendingReason} setPendingReason={setPendingReason}
          />
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button component={Link} to="/complaints" variant="outlined" sx={{ borderRadius: '8px', px: 3, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting || loadingPrereqs} sx={{ borderRadius: '8px', px: 4, py: 1, bgcolor: '#0f766e', '&:hover': { bgcolor: '#0d655e' }, textTransform: 'none', fontWeight: 700 }}>
            {submitting ? <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} color="inherit" /><span>Registering...</span></Stack> : 'Save & Register Complaint'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
