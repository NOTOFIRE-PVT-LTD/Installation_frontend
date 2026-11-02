import { useAuth } from './useAuth';

export function usePermission(key) {
  const { isAdmin, permissions } = useAuth();
  if (!key) return true;
  if (!isAdmin) return false;
  return Boolean(permissions?.[key]);
}
