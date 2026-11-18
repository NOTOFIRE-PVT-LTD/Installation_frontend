import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultLandingPath } from './routeConfig';

export function DefaultLandingRedirect() {
  const { user, permissions } = useAuth();
  return <Navigate to={getDefaultLandingPath(user, permissions)} replace />;
}