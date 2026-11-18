import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Outlet } from 'react-router-dom';

export default function DashboardLayoutMain({
  drawerWidth,
  impersonatorAdmin,
  user,
  onExitImpersonation,
}) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        overflowX: 'hidden',
        // Match Visits mobile gutters (~16px) across Attendance / Complaints / People.
        px: { xs: 2, sm: 2.5 },
        py: { xs: 1.5, sm: 2 },
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        transition: 'width 0.2s',
        bgcolor: '#F8F6F1',
        minHeight: '100vh',
      }}
    >
      <Toolbar />
      {impersonatorAdmin ? (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={onExitImpersonation}>
              Return to Admin
            </Button>
          }
        >
          Viewing as {user?.name} ({user?.role}) — logged in by {impersonatorAdmin.user?.name}
        </Alert>
      ) : null}
      <Outlet />
    </Box>
  );
}