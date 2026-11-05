import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../features/auth/authThunks';
import { getDefaultLandingPath } from '../../routes/routeConfig';

const schema = yup.object({
  email: yup.string().required('Username or Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, permissions } = useAuth();
  const { status, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    const res = await dispatch(login(values));
    if (!res.error) {
      const from = location.state?.from?.pathname;
      const fallback = getDefaultLandingPath(user, permissions);
      navigate(from || fallback || '/dashboard', { replace: true });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 395,
        borderRadius: '26px !important',
        p: { xs: 3.5, sm: 4.5 },
        // Main Login Card Background: Top-to-Bottom Linear Gradient (180deg)
        // Top: Dark Cocoa Brown (#583714) | Middle: rgba(88, 55, 20, 0.95) | Bottom: Deep Chestnut Brown (#3a230b)
        background:
          'linear-gradient(180deg, #583714 0%, rgba(88, 55, 20, 0.95) 50%, #3a230b 100%) !important',
        // Glass Edge Highlight: 1px solid rgba(255, 233, 151, 0.3)
        border: '1px solid rgba(255, 233, 151, 0.3) !important',
        // 3D Card Depth: box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7)
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 233, 151, 0.15), inset 0 1px 1px rgba(255, 233, 151, 0.4) !important',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 800,
          color: '#FFE997',
          textAlign: 'center',
          letterSpacing: '0.12em',
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          mb: 3,
          textTransform: 'uppercase',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        LOG IN
      </Typography>

      {/* If already logged in, show active session banner instead of redirecting */}
      {isAuthenticated && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: '14px',
            bgcolor: 'rgba(255, 233, 151, 0.15)',
            border: '1px solid rgba(255, 233, 151, 0.35)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#FFE997', fontWeight: 600, mb: 1, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            Signed in as <strong>{user?.name || user?.email}</strong>
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => navigate(getDefaultLandingPath(user, permissions))}
            sx={{
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FFE997 0%, #A37836 50%, #583714 100%) !important',
              color: '#583714 !important',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.75rem',
              px: 2,
              py: 0.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFF3BD 0%, #B88942 50%, #6E451A 100%) !important',
              },
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: '12px',
            bgcolor: 'rgba(185, 28, 28, 0.35)',
            color: '#FED7D7',
            border: '1px solid rgba(239, 68, 68, 0.5)',
          }}
        >
          {error}
        </Alert>
      )}

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* First Input: Solid soft gold fill #FFE997 with dark brown inner border (#583714) */}
        <Box>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Box
                sx={{
                  borderRadius: '999px',
                  bgcolor: '#FFE997',
                  px: 3,
                  py: 0.75,
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 'inset 0 1px 3px rgba(88, 55, 20, 0.18)',
                  border: errors.email ? '2px solid #ef4444' : '1.5px solid #583714',
                  transition: 'box-shadow 0.2s',
                  '&:focus-within': {
                    boxShadow: '0 0 0 3px rgba(255, 233, 151, 0.5)',
                  },
                }}
              >
                <InputBase
                  {...field}
                  fullWidth
                  placeholder="Username or Email"
                  autoFocus
                  autoComplete="username"
                  sx={{
                    color: '#583714', // Dark brown text on gold
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    '& input::placeholder': {
                      color: '#583714',
                      opacity: 0.85,
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            )}
          />
          {errors.email && (
            <Typography variant="caption" sx={{ color: '#FED7D7', mt: 0.5, ml: 2, display: 'block' }}>
              {errors.email.message}
            </Typography>
          )}
        </Box>

        {/* Second Input: Solid luxury brown fill #583714 with subtle golden glow border (rgba(255, 233, 151, 0.4)) */}
        <Box>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Box
                sx={{
                  borderRadius: '999px',
                  bgcolor: '#583714',
                  px: 2.5,
                  py: 0.75,
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  border: errors.password ? '2px solid #ef4444' : '1px solid rgba(255, 233, 151, 0.4)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:focus-within': {
                    borderColor: '#FFE997',
                    boxShadow: '0 0 0 3px rgba(255, 233, 151, 0.35)',
                  },
                }}
              >
                <LockOutlinedIcon sx={{ color: '#FFE997', fontSize: 20 }} />
                <InputBase
                  {...field}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  sx={{
                    color: '#FFE997', // Gold text on luxury brown
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    '& input::placeholder': {
                      color: '#FFE997',
                      opacity: 0.75,
                      fontWeight: 500,
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    color: '#FFE997',
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.2)' },
                  }}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                  ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            )}
          />
          {errors.password && (
            <Typography variant="caption" sx={{ color: '#FED7D7', mt: 0.5, ml: 2, display: 'block' }}>
              {errors.password.message}
            </Typography>
          )}
        </Box>

        {/* Log In Button: Horizontal Metallic Gradient (90deg angle)
            0% -> #FFE997 (Bright Gold) | 50% -> #A37836 (Mid Metallic Gold) | 100% -> #583714 (Luxury Dark Brown) */}
        <Button
          type="submit"
          fullWidth
          disabled={status === 'loading'}
          sx={{
            mt: 1,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '999px',
            minHeight: 52,
            background:
              'linear-gradient(90deg, #FFE997 0%, #A37836 50%, #583714 100%) !important',
            color: '#583714 !important',
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(88, 55, 20, 0.45), 0 2px 8px rgba(255, 233, 151, 0.3)',
            transition: 'all 0.25s ease, transform 0.15s ease',
            '&:active': {
              transform: 'scale(0.98)',
            },
            // Kiro signature expanding bubble animation on hover
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FFFFFF 0%, #FFF3BD 50%, #FFE997 100%)',
              transform: 'translateY(55%) scale(0)',
              transformOrigin: 'center bottom',
              transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
              opacity: 0,
              zIndex: 1,
              pointerEvents: 'none',
            },
            '&:hover::after': {
              transform: 'translateY(0) scaleX(1.5) scaleY(2.2)',
              opacity: 0.95,
            },
            '&:hover': {
              boxShadow: '0 10px 28px rgba(88, 55, 20, 0.6), 0 0 20px rgba(255, 233, 151, 0.5)',
            },
            '&.Mui-disabled': {
              background: '#8A7045 !important',
              color: '#D4C4A8 !important',
            },
            '& > *': {
              position: 'relative',
              zIndex: 2,
            },
          }}
        >
          {status === 'loading' ? (
            <CircularProgress size={24} sx={{ color: '#583714', position: 'relative', zIndex: 2 }} />
          ) : (
            <span style={{ position: 'relative', zIndex: 2 }}>Log In</span>
          )}
        </Button>

        {/* Links: Forgot Password & Create an Account */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 1, px: 1 }}
        >
          <Link
            component={RouterLink}
            to="/forgot-password"
            sx={{
              color: '#FFE997',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
              transition: 'color 0.15s ease',
              '&:hover': {
                color: '#FFFFFF',
                textDecoration: 'underline',
              },
            }}
          >
            Forgot Password?
          </Link>
          <Link
            component={RouterLink}
            to="/support"
            sx={{
              color: '#FFE997',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
              transition: 'color 0.15s ease',
              '&:hover': {
                color: '#FFFFFF',
                textDecoration: 'underline',
              },
            }}
          >
            Create an Account
          </Link>
        </Stack>

        {/* Subtle Bottom Branding */}
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: 'rgba(255, 233, 151, 0.65)',
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            pt: 1.5,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          Samchykeson Concepts
        </Typography>
      </Stack>
    </Paper>
  );
}
