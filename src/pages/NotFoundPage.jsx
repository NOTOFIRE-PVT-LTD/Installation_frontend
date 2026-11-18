import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultLandingPath } from '../routes/routeConfig';
import { goToCentralLogin } from '../utils/centralAuth';

export default function NotFoundPage({ code = 404, message = 'Page not found' }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, permissions } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 2 }}>
      <Typography variant="h2" fontWeight={700} color="primary">
        {code}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          if (isAuthenticated) navigate(getDefaultLandingPath(user, permissions), { replace: true });
          else goToCentralLogin();
        }}
      >
        Go Home
      </Button>
    </Box>
  );
}
