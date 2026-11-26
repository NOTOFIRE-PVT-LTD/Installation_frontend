import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'react-router-dom';
import SlidingPills from '../../components/common/SlidingPills';
import { portalApi } from '../../api/portalApi';
import { LEADTRACK_TABS } from './leadTrackTabs';

function leadTrackOrigin() {
  return `${window.location.origin}/lead-track`;
}

function embedUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${leadTrackOrigin()}${p}?embed=1`;
}

export default function LeadTrackWorkspacePage() {
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
  const [error, setError] = useState('');
  const [frameSrc, setFrameSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await portalApi.openLeadTrack();
        let url = res.data?.data?.url;
        if (!url) throw new Error('missing url');
        url += url.includes('?') ? '&embed=1' : '?embed=1';
        if (cancelled) return;
        setFrameSrc(url);
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
  }, []);

  const setTab = useCallback(
    (id) => {
      const next = new URLSearchParams(params);
      next.set('tab', id);
      setParams(next, { replace: true });
      const hit = LEADTRACK_TABS.find((t) => t.id === id) || LEADTRACK_TABS[0];
      setFrameSrc(embedUrl(hit.path));
    },
    [params, setParams],
  );

  if (error) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!ready || !frameSrc) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={28} sx={{ color: '#C99846' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '78vh', gap: 1 }}>
      <SlidingPills
        fullWidth
        value={current}
        onChange={setTab}
        items={LEADTRACK_TABS.map((item, index) => ({
          id: item.id,
          label: `${index + 1}. ${item.label}`,
        }))}
      />
      <Box
        component="iframe"
        title="LeadTrack"
        key={tab.id}
        src={frameSrc}
        sx={{
          border: 0,
          width: '100%',
          flex: 1,
          minHeight: '70vh',
          display: 'block',
          background: 'transparent',
        }}
        allow="clipboard-read; clipboard-write"
      />
    </Box>
  );
}
