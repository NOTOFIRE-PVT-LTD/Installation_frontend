import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';

// Admins are gated by their permission flag. The given non-Admin roles default to allowed (no
// Permission doc = full access) but respect an explicit false once an Admin restricts that
// module for them (mirrors the backend's requirePermissionOrRole rule).
export default function PermissionGate({ permission, roles = [], children }) {
  const { user, isAdmin, permissions } = useAuth();
  const hasPermission = usePermission(permission);

  if (!isAdmin && roles.includes(user?.role)) {
    const allowed = permissions ? permissions[permission] !== false : true;
    return allowed ? children : <Navigate to="/403" replace />;
  }
  if (isAdmin && hasPermission) return children;

  return <Navigate to="/403" replace />;
}
