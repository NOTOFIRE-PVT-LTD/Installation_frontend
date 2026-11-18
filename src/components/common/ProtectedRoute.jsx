import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../../hooks/useAuth';
import { goToCentralLogin } from '../../utils/centralAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, bootstrapped } = useAuth();

  useEffect(() => {
    if (bootstrapped && !isAuthenticated) {
      goToCentralLogin();
    }
  }, [bootstrapped, isAuthenticated]);

  if (!bootstrapped || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
