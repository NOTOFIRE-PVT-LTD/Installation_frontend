import { useAuth } from './useAuth';

export function usePermission(key) {
  const { isAdmin, permissions } = useAuth();
  if (!key) return true;
  if (!isAdmin) return false;
  if (key === 'salesTravelRequests') {
    return permissions ? permissions.salesTravelRequests !== false : true;
  }
  return Boolean(permissions?.[key]);
}
