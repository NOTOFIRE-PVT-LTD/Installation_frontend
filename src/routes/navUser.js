export function isSuperAdminUser(user) {
  return (
    user?.adminType === 'SUPER_ADMIN' ||
    user?.email === 'admin@nfsite.com' ||
    user?.email === 'super.admin@demo.local'
  );
}