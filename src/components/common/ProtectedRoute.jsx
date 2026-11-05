import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../../hooks/useAuth';

const EXTERNAL_LOGIN_URL = import.meta.env.VITE_CENTRAL_LOGIN_URL;

export default function ProtectedRoute() {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (bootstrapped && !isAuthenticated && EXTERNAL_LOGIN_URL) {
      window.location.replace(EXTERNAL_LOGIN_URL);
    }
  }, [bootstrapped, isAuthenticated]);

  if (!bootstrapped) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (EXTERNAL_LOGIN_URL) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
