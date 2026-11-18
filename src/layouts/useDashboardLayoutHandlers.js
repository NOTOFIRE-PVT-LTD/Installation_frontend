import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getDefaultLandingPath } from '../routes/routeConfig';
import { logout } from '../features/auth/authThunks';
import { stopImpersonation } from '../features/auth/authSlice';
import { goToFullPortalLogout } from '../utils/centralAuth';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './dashboardLayoutConstants';

export function useDashboardLayoutHandlers() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [anchorEl, setAnchorEl] = useState(null);
  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const impersonatorAdmin = useAppSelector((state) => state.auth.impersonatorAdmin);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  const handleToggleSidebar = (isMobile) => {
    if (isMobile) setMobileOpen(true);
    else toggleCollapsed();
  };

  const handleLogout = async () => {
    await dispatch(logout());
    goToFullPortalLogout();
  };

  const handleExitImpersonation = () => {
    const restoredPath = getDefaultLandingPath(impersonatorAdmin.user, impersonatorAdmin.permissions);
    dispatch(stopImpersonation());
    navigate(restoredPath, { replace: true });
  };

  return {
    mobileOpen,
    setMobileOpen,
    collapsed,
    drawerWidth,
    anchorEl,
    setAnchorEl,
    impersonatorAdmin,
    handleToggleSidebar,
    handleLogout,
    handleExitImpersonation,
    navigateToProfile: () => navigate('/profile'),
  };
}