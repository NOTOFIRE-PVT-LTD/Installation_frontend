import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { authApi } from '../../api/authApi';
import AuthPasswordCard from './AuthPasswordCard';

const schema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
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
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setStatus('loading');
    try {
      const { data } = await authApi.resetPassword(token, values.password);
      setMessage(data.message || 'Password updated.');
      setStatus('succeeded');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset link is invalid or expired');
      setStatus('failed');
    }
  };

  return (
    <AuthPasswordCard
      title="Reset password"
      lead="Choose a new password for your account."
    >
      <FormProvider {...methods}>
        <form className="form-grid login-form-body" onSubmit={methods.handleSubmit(onSubmit)}>
          {status === 'succeeded' ? (
            <div className="alert alert--success" role="status">
              {message}
            </div>
          ) : null}
          {status === 'failed' ? (
            <div className="alert alert--error" role="alert">
              {message}
            </div>
          ) : null}
          <RHFTextField name="password" label="New password" type="password" autoFocus />
          <RHFTextField name="confirmPassword" label="Confirm new password" type="password" />
          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </FormProvider>
    </AuthPasswordCard>
  );
}
