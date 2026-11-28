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
      className="dashboard-main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        transition: 'width 0.2s',
        boxSizing: 'border-box',
        p: 0,
      }}
    >
      <Toolbar />
      <div className="dashboard-main__pad">
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
      </div>
    </Box>
  );
}
