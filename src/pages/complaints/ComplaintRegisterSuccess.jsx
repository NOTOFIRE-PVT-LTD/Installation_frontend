import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function ComplaintRegisterSuccess({ result, onReset }) {
  const ticketId = result.ticketNumber || result.ticketNo;
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: { xs: 2, sm: 4 }, textAlign: 'center' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 68, color: 'success.main' }} />
      <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
        Complaint Registered Successfully
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
        Thank you. Your complaint has been recorded in our centralized ticketing system. An engineer will be assigned promptly.
      </Typography>

      <Box
        sx={{
          mt: 1,
          px: 4,
          py: 2,
          border: '2px dashed #0f766e',
          borderRadius: '12px',
          bgcolor: '#f0fdfa',
        }}
      >
        <Typography variant="caption" fontWeight={700} color="#0f766e" sx={{ textTransform: 'uppercase' }}>
          Your Unique Ticket ID
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ color: '#0f766e', letterSpacing: 1, my: 0.5 }}>
          {ticketId}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Keep this ID safe to track status and communicate with our service team.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <Button
          component={Link}
          to={`/track?ticket=${ticketId}`}
          variant="contained"
          sx={{
            bgcolor: '#0f766e',
            '&:hover': { bgcolor: '#0d655e' },
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Track This Ticket Live
        </Button>
        <Button
          variant="outlined"
          onClick={onReset}
          sx={{ borderRadius: '8px', px: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Register Another Complaint
        </Button>
      </Stack>
    </Stack>
  );
}
