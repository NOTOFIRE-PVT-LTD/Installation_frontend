import Toolbar from '@mui/material/Toolbar';
import DashboardUserMenu from './DashboardUserMenu';
import DashboardAppBarBrand from './DashboardAppBarBrand';
import DashboardAppBarCenter from './DashboardAppBarCenter';

export default function DashboardAppBarToolbar(props) {
  const { drawerWidth, collapsed, isMobile, onToggleSidebar, anchorEl, setAnchorEl, onProfile, onLogout } =
    props;

  return (
    <Toolbar sx={{ gap: 0, px: { xs: 1, sm: 0 }, minWidth: 0 }}>
      <DashboardAppBarBrand
        drawerWidth={drawerWidth}
        collapsed={collapsed}
        isMobile={isMobile}
        onToggleSidebar={onToggleSidebar}
      />
      <DashboardAppBarCenter
        isSuperAdmin={props.isSuperAdmin}
        showAppsHome={props.showAppsHome}
        searchPlaceholder={props.searchPlaceholder}
        user={props.user}
        setAnchorEl={setAnchorEl}
      />
      <DashboardUserMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onProfile={onProfile}
        onLogout={onLogout}
      />
    </Toolbar>
  );
}