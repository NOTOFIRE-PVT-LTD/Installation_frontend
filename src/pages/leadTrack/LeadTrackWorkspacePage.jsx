import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'react-router-dom';
import SlidingPills from '../../components/common/SlidingPills';
import { portalApi } from '../../api/portalApi';
import { useAuth } from '../../hooks/useAuth';
import { LEADTRACK_TABS, tabIdForPath } from './leadTrackTabs';

function leadTrackOrigin() {
  return `${window.location.origin}/lead-track`;
}

function embedUrl(path, bust = false) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const t = bust ? `&_=${Date.now()}` : '';
  return `${leadTrackOrigin()}${p}?embed=1${t}`;
}

function ssoUrlWithNext(ssoUrl, path) {
  const next = path.startsWith('/') ? path : `/${path}`;
  const join = ssoUrl.includes('?') ? '&' : '?';
  return `${ssoUrl}${join}embed=1&next=${encodeURIComponent(next)}`;
}

export default function LeadTrackWorkspacePage() {
  const { isSuperAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const current = LEADTRACK_TABS.some((t) => t.id === requested)
    ? requested
    : LEADTRACK_TABS[0].id;
  const tab = useMemo(
    () => LEADTRACK_TABS.find((t) => t.id === current) || LEADTRACK_TABS[0],
    [current],
  );

  const [ready, setReady] = useState(false);
  const [sessionOk, setSessionOk] = useState(false);
  const [error, setError] = useState('');
  const [frameSrc, setFrameSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await portalApi.openLeadTrack();
        const url = res.data?.data?.url;
        if (!url) throw new Error('missing url');
        if (cancelled) return;
        setFrameSrc(ssoUrlWithNext(url, tab.path));
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Could not open LeadTrack',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sidebar / URL tab is source of truth for the iframe page.
  useEffect(() => {
    if (!sessionOk) return;
    setFrameSrc(embedUrl(tab.path, true));
  }, [sessionOk, tab.path]);

  const setTab = useCallback(
    (id) => {
      const next = new URLSearchParams(params);
      next.set('tab', id);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  // If iframe navigates (e.g. after actions), keep Workspace tab highlight in sync.
  useEffect(() => {
    function onMsg(event) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== 'leadtrack' || data.type !== 'path') return;
      const id = tabIdForPath(data.path);
      if (id && id !== current) setTab(id);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [current, setTab]);

  if (error) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!ready || !frameSrc) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
        <CircularProgress size={28} sx={{ color: '#C99846' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        height: { xs: 'calc(100dvh - 112px)', sm: 'calc(100dvh - 96px)' },
        gap: 0.75,
        minWidth: 0,
      }}
    >
      {isSuperAdmin ? (
        <SlidingPills
          fullWidth
          value={current}
          onChange={setTab}
          items={LEADTRACK_TABS.map((item, index) => ({
            id: item.id,
            label: `${index + 1}. ${item.label}`,
          }))}
        />
      ) : null}
      <Box
        component="iframe"
        title="LeadTrack"
        key={sessionOk ? tab.id : 'sso'}
        src={frameSrc}
        onLoad={() => setSessionOk(true)}
        sx={{
          border: 0,
          width: '100%',
          flex: 1,
          minHeight: 0,
          display: 'block',
          background: 'transparent',
        }}
        allow="clipboard-read; clipboard-write"
      />
    </Box>
  );
}
