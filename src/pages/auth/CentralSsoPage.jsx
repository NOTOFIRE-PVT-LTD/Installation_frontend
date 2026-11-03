import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { authApi } from '../../api/authApi';
import { setCredentials, sessionExpired } from '../../features/auth/authSlice';
import { getDefaultLandingPath } from '../../routes/routeConfig';

/** Survives React Strict Mode remount in the same page load. */
const ssoInflight = new Map();

export default function CentralSsoPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const code = params.get('code');
    if (!code) {
      setError('Missing SSO code');
      return undefined;
    }

    let promise = ssoInflight.get(code);
    if (!promise) {
      promise = (async () => {
        // Drop any leftover Workspace cookie (e.g. Admin test) before redeeming SSO.
        try {
          await authApi.logout();
        } catch {
          /* ignore */
        }
        const { data } = await authApi.centralSso({ code });
        return data.data;
      })();
      ssoInflight.set(code, promise);
    }

    promise
      .then((payload) => {
        if (cancelled) return;
        dispatch(sessionExpired());
        dispatch(
          setCredentials({
            user: payload.user,
            permissions: payload.permissions,
            accessToken: payload.accessToken,
          }),
        );
        navigate(getDefaultLandingPath(payload.user, payload.permissions), { replace: true });
      })
      .catch((err) => {
        ssoInflight.delete(code);
        if (!cancelled) {
          setError(err.response?.data?.message || 'SSO login failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params, dispatch, navigate]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center', p: 3 }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={28} />
          <Typography sx={{ mt: 2 }}>Opening Workspace…</Typography>
        </Box>
      )}
    </Box>
  );
}
