import { useAuth } from './useAuth';

export function usePermission(key) {
  const { isAdmin, isSuperAdmin, permissions } = useAuth();
  if (!key) return true;
  if (isSuperAdmin) return true;
  if (!isAdmin) return false;
  if (key === 'attendance' || key === 'salespersonTracking') {
    return Boolean(permissions?.attendance || permissions?.salespersonTracking);
  }
  return Boolean(permissions?.[key]);
}
