import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultLandingPath } from '../routes/routeConfig';

export default function ForbiddenPage() {
  const { isAuthenticated, user, permissions } = useAuth();
  return <Navigate to={isAuthenticated ? getDefaultLandingPath(user, permissions) : '/login'} replace />;
}
