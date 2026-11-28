import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../../hooks/useAuth';
import { usePortalAccess } from '../../pages/portal/usePortalAccess';
import { openPnlApp } from '../../pages/portal/portalAppActions';

const EXTERNAL_LOGIN_URL = import.meta.env.VITE_CENTRAL_LOGIN_URL;

function redirectPnlFallback() {
  const pnlUrl = (import.meta.env.VITE_PNL_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
  window.location.replace(`${pnlUrl}/`);
}

export default function ProtectedRoute() {
  const { isAuthenticated, bootstrapped, user } = useAuth();
  const { access, ready } = usePortalAccess(isAuthenticated);
  const location = useLocation();

  const isPnlOnly = Boolean(
    (ready && !access.workspace) || user?.portalSource === 'pnl'
  );

  useEffect(() => {
    if (bootstrapped && !isAuthenticated && EXTERNAL_LOGIN_URL) {
      window.location.replace(EXTERNAL_LOGIN_URL);
    }
  }, [bootstrapped, isAuthenticated]);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated) return;
    if (isPnlOnly && location.pathname !== '/apps') {
      openPnlApp({ setError: () => {}, setBusy: () => {} }).catch(redirectPnlFallback);
    }
  }, [bootstrapped, isAuthenticated, isPnlOnly, location.pathname]);

  if (!bootstrapped || (isPnlOnly && location.pathname !== '/apps')) {
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
