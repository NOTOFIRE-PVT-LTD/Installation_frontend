import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { APP_NAME } from '../utils/constants';
import logo from '../assets/logo.png';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F8 55%, #FBECEE 100%)',
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 5 },
          width: '100%',
          maxWidth: 420,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Valuecon"
          sx={{ display: 'block', height: 48, maxWidth: '100%', objectFit: 'contain', mx: 'auto', mb: 1.5 }}
        />
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 1, color: 'primary.main' }}>
          {APP_NAME}
        </Typography>
        <Outlet />
      </Paper>
    </Box>
  );
}
