import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortalAccess } from '../pages/portal/usePortalAccess';
import { NAV_ITEMS, flattenNavItems, isNavItemAllowed } from '../routes/routeConfig';
import { filterPortalNavItems } from './filterPortalNavItems';

export function useVisibleNavItems() {
  const { user, permissions } = useAuth();
  const { access, ready } = usePortalAccess();
  const bothApps = Boolean(access.pnl && access.workspace);

  return useMemo(() => {
    const allowed = flattenNavItems(NAV_ITEMS).filter((item) =>
      isNavItemAllowed(item, user, permissions),
    );
    return filterPortalNavItems(allowed, { bothApps, ready });
  }, [user, permissions, bothApps, ready]);
}
