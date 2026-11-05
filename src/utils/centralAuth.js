/**
 * Redirects to VITE_CENTRAL_LOGIN_URL when configured for external Centralisation SSO;
 * otherwise falls back to the local /login route on the current origin.
 */
export const CENTRAL_LOGIN_URL = import.meta.env.VITE_CENTRAL_LOGIN_URL || '/login';

export function goToCentralLogin() {
  window.location.replace(CENTRAL_LOGIN_URL);
}
