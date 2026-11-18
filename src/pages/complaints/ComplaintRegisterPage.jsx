import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SearchIcon from '@mui/icons-material/Search';
import { complaintApi } from '../../api/complaintApi';
import { fireCelebrationConfetti } from '../../utils/confetti';
import logo from '../../assets/logo.png';
import TwoButtonPill from '../../components/common/TwoButtonPill';
import PageHeader from '../../components/common/PageHeader';
import { MAX_PHOTOS, MAX_PHOTO_MB, registerSchema, defaultRegisterValues } from './complaintRegisterSchema';
import ComplaintRegisterSuccess from './ComplaintRegisterSuccess';
import ComplaintRegisterFormFields from './ComplaintRegisterFormFields';

export default function ComplaintRegisterPage({ embedded = false }) {
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const methods = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: defaultRegisterValues,
  });

  const previews = useMemo(() => photos.map((file) => ({ file, url: URL.createObjectURL(file) })), [photos]);

  useEffect(() => () => { previews.forEach((p) => URL.revokeObjectURL(p.url)); }, [previews]);

  const onSelectFiles = (event) => {
    setPhotoError('');
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;
    if (photos.length + incoming.length > MAX_PHOTOS) {
      setPhotoError(`You can attach at most ${MAX_PHOTOS} photos.`);
      return;
    }
    const invalid = incoming.find((file) => !file.type.startsWith('image/') || file.size > MAX_PHOTO_MB * 1024 * 1024);
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
        if (val !== undefined && val !== null && val !== '') formData.append(key, val);
      });
      photos.forEach((file) => formData.append('photos', file));
      const res = await complaintApi.publicCreate(formData);
      setResult(res.data?.data || res.data);
      fireCelebrationConfetti();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || 'Could not submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (result) fireCelebrationConfetti();
  }, [result]);

  const resetForm = () => {
    setResult(null);
    setPhotos([]);
    setPhotoError('');
    setSubmitError('');
    methods.reset(defaultRegisterValues);
  };

  return (
    <Box sx={{ minHeight: embedded ? 'auto' : '100vh', bgcolor: embedded ? 'transparent' : '#f8fafc', py: embedded ? 0 : { xs: 3, sm: 6 }, px: embedded ? 0 : { xs: 2, sm: 3 } }}>
      <Box sx={{ maxWidth: embedded ? '100%' : 760, mx: embedded ? 0 : 'auto' }}>
        {embedded ? (
          <PageHeader title="Public Support Desk" subtitle="Customer-facing portal for self-service complaint registration and defect reporting" />
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="img" src={logo} alt="Logo" sx={{ height: 42, width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>Customer Service Desk</Typography>
                <Typography variant="caption" color="text.secondary">Public Self-Service Complaint Registration</Typography>
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

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4.5 }, borderRadius: '16px', border: '2px solid transparent', background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%) padding-box, linear-gradient(135deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) border-box', boxShadow: '0 10px 32px rgba(56, 32, 10, 0.08), 0 2px 8px rgba(229, 184, 92, 0.12)' }}>
          {result ? (
            <ComplaintRegisterSuccess result={result} onReset={resetForm} />
          ) : (
            <FormProvider {...methods}>
              <ComplaintRegisterFormFields
                onSubmit={methods.handleSubmit(onSubmit)}
                submitting={submitting}
                submitError={submitError}
                photos={photos}
                previews={previews}
                photoError={photoError}
                onSelectFiles={onSelectFiles}
                removePhoto={removePhoto}
              />
            </FormProvider>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
