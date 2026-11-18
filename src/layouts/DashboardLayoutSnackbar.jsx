import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function DashboardLayoutSnackbar({ snackbar, isMobile, onClose }) {
  const horizontal = isMobile ? 'center' : 'right';

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal }}
    >
      <Alert severity={snackbar.severity} onClose={onClose} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}