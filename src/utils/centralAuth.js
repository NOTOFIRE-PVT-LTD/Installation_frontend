/** P&L (Centralisation Next) public origin — SSO consume + optional logout. */
export const PNL_PUBLIC_URL = (
  import.meta.env.VITE_PNL_PUBLIC_URL ||
  import.meta.env.VITE_CENTRAL_LOGIN_URL?.replace(/\/login\/?$/, '') ||
  'http://localhost:3000'
).replace(/\/$/, '');

/** Portal login is owned by Installation_frontend. */
export const PORTAL_LOGIN_PATH = '/login';

export const PNL_LOGOUT_URL = `${PNL_PUBLIC_URL}/logout`;

/** Send unauthenticated users to local portal login. */
export function goToCentralLogin() {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base.replace(/\/$/, '')}${PORTAL_LOGIN_PATH}`;
  window.location.replace(path || PORTAL_LOGIN_PATH);
}

/** After Workspace logout: clear P&L cookie if any, then portal login. */
export function goToFullPortalLogout() {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = PNL_LOGOUT_URL;
    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.remove();
      goToCentralLogin();
    }, 400);
  } catch {
    goToCentralLogin();
  }
}
