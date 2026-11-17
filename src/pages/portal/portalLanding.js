import { portalApi } from '../../api/portalApi';
import { openPnlApp, openWorkspaceApp } from './portalAppActions';

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
  return res.data?.data?.access || { pnl: false, workspace: false };
}

/** After login / when /apps is not a chooser: go to the one app or stay on /apps. */
export async function applyPortalLanding({ navigate, user, permissions, setError, setBusy }) {
  const access = await fetchPortalAccess();
  const kind = resolvePortalLanding(access);
  if (kind === 'pnl') {
    await openPnlApp({ setError, setBusy });
    return kind;
  }
  if (kind === 'workspace') {
    openWorkspaceApp({ navigate, user, permissions, setBusy });
    return kind;
  }
  navigate('/apps', { replace: true });
  return kind;
}
