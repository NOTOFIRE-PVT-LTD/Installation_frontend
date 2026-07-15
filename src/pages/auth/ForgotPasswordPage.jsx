import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { authApi } from '../../api/authApi';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setStatus('loading');
    try {
      const { data } = await authApi.forgotPassword(values.email);
      setMessage(data.message);
      setStatus('succeeded');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setStatus('failed');
    }
  };

  return (
    <FormProvider {...methods}>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        Enter your email and we'll send you a password reset link.
      </Typography>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)}>
        {status === 'succeeded' && <Alert severity="success">{message}</Alert>}
        {status === 'failed' && <Alert severity="error">{message}</Alert>}
        <RHFTextField name="email" label="Email" autoFocus />
        <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Send reset link'}
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
