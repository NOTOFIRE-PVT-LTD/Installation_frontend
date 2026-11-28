import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { useVisibleNavItems } from './useVisibleNavItems';
import { useDashboardWorkspaceRedirect } from './useDashboardWorkspaceRedirect';
import { useDashboardLayoutHandlers } from './useDashboardLayoutHandlers';
import DashboardLayoutView from './DashboardLayoutView';

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isSuperAdmin } = useAuth();
  const navItems = useVisibleNavItems();
  const layout = useDashboardLayoutHandlers();

  useDashboardWorkspaceRedirect(navItems);

  return (
    <DashboardLayoutView
      isMobile={isMobile}
      isSuperAdmin={isSuperAdmin}
      user={user}
      layout={layout}
    />
  );
}