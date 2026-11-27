import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../app/hooks';
import { canStayOnWorkspacePath, getDefaultLandingPath } from '../routes/routeConfig';
import { usePortalAccess } from '../pages/portal/usePortalAccess';
import { openPnlApp } from '../pages/portal/portalAppActions';

function bounceToPnl() {
  openPnlApp({ setError: () => {}, setBusy: () => {} }).catch(() => {
    const pnlUrl = (import.meta.env.VITE_PNL_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
    window.location.replace(`${pnlUrl}/`);
  });
}

export function useDashboardWorkspaceRedirect(navItems) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, permissions, isSuperAdmin } = useAuth();
  const impersonatorAdmin = useAppSelector((state) => state.auth.impersonatorAdmin);
  const { access, ready } = usePortalAccess();
  const navPathsKey = useMemo(() => navItems.map((item) => item.path).join('|'), [navItems]);

  useEffect(() => {
    if (!user) return;
    if ((ready && !access.workspace) || user?.portalSource === 'pnl') {
      bounceToPnl();
      return;
    }
    if (isSuperAdmin) return;
    if (!canStayOnWorkspacePath(location.pathname, user, permissions, navItems)) {
      navigate(getDefaultLandingPath(user, permissions), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin, impersonatorAdmin, location.pathname, navPathsKey, navigate, ready, access.workspace]);
}