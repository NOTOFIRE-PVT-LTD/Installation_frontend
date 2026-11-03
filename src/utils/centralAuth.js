/** Centralisation login — only auth UI for Workspace staff apps. */
export const CENTRAL_LOGIN_URL =
  import.meta.env.VITE_CENTRAL_LOGIN_URL || 'http://localhost:3000/login';

export function goToCentralLogin() {
  window.location.replace(CENTRAL_LOGIN_URL);
}
