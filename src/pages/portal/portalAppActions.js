import { portalApi } from '../../api/portalApi';
import { goToFullPortalLogout } from '../../utils/centralAuth';

const PNL_ORIGIN = (import.meta.env.VITE_PNL_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

let pnlPrefetch = null;

/** Warm Next (preconnect + hit /) so first P&L open is less cold. */
export function warmPnlApp() {
  if (typeof document === 'undefined') return;
  if (!document.querySelector(`link[data-pnl-preconnect]`)) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = PNL_ORIGIN;
    link.setAttribute('data-pnl-preconnect', '1');
    document.head.appendChild(link);
  }
  fetch(`${PNL_ORIGIN}/`, { mode: 'no-cors', credentials: 'omit' }).catch(() => {});
}

/** Prefetch SSO consume URL (valid ~1 min) so click can navigate immediately. */
export async function prefetchPnlUrl() {
  if (pnlPrefetch && pnlPrefetch.until > Date.now()) return pnlPrefetch.url;
  const res = await portalApi.openPnl();
  const url = res.data?.data?.url;
  if (!url) throw new Error('missing url');
  pnlPrefetch = { url, until: Date.now() + 55_000 };
  return url;
}

export async function openPnlApp({ setError, setBusy }) {
  setError(null);
  setBusy('pnl');
  try {
    const url =
      pnlPrefetch && pnlPrefetch.until > Date.now()
        ? pnlPrefetch.url
        : await prefetchPnlUrl();
    pnlPrefetch = null;
    window.location.assign(url);
  } catch {
    setError('Could not open P&L');
    setBusy(null);
  }
}

export function openWorkspaceApp({ setBusy, setError }) {
  setError?.(null);
  setBusy('workspace');
  // Land on Dashboard — not the old Workspace apps-grid /home page.
  window.location.assign('/dashboard');
}

export async function logoutPortalApp({ dispatch, logoutThunk }) {
  await dispatch(logoutThunk());
  goToFullPortalLogout();
}
