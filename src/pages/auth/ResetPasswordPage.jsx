import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { authApi } from '../../api/authApi';

const schema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    setStatus('loading');
    try {
      const { data } = await authApi.resetPassword(token, values.password);
      setMessage(data.message);
      setStatus('succeeded');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset link is invalid or expired');
      setStatus('failed');
    }
  };

  return (
    <FormProvider {...methods}>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        Choose a new password for your account.
      </Typography>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)}>
        {status === 'succeeded' && <Alert severity="success">{message}</Alert>}
        {status === 'failed' && <Alert severity="error">{message}</Alert>}
        <RHFTextField name="password" label="New Password" type="password" autoFocus />
        <RHFTextField name="confirmPassword" label="Confirm New Password" type="password" />
        <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
          {status === 'loading' ? 'Resetting…' : 'Reset password'}
        </Button>
        <Typography variant="body2" textAlign="center">
          <Link component={RouterLink} to="/login">
            Back to login
          </Link>
        </Typography>
      </Stack>
    </FormProvider>
  );
}
