import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultLandingPath } from '../routes/routeConfig';
import { goToCentralLogin } from '../utils/centralAuth';

export default function ForbiddenPage() {
  const { isAuthenticated, user, permissions } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) goToCentralLogin();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return <Navigate to={getDefaultLandingPath(user, permissions)} replace />;
}
