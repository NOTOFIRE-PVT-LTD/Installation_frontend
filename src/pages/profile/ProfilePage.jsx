import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PageHeader from '../../components/common/PageHeader';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, changePassword } from '../../features/auth/authThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  mobileNumber: yup.string().required('Mobile number is required'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState(user?.profileImage?.url || '');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const methods = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '', mobileNumber: user?.mobileNumber || '' },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    setSaving(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('mobileNumber', values.mobileNumber);
    if (imageFile) formData.append('profileImage', imageFile);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      dispatch(showSnackbar({ message: 'Profile updated successfully' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update profile', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Avatar src={imagePreview} sx={{ width: 72, height: 72 }}>
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Button component="label" variant="outlined" size="small">
            Change Photo
            <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </Button>
        </Stack>
        <RHFTextField name="name" label="Full Name" />
        <RHFTextField name="mobileNumber" label="Mobile Number" />
        <Stack direction="row">
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const methods = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await dispatch(
        changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      ).unwrap();
      dispatch(showSnackbar({ message: 'Password changed successfully' }));
      methods.reset();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to change password', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)}>
        <RHFTextField name="currentPassword" label="Current Password" type="password" />
        <RHFTextField name="newPassword" label="New Password" type="password" />
        <RHFTextField name="confirmPassword" label="Confirm New Password" type="password" />
        <Stack direction="row">
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Updating…' : 'Change Password'}
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your personal information and password" />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ProfileForm />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ChangePasswordForm />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
