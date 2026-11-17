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
  newPassword: yup
    .string()
    .min(8, 'Must be at least 8 characters')
    .required('New password is required')
    .notOneOf([yup.ref('currentPassword')], 'Try a different password. This was used previously.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

function ProfilePhotoSection({ user, imagePreview, onFileChange, onRemove, onUndo, isRemoved, hasOriginalPhoto }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
      <Avatar src={imagePreview} sx={{ width: 72, height: 72, bgcolor: '#e0e0e0', color: '#555', fontWeight: 600 }}>
        {user?.name?.[0]?.toUpperCase()}
      </Avatar>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Button component="label" variant="outlined" size="small">
          Change Photo
          <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
        </Button>
        {imagePreview ? (
          <Button variant="outlined" color="error" size="small" onClick={onRemove}>
            Delete Photo
          </Button>
        ) : null}
        {isRemoved && hasOriginalPhoto ? (
          <Button variant="text" size="small" color="inherit" onClick={onUndo} sx={{ textTransform: 'none' }}>
            Undo
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}

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
  const handleRemove = () => { setImageFile(null); setImagePreview(''); setRemoveImage(true); };
  const handleUndo = () => { setImagePreview(user?.profileImage?.url || ''); setRemoveImage(false); };
  const onSubmit = (vals) => executeProfileUpdate(dispatch, buildProfileFormData(vals, imageFile, removeImage), setSaving, setRemoveImage, setImageFile);

  return { imagePreview, removeImage, saving, handleFile, handleRemove, handleUndo, onSubmit };
}

function ProfileFields({ saving }) {
  return (
    <>
      <RHFTextField name="name" label="Full Name" />
      <RHFTextField name="mobileNumber" label="Mobile Number" />
      <Stack direction="row" sx={{ mt: 'auto', pt: 1 }}>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Stack>
    </>
  );
}

function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { imagePreview, removeImage, saving, handleFile, handleRemove, handleUndo, onSubmit } = useProfileFormHandler(user, dispatch);
  const methods = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '', mobileNumber: user?.mobileNumber || '' },
  });

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProfilePhotoSection
          user={user}
          imagePreview={imagePreview}
          onFileChange={handleFile}
          onRemove={handleRemove}
          onUndo={handleUndo}
          isRemoved={removeImage}
          hasOriginalPhoto={Boolean(user?.profileImage?.url)}
        />
        <ProfileFields saving={saving} />
      </Stack>
    </FormProvider>
  );
}

async function executePasswordChange(dispatch, values, setSaving, methods) {
  setSaving(true);
  try {
    await dispatch(changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })).unwrap();
    dispatch(showSnackbar({ message: 'Password changed successfully' }));
    methods.reset();
  } catch (err) {
    dispatch(showSnackbar({ message: err || 'Failed to change password', severity: 'error' }));
  } finally {
    setSaving(false);
  }
}

function PasswordFields({ saving }) {
  return (
    <>
      <RHFTextField name="currentPassword" label="Current Password" type="password" />
      <RHFTextField name="newPassword" label="New Password" type="password" />
      <RHFTextField name="confirmPassword" label="Confirm New Password" type="password" />
      <Stack direction="row" sx={{ mt: 'auto', pt: 1 }}>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Updating…' : 'Change Password'}
        </Button>
      </Stack>
    </>
  );
}

function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const methods = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (values) => executePasswordChange(dispatch, values, setSaving, methods);

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PasswordFields saving={saving} />
      </Stack>
    </FormProvider>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your personal information and password" />
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Profile Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <ProfileForm />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Change Password</Typography>
            <Divider sx={{ mb: 3 }} />
            <ChangePasswordForm />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
