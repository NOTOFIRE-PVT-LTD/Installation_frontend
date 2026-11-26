import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { portalApi } from '../../api/portalApi';

/** Embed LeadTrack CRM inside Workspace via SSO (same host /lead-track). */
export default function LeadTrackWorkspacePage() {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await portalApi.openLeadTrack();
        let url = res.data?.data?.url;
        if (!url) throw new Error('missing url');
        // Strip LeadTrack chrome; horizontal tabs only inside Workspace.
        url += url.includes('?') ? '&embed=1' : '?embed=1';
        if (!cancelled) setSrc(url);
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!src) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 72px)', width: '100%', bgcolor: '#fff' }}>
      <Box
        component="iframe"
        title="LeadTrack"
        src={src}
        sx={{ border: 0, width: '100%', height: '100%', display: 'block' }}
        allow="clipboard-read; clipboard-write"
      />
    </Box>
  );
}
