import { useAppSelector } from '../app/hooks';
import { PLATFORM_OWNER_EMAILS } from '../utils/constants';

export function useAuth() {
  const { user, permissions, accessToken, bootstrapped, status } = useAppSelector((state) => state.auth);
  const isSuperAdmin =
    user?.adminType === 'SUPER_ADMIN' ||
    user?.email === 'admin@nfsite.com' ||
    user?.email === 'super.admin@demo.local';
  const isPlatformOwner = PLATFORM_OWNER_EMAILS.includes(String(user?.email || '').toLowerCase());

  return {
    user,
    permissions,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'Admin',
    isInstaller: user?.role === 'User' && user?.jobRole !== 'SALESPERSON',
    isSalesperson: user?.jobRole === 'SALESPERSON',
    isSuperAdmin,
    isPlatformOwner,
    bootstrapped,
    status,
    accessToken,
  };
}
