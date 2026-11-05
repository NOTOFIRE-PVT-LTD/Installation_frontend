import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { complaintApi } from '../../api/complaintApi';
import axiosInstance from '../../api/axiosInstance';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { CATEGORY_OPTIONS, SOURCE_OPTIONS, WARRANTY_CONFIG } from './complaintUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';

const filter = createFilterOptions();

const DELIVERY_STATUS_OPTIONS = [
  '',
  'Pending',
  'In Transit',
  'Delivered',
  'Partially Delivered',
  'Not Applicable',
];

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
  const [statusNote, setStatusNote] = useState('NEW');
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

        const custList = custRes.data?.data || custRes.data?.items || custRes.data || [];
        setCustomers(Array.isArray(custList) ? custList : []);

        const engList = assigneesRes.data?.data || assigneesRes.data || [];
        setAssignees(Array.isArray(engList) ? engList : []);
        setComplaintReceiver(user?.name || '');
        if (!isAdmin && user?._id) {
          setVisitPersonId(user._id);
        }
      } catch (err) {
        console.warn('Could not load all prerequisites', err);
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
      const res = await complaintApi.checkDuplicate({
        phone: phoneVal || undefined,
        serialNumber: serialVal || undefined,
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !mobileNo.trim() || !whatsappNo.trim() || !problem.trim()) {
      setError('Customer Name, Mobile No, WhatsApp No, and Problem are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        source,
        customerId,
        customerName: customerName.trim(),
        contactNumber: mobileNo.trim(),
        whatsappNumber: whatsappNo.trim(),
        email: email.trim(),
        customerOrganization: customerOrganization.trim(),
        siteName: stationName.trim(),
        stationName: stationName.trim(),
        customerLocation: stationName.trim(),
        productName: productName.trim(),
        productSerialNumber: panelSerialNo.trim(),
        panelSerialNo: panelSerialNo.trim(),
        category,
        priority,
        subject: problem.trim().slice(0, 60),
        description: problem.trim(),
        problem: problem.trim(),
        complaintDate: complaintDate || undefined,
        complaintReceiverName: complaintReceiver.trim(),
        solutions: solutions.trim(),
        takenTime: takenTime.trim(),
        attempt: Number(attempt) || 1,
        pendingRemark: pendingReason.trim(),
        pendingReason: pendingReason.trim(),
        deliveryStatus: deliveryStatus.trim(),
        warrantyStatus,
        notifyChannel: 'whatsapp',
        assignedTo: isAdmin ? visitPersonId || null : user?._id || null,
      };

      const res = await complaintApi.createInternal(payload);
      const created = res.data?.data || res.data;

      dispatch(
        showSnackbar({
          message: `Ticket ${created.ticketNo} registered successfully!`,
          severity: 'success',
        })
      );

      navigate(isAdmin ? '/complaints' : isSalesperson ? '/attendance' : '/complaints/desk');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to record complaint intake. Please check your entries.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          component={Link}
          to="/complaints"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Complaints
        </Button>
      </Stack>

      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FFE997 0%, #D4A34E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(88, 55, 20, 0.25)',
              border: '1.5px solid #FFFFFF',
            }}
          >
            <PhoneInTalkIcon sx={{ fontSize: 26, color: '#3A230B' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#241404' }}>
              Create complaint ticket
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin / salesperson fills these fields for the customer • Complaint No is issued on save
            </Typography>
          </Box>
        </Stack>

        {duplicateWarning && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 3, borderRadius: '8px', bgcolor: '#fffbeb', border: '1px solid #fde68a' }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="#b45309">
              Potential duplicate complaint
            </Typography>
            <Typography variant="body2" color="#92400e">
              {duplicateWarning}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              size="small"
              options={customers}
              disabled={loadingPrereqs}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some(
                  (opt) => inputValue.toLowerCase() === (opt.companyName || '').toLowerCase()
                );
                if (inputValue.trim() !== '' && !isExisting) {
                  filtered.push({
                    inputValue: inputValue.trim(),
                    companyName: `Add "${inputValue.trim()}" as New Company`,
                    isNew: true,
                  });
                }
                return filtered;
              }}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (option.inputValue) return option.inputValue;
                return `${option.companyName || ''} ${option.contactPerson ? `(${option.contactPerson})` : ''} ${option.phone ? `• ${option.phone}` : ''}`.trim();
              }}
              renderOption={(props, option) => (
                <li {...props} key={option._id || option.inputValue || option.companyName}>
                  {option.isNew ? (
                    <Box sx={{ color: '#85581A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AddIcon fontSize="small" sx={{ color: '#D4A34E' }} />
                      <span>
                        Add <strong>&quot;{option.inputValue}&quot;</strong> as new company
                      </span>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight={700} color="#241404">
                        {option.companyName}
                      </Typography>
                      {(option.contactPerson || option.phone || option.city) && (
                        <Typography variant="caption" color="text.secondary">
                          {[option.contactPerson, option.phone, option.city].filter(Boolean).join(' • ')}
                        </Typography>
                      )}
                    </Box>
                  )}
                </li>
              )}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  setCustomerOrganization(newValue);
                  setCustomerId(null);
                } else if (newValue?.isNew) {
                  setCustomerOrganization(newValue.inputValue);
                  setCustomerId(null);
                } else if (newValue) {
                  handleCustomerChange(event, newValue);
                } else {
                  setCustomerId(null);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lookup company (optional helper)"
                  placeholder="Search to auto-fill customer / station / mobile"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="1. Complaint No"
              value="Auto-generated on save"
              disabled
              helperText="Issued when you create the ticket"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="2. Complaint Date"
              InputLabelProps={{ shrink: true }}
              value={complaintDate}
              onChange={(e) => setComplaintDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="3. Station Name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="Station / site name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="4. Panel Serial No"
              value={panelSerialNo}
              onChange={(e) => {
                setPanelSerialNo(e.target.value);
                triggerDuplicateCheck(mobileNo, e.target.value);
              }}
              placeholder="Panel / product serial"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="5. Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="6. Mobile No *"
              value={mobileNo}
              onChange={(e) => {
                setMobileNo(e.target.value);
                if (!whatsappNo || whatsappNo === mobileNo) setWhatsappNo(e.target.value);
                triggerDuplicateCheck(e.target.value, panelSerialNo);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="7. WhatsApp No *"
              value={whatsappNo}
              onChange={(e) => setWhatsappNo(e.target.value)}
              helperText="Ask the customer for a WhatsApp number so they get ticket create / assign / resolve updates"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="8. Complaint Receiver"
              value={complaintReceiver}
              onChange={(e) => setComplaintReceiver(e.target.value)}
              helperText="Staff who took / registered the complaint"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Intake Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {SOURCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              size="small"
              label="9. Problem *"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="What the customer reported"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="10. Solutions"
              value={solutions}
              onChange={(e) => setSolutions(e.target.value)}
              placeholder="Solution given or planned (can update later)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {isAdmin ? (
              <TextField
                select
                fullWidth
                size="small"
                label="11. Visit Person Name"
                value={visitPersonId}
                onChange={(e) => setVisitPersonId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {assignees.map((eng) => (
                  <MenuItem key={eng._id || eng.id} value={eng._id || eng.id}>
                    {eng.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                label="11. Visit Person Name"
                value={user?.name || ''}
                disabled
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="12. Taken Time"
              value={takenTime}
              onChange={(e) => setTakenTime(e.target.value)}
              placeholder="e.g. 2 hrs / 45 min"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="13. Status"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              helperText="Starts as New; assigning a visit person moves it to Assigned"
              disabled
            >
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="14. Warranty"
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
            >
              {Object.keys(WARRANTY_CONFIG).map((key) => (
                <MenuItem key={key} value={key}>
                  {WARRANTY_CONFIG[key].label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="15. Attempt"
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="16. Pending Reason"
              value={pendingReason}
              onChange={(e) => setPendingReason(e.target.value)}
              placeholder="If pending, why"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="17. Delivery Status"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              {DELIVERY_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt || 'empty'} value={opt}>
                  {opt || '—'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </TextField>
          </Grid>

        </Grid>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 3 }}>
          <Button
            component={Link}
            to="/complaints"
            variant="outlined"
            sx={{
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#D4A34E',
              color: '#583714',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
              color: '#3A230B',
              borderRadius: '8px',
              px: 4,
              py: 1.25,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {submitting ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} color="inherit" />
                <span>Saving…</span>
              </Stack>
            ) : (
              'Create ticket'
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
