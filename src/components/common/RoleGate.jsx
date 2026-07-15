import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleGate({ allow, children }) {
  const { user } = useAuth();
  if (!allow.includes(user?.role)) return <Navigate to="/403" replace />;
  return children;
}
