import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SearchIcon from '@mui/icons-material/Search';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { complaintApi } from '../../api/complaintApi';
import { CATEGORY_OPTIONS } from './complaintUtils';
import { fireCelebrationConfetti } from '../../utils/confetti';
import logo from '../../assets/logo.png';
import TwoButtonPill from '../../components/common/TwoButtonPill';
import PageHeader from '../../components/common/PageHeader';

const MAX_PHOTOS = 3;
const MAX_PHOTO_MB = 5;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

const PUBLIC_PRIORITIES = [
  { value: 'Low', label: 'Low - Can be attended within 3 days' },
  { value: 'Medium', label: 'Medium - Normal response (48 hours)' },
  { value: 'High', label: 'High - Urgent / Production halting (24 hours)' },
  { value: 'Critical', label: 'Critical - Safety risk / Total outage (4 hours)' },
];

const categorySelectOptions = CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }));

const optionalText = (max) =>
  yup
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .max(max, 'This value is too long');

const schema = yup.object({
  customerName: yup.string().trim().required('Your name is required').max(120, 'Name is too long'),
  contactNumber: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(PHONE_RE, 'Enter a valid phone number'),
  whatsappNumber: yup
    .string()
    .trim()
    .required('WhatsApp number is required so you can receive ticket updates')
    .matches(PHONE_RE, 'Enter a valid WhatsApp number'),
  email: yup
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .email('Enter a valid email address'),
  companyName: optionalText(160),
  siteName: optionalText(160),
  location: optionalText(250),
  product: optionalText(160),
  productModel: optionalText(100),
  productSerialNumber: optionalText(100),
  category: yup.string().required('Select a complaint category'),
  priority: yup.string().required('Select urgency'),
  subject: yup.string().trim().required('Subject is required').max(160, 'Subject is too long'),
  description: yup
    .string()
    .trim()
    .required('Please describe the issue')
    .max(5000, 'Description is too long'),
});

const defaultValues = {
  customerName: '',
  contactNumber: '',
  whatsappNumber: '',
  email: '',
  companyName: '',
  siteName: '',
  location: '',
  product: '',
  productModel: '',
  productSerialNumber: '',
  category: 'Product Quality',
  priority: 'Medium',
  subject: '',
  description: '',
};

export default function ComplaintRegisterPage({ embedded = false }) {
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const previews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onSelectFiles = (event) => {
    setPhotoError('');
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;

    if (photos.length + incoming.length > MAX_PHOTOS) {
      setPhotoError(`You can attach at most ${MAX_PHOTOS} photos.`);
      return;
    }

    const invalid = incoming.find((file) => {
      if (!file.type.startsWith('image/')) return true;
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) return true;
      return false;
    });

    if (invalid) {
      setPhotoError(`Only image files up to ${MAX_PHOTO_MB} MB are allowed.`);
      return;
    }

    setPhotos((prev) => [...prev, ...incoming]);
    event.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      });

      photos.forEach((file) => formData.append('photos', file));

      const res = await complaintApi.publicCreate(formData);
      const ticketResult = res.data?.data || res.data;
      setResult(ticketResult);
      fireCelebrationConfetti();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Could not submit the complaint. Please verify your details or call our service desk.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (result) {
      fireCelebrationConfetti();
    }
  }, [result]);

  const resetForm = () => {
    setResult(null);
    setPhotos([]);
    setPhotoError('');
    setSubmitError('');
    methods.reset(defaultValues);
  };

  return (
    <Box
      sx={{
        minHeight: embedded ? 'auto' : '100vh',
        bgcolor: embedded ? 'transparent' : '#f8fafc',
        py: embedded ? 0 : { xs: 3, sm: 6 },
        px: embedded ? 0 : { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ maxWidth: embedded ? '100%' : 760, mx: embedded ? 0 : 'auto' }}>
        {embedded ? (
          <PageHeader
            title="Public Support Desk"
            subtitle="Customer-facing portal for self-service complaint registration and defect reporting"
          />
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 42, width: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>
                  Customer Service Desk
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Public Self-Service Complaint Registration
                </Typography>
              </Box>
            </Stack>

            <TwoButtonPill
              value="/support"
              options={[
                { label: 'Submit Complaint', value: '/support', icon: <SupportAgentIcon fontSize="small" />, to: '/support' },
                { label: 'Track Status', value: '/support/track', icon: <SearchIcon fontSize="small" />, to: '/support/track' },
              ]}
            />
          </Stack>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4.5 },
            borderRadius: '16px',
            border: '2px solid transparent',
            background:
              'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%) padding-box, linear-gradient(135deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) border-box',
            boxShadow: '0 10px 32px rgba(56, 32, 10, 0.08), 0 2px 8px rgba(229, 184, 92, 0.12)',
          }}
        >
          {result ? (
            <Stack alignItems="center" spacing={2} sx={{ py: { xs: 2, sm: 4 }, textAlign: 'center' }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 68, color: 'success.main' }} />
              <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
                Complaint Registered Successfully
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
                Thank you. Your complaint has been recorded in our centralized ticketing system. An engineer will be assigned promptly.
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  px: 4,
                  py: 2,
                  border: '2px dashed #0f766e',
                  borderRadius: '12px',
                  bgcolor: '#f0fdfa',
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#0f766e" sx={{ textTransform: 'uppercase' }}>
                  Your Unique Ticket ID
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#0f766e', letterSpacing: 1, my: 0.5 }}>
                  {result.ticketNumber || result.ticketNo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Keep this ID safe to track status and communicate with our service team.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  to={`/track?ticket=${result.ticketNumber || result.ticketNo}`}
                  variant="contained"
                  sx={{
                    bgcolor: '#0f766e',
                    '&:hover': { bgcolor: '#0d655e' },
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Track This Ticket Live
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ borderRadius: '8px', px: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  Register Another Complaint
                </Button>
              </Stack>
            </Stack>
          ) : (
            <FormProvider {...methods}>
              <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a' }}>
                    Submit a Service Complaint
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fill out the form below to receive an instant Ticket ID. No account or password required.
                  </Typography>
                </Box>

                <Divider />

                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="customerName" label="Your Full Name *" autoFocus autoComplete="name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="contactNumber" label="Phone / Mobile Number *" autoComplete="tel" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name="whatsappNumber"
                      label="WhatsApp Number *"
                      autoComplete="tel"
                      helperText="Required — ticket create, assign, and resolve updates are sent on WhatsApp only"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email Address (optional)" type="email" autoComplete="email" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="companyName" label="Company / Railway Division (optional)" autoComplete="organization" />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Site & Equipment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="siteName" label="Site / Station / Plant Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="location" label="Location / City / State" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="product" label="Product / Equipment Name" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="productModel" label="Model / Sub-system" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="productSerialNumber"
                      label="Serial Number (for 2-yr Warranty)"
                      placeholder="e.g. SN-88219"
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Complaint Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect name="category" label="Complaint Category *" options={categorySelectOptions} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect name="priority" label="Urgency / Severity *" options={PUBLIC_PRIORITIES} />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="subject" label="Complaint Subject *" placeholder="Brief summary of the breakdown or fault" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField
                      name="description"
                      label="Detailed Description *"
                      placeholder="Please describe symptoms, alarms, error codes, steps already attempted, and impact on operations."
                      multiline
                      minRows={4}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    4. Photos / Evidence (Optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Attach up to {MAX_PHOTOS} photos of the equipment or error messages (max {MAX_PHOTO_MB} MB each).
                  </Typography>

                  <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap">
                    {previews.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: 'relative',
                          width: 84,
                          height: 84,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <Box
                          component="img"
                          src={item.url}
                          alt={`photo-${idx}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removePhoto(idx)}
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
                            p: 0.25,
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}

                    {photos.length < MAX_PHOTOS && (
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          width: 84,
                          height: 84,
                          borderRadius: '8px',
                          borderStyle: 'dashed',
                          borderColor: '#cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textTransform: 'none',
                          p: 0,
                        }}
                      >
                        <AddPhotoAlternateOutlinedIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
                          Add Photo
                        </Typography>
                        <input type="file" accept="image/*" multiple hidden onChange={onSelectFiles} />
                      </Button>
                    )}
                  </Stack>
                  {photoError && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                      {photoError}
                    </Typography>
                  )}
                </Box>

                {submitError && (
                  <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {submitError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    bgcolor: '#0f766e',
                    '&:hover': { bgcolor: '#0d655e' },
                    py: 1.25,
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {submitting ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Submitting Complaint...</span>
                    </Stack>
                  ) : (
                    'Submit Service Complaint'
                  )}
                </Button>
              </Stack>
            </FormProvider>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
