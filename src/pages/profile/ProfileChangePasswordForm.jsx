import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { useAppDispatch } from '../../app/hooks';
import { changePassword } from '../../features/auth/authThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

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

async function executePasswordChange(dispatch, values, setSaving, methods) {
  setSaving(true);
  try {
    await dispatch(
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    ).unwrap();
    dispatch(showSnackbar({ message: 'Password changed successfully' }));
    methods.reset();
  } catch (err) {
    dispatch(showSnackbar({ message: err || 'Failed to change password', severity: 'error' }));
  } finally {
    setSaving(false);
  }
}

export default function ProfileChangePasswordForm() {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const methods = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  return (
    <FormProvider {...methods}>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={methods.handleSubmit((v) => executePasswordChange(dispatch, v, setSaving, methods))}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <RHFTextField name="currentPassword" label="Current Password" type="password" />
        <RHFTextField name="newPassword" label="New Password" type="password" />
        <RHFTextField name="confirmPassword" label="Confirm New Password" type="password" />
        <Stack direction="row" sx={{ mt: 'auto', pt: 1 }}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Updating…' : 'Change Password'}
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
