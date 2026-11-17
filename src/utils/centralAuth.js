/** Centralisation login — only auth UI for Workspace staff apps. */
export const CENTRAL_LOGIN_URL =
  import.meta.env.VITE_CENTRAL_LOGIN_URL || 'http://localhost:3000/login';

/** Full portal sign-out (clears P&L session too) — not /login alone. */
export const CENTRAL_LOGOUT_URL = (() => {
  try {
    const login = new URL(CENTRAL_LOGIN_URL);
    login.pathname = '/logout';
    login.search = '';
    login.hash = '';
    return login.toString();
  } catch {
    return 'http://localhost:3000/logout';
  }
})();

export function goToCentralLogin() {
  // Workspace logout must end the Centralisation session; /login alone bounces
  // signed-in users back to /apps via middleware.
  window.location.replace(CENTRAL_LOGOUT_URL);
}
