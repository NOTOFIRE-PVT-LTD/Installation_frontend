import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SidebarNavList from './SidebarNavList';
import { DRAWER_WIDTH } from './dashboardLayoutConstants';
import { getDashboardDrawerPaperBase } from './dashboardAppBarStyles';

export default function DashboardLayoutDrawers({
  drawerWidth,
  collapsed,
  mobileOpen,
  onMobileClose,
}) {
  const drawerPaperBase = getDashboardDrawerPaperBase();

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: 'dashboard-drawer' }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxShadow: '4px 0 20px rgba(26, 17, 7, 0.35)',
            ...drawerPaperBase,
          },
        }}
      >
        <SidebarNavList isCollapsed={false} onNavigate={onMobileClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        PaperProps={{ className: 'dashboard-drawer' }}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto',
            transition: 'width 0.2s',
            boxShadow: '2px 0 14px rgba(26, 17, 7, 0.25)',
            ...drawerPaperBase,
          },
        }}
        open
      >
        <SidebarNavList isCollapsed={collapsed} onNavigate={() => {}} />
      </Drawer>
    </Box>
  );
}
