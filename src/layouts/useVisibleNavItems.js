import { useAuth } from '../hooks/useAuth';
import { NAV_ITEMS, flattenNavItems, isNavItemAllowed } from '../routes/routeConfig';

export function useVisibleNavItems() {
  const { user, permissions } = useAuth();
  return flattenNavItems(NAV_ITEMS).filter((item) => isNavItemAllowed(item, user, permissions));
}