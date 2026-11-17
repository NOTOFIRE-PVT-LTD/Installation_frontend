import Button from '@mui/material/Button';

/** Navbar control matching P&L “Apps” — back to Centralisation chooser. */
export default function DashboardAppsHomeLink() {
  return (
    <Button
      href="/apps"
      size="small"
      variant="outlined"
      sx={{
        flexShrink: 0,
        textTransform: 'none',
        fontWeight: 700,
        borderColor: 'rgba(86, 51, 16, 0.35)',
        color: '#563310',
        bgcolor: '#FAE2B4',
        px: 1.5,
        '&:hover': {
          borderColor: '#563310',
          bgcolor: '#f3d59a',
        },
      }}
    >
      Apps
    </Button>
  );
}
