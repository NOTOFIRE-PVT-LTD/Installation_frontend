import Box from '@mui/material/Box';
import DashboardAppBar from './DashboardAppBar';
import DashboardLayoutDrawers from './DashboardLayoutDrawers';
import DashboardLayoutMain from './DashboardLayoutMain';
import DashboardLayoutSnackbar from './DashboardLayoutSnackbar';

export default function DashboardLayoutView({
  isMobile,
  isSuperAdmin,
  showAppsHome,
  user,
  snackbar,
  layout,
  onHideSnackbar,
}) {
  return (
    <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
      <DashboardAppBar
        drawerWidth={layout.drawerWidth}
        collapsed={layout.collapsed}
        isMobile={isMobile}
        onToggleSidebar={() => layout.handleToggleSidebar(isMobile)}
        isSuperAdmin={isSuperAdmin}
        showAppsHome={showAppsHome}
        user={user}
        anchorEl={layout.anchorEl}
        setAnchorEl={layout.setAnchorEl}
        onProfile={layout.navigateToProfile}
        onLogout={layout.handleLogout}
      />
      <DashboardLayoutDrawers
        drawerWidth={layout.drawerWidth}
        collapsed={layout.collapsed}
        mobileOpen={layout.mobileOpen}
        onMobileClose={() => layout.setMobileOpen(false)}
      />
      <DashboardLayoutMain
        drawerWidth={layout.drawerWidth}
        impersonatorAdmin={layout.impersonatorAdmin}
        user={user}
        onExitImpersonation={layout.handleExitImpersonation}
      />
      <DashboardLayoutSnackbar snackbar={snackbar} isMobile={isMobile} onClose={onHideSnackbar} />
    </Box>
  );
}