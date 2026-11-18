import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useAuth } from '../hooks/useAuth';
import { hideSnackbar } from '../features/ui/uiSlice';
import { usePortalAccess } from '../pages/portal/usePortalAccess';
import { useVisibleNavItems } from './useVisibleNavItems';
import { useDashboardWorkspaceRedirect } from './useDashboardWorkspaceRedirect';
import { useDashboardLayoutHandlers } from './useDashboardLayoutHandlers';
import DashboardLayoutView from './DashboardLayoutView';

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const { user, isSuperAdmin } = useAuth();
  const snackbar = useAppSelector((state) => state.ui.snackbar);
  const { access, ready } = usePortalAccess();
  const showAppsHome = ready && Boolean(access.pnl && access.workspace);
  const navItems = useVisibleNavItems();
  const layout = useDashboardLayoutHandlers();

  useDashboardWorkspaceRedirect(navItems);

  return (
    <DashboardLayoutView
      isMobile={isMobile}
      isSuperAdmin={isSuperAdmin}
      showAppsHome={showAppsHome}
      user={user}
      snackbar={snackbar}
      layout={layout}
      onHideSnackbar={() => dispatch(hideSnackbar())}
    />
  );
}