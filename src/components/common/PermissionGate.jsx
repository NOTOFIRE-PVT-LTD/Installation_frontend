import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { getDefaultLandingPath } from '../../routes/routeConfig';

// Admins are gated by their permission flag. The given non-Admin roles default to allowed (no
// Permission doc = full access) but respect an explicit false once an Admin restricts that
// module for them (mirrors the backend's requirePermissionOrRole rule).
export default function PermissionGate({ permission, userPermission, roles = [], jobRole, children }) {
  const { user, isAdmin, permissions } = useAuth();
  const hasPermission = usePermission(permission);
  const home = getDefaultLandingPath(user, permissions);

  if (!isAdmin && roles.includes(user?.role)) {
    if (jobRole && user?.jobRole !== jobRole) return <Navigate to={home} replace />;
    const key = userPermission || permission;
    const allowed =
      key === 'atlantaPayments'
        ? Boolean(permissions?.[key])
        : permissions
        ? permissions[key] !== false
        : true;
    return allowed ? children : <Navigate to={home} replace />;
  }
  if (isAdmin && hasPermission) return children;

  return <Navigate to={home} replace />;
}
