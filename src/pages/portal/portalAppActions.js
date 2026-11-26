import { portalApi } from '../../api/portalApi';
import { goToFullPortalLogout } from '../../utils/centralAuth';
import { clearPortalAccessCache } from './usePortalAccess';

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
    // Always mint a fresh SSO URL — reused prefetch breaks after Back/bfcache.
    pnlPrefetch = null;
    const url = await prefetchPnlUrl();
    if (!url) throw new Error('missing url');
    pnlPrefetch = null;
    window.location.href = url;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Could not open P&L — is the P&L app running?';
    setError(msg);
    setBusy(null);
  }
}

export async function openLeadTrackApp({ setError, setBusy }) {
  setError(null);
  setBusy('leadtrack');
  try {
    const res = await portalApi.openLeadTrack();
    const url = res.data?.data?.url;
    if (!url) throw new Error('missing url');
    window.location.href = url;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Could not open LeadTrack — is it running on :3010?';
    setError(msg);
    setBusy(null);
  }
}

export function openWorkspaceApp({ setBusy, setError }) {
  setError?.(null);
  setBusy('workspace');
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  // Prefer live /ws/ so a build without VITE_BASE_PATH still leaves /apps on EC2.
  const base = path.startsWith('/ws')
    ? '/ws/'
    : (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  window.location.assign(`${window.location.origin}${base}dashboard`);
}

export async function logoutPortalApp({ dispatch, logoutThunk }) {
  clearPortalAccessCache();
  await dispatch(logoutThunk());
  goToFullPortalLogout();
}
