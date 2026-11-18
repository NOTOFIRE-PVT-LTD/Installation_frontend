import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../app/hooks';
import { canStayOnWorkspacePath, getDefaultLandingPath } from '../routes/routeConfig';

export function useDashboardWorkspaceRedirect(navItems) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, permissions, isSuperAdmin } = useAuth();
  const impersonatorAdmin = useAppSelector((state) => state.auth.impersonatorAdmin);
  const navPathsKey = useMemo(() => navItems.map((item) => item.path).join('|'), [navItems]);

  useEffect(() => {
    if (!user || isSuperAdmin) return;
    if (!canStayOnWorkspacePath(location.pathname, user, permissions, navItems)) {
      navigate(getDefaultLandingPath(user, permissions), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin, impersonatorAdmin, location.pathname, navPathsKey, navigate]);
}