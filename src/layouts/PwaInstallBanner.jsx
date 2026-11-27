import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import usePwaInstall from '../hooks/usePwaInstall';

const DISMISS_KEY = 'pwa_install_dismissed';

/**
 * Only when Chrome offers a real install prompt (HTTPS + eligible).
 * Hidden otherwise — avoids the empty dark bar on HTTP/desktop.
 */
export default function PwaInstallBanner() {
  const { canInstall, installed, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1',
  );

  if (installed || dismissed || !canInstall) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 1400,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        p: 1.5,
        borderRadius: 2,
        bgcolor: '#241404',
        boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#FAE2B4' }}>
          Install VALUECON
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#FAE2B4', opacity: 0.9 }}>
          Add to your home screen for faster access and camera.
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        onClick={() => install()}
        sx={{ bgcolor: '#D4A34E', color: '#241404', fontWeight: 700, flexShrink: 0 }}
      >
        Install
      </Button>
      <IconButton
        size="small"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, '1');
          setDismissed(true);
        }}
        sx={{ color: '#FAE2B4' }}
        aria-label="Dismiss"
      >
        ✕
      </IconButton>
    </Box>
  );
}
