import { portalApi } from '../../api/portalApi';
import { openPnlApp, openWorkspaceApp } from './portalAppActions';
import { setPortalAccessCache } from './usePortalAccess';

export function resolvePortalLanding(access) {
  const pnl = Boolean(access?.pnl);
  const ws = Boolean(access?.workspace);
  if (pnl && ws) return 'apps';
  if (pnl) return 'pnl';
  if (ws) return 'workspace';
  return 'apps';
}

export async function fetchPortalAccess() {
  const res = await portalApi.me();
  const access = res.data?.data?.access || { pnl: false, workspace: false };
  return setPortalAccessCache(access);
}

function appsChooserUrl() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const base = path.startsWith('/ws')
    ? '/ws/'
    : (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${window.location.origin}${base}apps`;
}

/** After login / when /apps is not a chooser: go to the one app or stay on /apps. */
export async function applyPortalLanding({ navigate, setError, setBusy }) {
  const access = await fetchPortalAccess();
  const kind = resolvePortalLanding(access);
  if (kind === 'pnl') {
    await openPnlApp({ setError, setBusy });
    return kind;
  }
  if (kind === 'workspace') {
    openWorkspaceApp({ setBusy, setError });
    return kind;
  }
  // Hard navigate so dual users always hit the chooser (no SPA race into Workspace).
  if (typeof window !== 'undefined') {
    window.location.replace(appsChooserUrl());
    return kind;
  }
  navigate('/apps', { replace: true });
  return kind;
}
