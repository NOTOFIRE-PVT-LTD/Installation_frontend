import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { goToCentralLogin } from '../../utils/centralAuth';

/** Workspace has no staff login — send everyone to Centralisation. */
export default function CentralLoginRedirect() {
  useEffect(() => {
    goToCentralLogin();
  }, []);

  return (
    <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center', gap: 1.5, p: 3 }}>
      <CircularProgress size={28} />
      <Typography color="text.secondary">Redirecting to Valuecon login…</Typography>
    </Box>
  );
}
