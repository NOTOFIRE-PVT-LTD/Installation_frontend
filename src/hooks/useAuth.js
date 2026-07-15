import { useAppSelector } from '../app/hooks';

export function useAuth() {
  const { user, permissions, accessToken, bootstrapped, status } = useAppSelector((state) => state.auth);
  return {
    user,
    permissions,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'Admin',
    isInstaller: user?.role === 'User',
    bootstrapped,
    status,
    accessToken,
  };
}
