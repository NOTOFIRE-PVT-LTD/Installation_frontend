import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { getDefaultLandingPath } from '../../routes/routeConfig';

// Admins are gated by their permission flag. The given non-Admin roles default to allowed (no
// Permission doc = full access) but respect an explicit false once an Admin restricts that
// module for them (mirrors the backend's requirePermissionOrRole rule).
export default function PermissionGate({ permission, userPermission, roles = [], jobRole, children }) {
  const { user, isAdmin, isSuperAdmin, permissions } = useAuth();
  const hasPermission = usePermission(permission) || usePermission(userPermission);
  const home = getDefaultLandingPath(user, permissions);

  // Super Admin can access all modules and subpages without restriction
  if (isSuperAdmin) return children;

  if (!isAdmin && (roles.length === 0 || roles.includes(user?.role))) {
    if (jobRole && user?.jobRole !== jobRole && !permissions?.[userPermission || permission]) {
      return <Navigate to={home} replace />;
    }
    const keys = [permission, userPermission].filter(Boolean);
    if (!keys.length) return children;
    const allowed = !permissions
      ? true
      : keys.some((key) =>
          key === 'atlantaPayments' ? Boolean(permissions[key]) : permissions[key] !== false
        );
    return allowed ? children : <Navigate to={home} replace />;
  }
  if (isAdmin && hasPermission) return children;

  return <Navigate to={home} replace />;
}
