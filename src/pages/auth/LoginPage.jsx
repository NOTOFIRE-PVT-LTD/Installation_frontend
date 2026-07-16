import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../features/auth/authThunks';
import { getDefaultLandingPath } from '../../routes/routeConfig';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, permissions } = useAuth();
  const { status, error } = useAppSelector((state) => state.auth);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const fallback = getDefaultLandingPath(user, permissions);
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, location.state]);

  const onSubmit = (values) => {
    dispatch(login(values));
  };

  return (
    <FormProvider {...methods}>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: { xs: 2, sm: 3 } }}>
        Sign in to manage your site installation reports
      </Typography>
      <Stack component="form" spacing={2.5} onSubmit={methods.handleSubmit(onSubmit)}>
        {error && <Alert severity="error">{error}</Alert>}
        <RHFTextField name="email" label="Email" autoFocus />
        <RHFTextField name="password" label="Password" type="password" />
        <Stack direction="row" justifyContent="flex-end">
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Stack>
        <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </FormProvider>
  );
}
