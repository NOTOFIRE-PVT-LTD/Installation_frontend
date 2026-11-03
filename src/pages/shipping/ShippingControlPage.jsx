import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Navigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SlidingPills from '../../components/common/SlidingPills';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';
import { IMPORT_TABS, SHIPPING_TABS } from './companionTabs';

const SHIPPING_APP_URL = import.meta.env.VITE_SHIPPING_APP_URL || 'http://localhost:3002';
const IMPORT_APP_URL = import.meta.env.VITE_IMPORT_APP_URL || 'http://localhost:3003';

function embedPath(path) {
  return `${path === '/' ? '/' : path}?embed=1`;
}

function CompanionWorkspace({ app, baseUrl, title, subtitle, tabs, permissionKey }) {
  const { isSuperAdmin, permissions } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const current = tabs.some((tab) => tab.id === requested) ? requested : tabs[0].id;
  const tab = tabs.find((item) => item.id === current) || tabs[0];

  const iframeRef = useRef(null);
  const credsRef = useRef(null);
  const [ssoReady, setSsoReady] = useState(false);
  const [frameSrc, setFrameSrc] = useState('');
  const [error, setError] = useState('');

  const origin = String(baseUrl).replace(/\/$/, '');

  const postCreds = () => {
    const creds = credsRef.current;
    const win = iframeRef.current?.contentWindow;
    if (!creds || !win) return;
    win.postMessage({ type: 'valuecon-sso', email: creds.email, password: creds.password }, origin);
  };

  const setTab = (id) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== origin) return;
      if (event.data?.type === 'valuecon-sso-waiting') postCreds();
      if (event.data?.type === 'valuecon-sso-ready') setSsoReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .post('/companion/session', { app })
      .then((res) => {
        const email = res.data?.data?.email;
        const password = res.data?.data?.password;
        if (!email || !password) throw new Error('No session returned');
        credsRef.current = { email, password };
        const next = embedPath(tab.path);
        if (!cancelled) {
          setFrameSrc(`${origin}/valuecon-sso?next=${encodeURIComponent(next)}&v=pw`);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || `Could not open ${title}`);
        }
      });
    return () => {
      cancelled = true;
    };
    // Mint once per app open. Tab clicks reuse the session cookie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, origin, title]);

  useEffect(() => {
    if (!ssoReady) return;
    setFrameSrc(`${origin}${embedPath(tab.path)}`);
  }, [ssoReady, origin, tab.path]);

  const allowed = isSuperAdmin || Boolean(permissions?.[permissionKey]);
  if (!allowed) return <Navigate to="/" replace />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' } }}>
      {isSuperAdmin ? (
        <>
          <PageHeader title={title} subtitle={subtitle} />
          <Box sx={{ mb: 2 }}>
            <SlidingPills
              fullWidth
              value={current}
              onChange={setTab}
              items={tabs.map((item, index) => ({
                id: item.id,
                label: `${index + 1}. ${item.label}`,
              }))}
            />
          </Box>
        </>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 420, md: 560 },
          borderRadius: isSuperAdmin ? '16px' : 0,
          overflow: 'hidden',
          border: isSuperAdmin ? '1px solid #E2D3BE' : 'none',
          bgcolor: '#FFFDF8',
        }}
      >
        {error ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: '#3A230B' }}>{error}</Typography>
          </Box>
        ) : !frameSrc ? (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', minHeight: 320 }}>
            <CircularProgress size={28} sx={{ color: '#C99846' }} />
          </Box>
        ) : (
          <iframe
            ref={iframeRef}
            title={title}
            src={frameSrc}
            onLoad={postCreds}
            style={{ width: '100%', height: '100%', minHeight: 560, border: 0 }}
          />
        )}
      </Box>
    </Box>
  );
}

export default function ShippingControlPage() {
  return (
    <CompanionWorkspace
      app="shipping"
      baseUrl={SHIPPING_APP_URL}
      title="Shipping Control"
      subtitle="Dashboard, dispatches, shipments, bills, and masters in one place"
      tabs={SHIPPING_TABS}
      permissionKey="shipping"
    />
  );
}

export function ImportControlPage() {
  return (
    <CompanionWorkspace
      app="import"
      baseUrl={IMPORT_APP_URL}
      title="Import Control"
      subtitle="Dashboard, imports, inbox, payments, and masters in one place"
      tabs={IMPORT_TABS}
      permissionKey="importControl"
    />
  );
}
