import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { authApi } from '../../api/authApi';
import AuthPasswordCard from './AuthPasswordCard';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setStatus('loading');
    try {
      const { data } = await authApi.forgotPassword(values.email);
      setMessage(data.message || 'If that email exists, a reset link was sent.');
      setStatus('succeeded');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setStatus('failed');
    }
  };

  return (
    <AuthPasswordCard
      title="Forgot password"
      lead="Enter your email and we will send a reset link."
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
          <RHFTextField name="email" label="Email" autoFocus />
          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </FormProvider>
    </AuthPasswordCard>
  );
}
