import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { APP_NAME } from '../utils/constants';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
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
        }}
      >
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
          {APP_NAME}
        </Typography>
        <Outlet />
      </Paper>
    </Box>
  );
}
