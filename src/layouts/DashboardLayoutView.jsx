import Box from '@mui/material/Box';
import DashboardAppBar from './DashboardAppBar';
import DashboardLayoutDrawers from './DashboardLayoutDrawers';
import DashboardLayoutMain from './DashboardLayoutMain';
import PwaInstallBanner from './PwaInstallBanner';

export default function DashboardLayoutView({
  isMobile,
  isSuperAdmin,
  user,
  layout,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 15% 15%, #fff8e9, transparent 40%), linear-gradient(135deg, #f8f0df, #ead8bd, #f9f3e8)',
      }}
    >
      <DashboardAppBar
        drawerWidth={layout.drawerWidth}
        collapsed={layout.collapsed}
        isMobile={isMobile}
        onToggleSidebar={() => layout.handleToggleSidebar(isMobile)}
        isSuperAdmin={isSuperAdmin}
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
      <PwaInstallBanner />
    </Box>
  );
}