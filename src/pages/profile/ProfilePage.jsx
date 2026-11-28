import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PageHeader from '../../components/common/PageHeader';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import ProfilePhoneField from './ProfilePhoneField';
import ProfilePhotoSection from './ProfilePhotoSection';
import ProfileChangePasswordForm from './ProfileChangePasswordForm';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../features/auth/authThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  mobileNumber: yup
    .string()
    .transform((v) => String(v || '').replace(/\D/g, '').slice(-10))
    .test('phone', 'Enter a valid 10-digit mobile number', (v) => !v || /^\d{10}$/.test(v)),
});

function buildProfileFormData(values, imageFile, removeImage) {
  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('mobileNumber', values.mobileNumber);
  if (imageFile) formData.append('profileImage', imageFile);
  else if (removeImage) formData.append('removeProfileImage', 'true');
  return formData;
}

async function executeProfileUpdate(dispatch, formData, setSaving, setRemoveImage, setImageFile) {
  setSaving(true);
  try {
    await dispatch(updateProfile(formData)).unwrap();
    dispatch(showSnackbar({ message: 'Profile updated successfully' }));
    setRemoveImage(false);
    setImageFile(null);
  } catch (err) {
    dispatch(showSnackbar({ message: err || 'Failed to update profile', severity: 'error' }));
  } finally {
    setSaving(false);
  }
}

function useProfileFormHandler(user, dispatch) {
  const [imagePreview, setImagePreview] = useState(user?.profileImage?.url || '');
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };
  const handleRemove = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(true);
  };
  const handleUndo = () => {
    setImagePreview(user?.profileImage?.url || '');
    setRemoveImage(false);
  };
  const onSubmit = (vals) =>
    executeProfileUpdate(
      dispatch,
      buildProfileFormData(vals, imageFile, removeImage),
      setSaving,
      setRemoveImage,
      setImageFile,
    );

  return { imagePreview, removeImage, saving, handleFile, handleRemove, handleUndo, onSubmit };
}

function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { imagePreview, removeImage, saving, handleFile, handleRemove, handleUndo, onSubmit } =
    useProfileFormHandler(user, dispatch);
  const methods = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
    },
  });

  return (
    <FormProvider {...methods}>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <ProfilePhotoSection
          user={user}
          imagePreview={imagePreview}
          onFileChange={handleFile}
          onRemove={handleRemove}
          onUndo={handleUndo}
          isRemoved={removeImage}
          hasOriginalPhoto={Boolean(user?.profileImage?.url)}
        />
        <RHFTextField name="name" label="Full Name" />
        <RHFTextField name="email" label="Email" disabled InputProps={{ readOnly: true }} />
        <ProfilePhoneField />
        <Stack direction="row" sx={{ mt: 'auto', pt: 1 }}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

function ProfileCard({ title, children }) {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );
}

export default function ProfilePage() {
  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', px: { xs: 0.5, sm: 0 } }}>
      <PageHeader title="My Profile" subtitle="Manage your personal information and password" />
      <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <ProfileCard title="Profile Information">
            <ProfileForm />
          </ProfileCard>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <ProfileCard title="Change Password">
            <ProfileChangePasswordForm />
          </ProfileCard>
        </Grid>
      </Grid>
    </Box>
  );
}
