import { store } from '../../app/store';
import { portalApi } from '../../api/portalApi';
import { getDefaultLandingPath } from '../../routes/navAccess';
import { openLeadTrackApp, openPnlApp, openWorkspaceApp } from './portalAppActions';
import { setPortalAccessCache } from './usePortalAccess';

export function resolvePortalLanding(access) {
  const pnl = Boolean(access?.pnl);
  const ws = Boolean(access?.workspace);
  const lt = Boolean(access?.leadtrack);
  if (pnl && ws) return 'apps';
  if (lt && !pnl && !ws) return 'leadtrack';
  if (pnl && !ws) return 'pnl';
  if (ws) return 'workspace';
  if (lt) return 'leadtrack';
  return 'apps';
}

export async function fetchPortalAccess() {
  const res = await portalApi.me();
  const access = res.data?.data?.access || {
    pnl: false,
    workspace: false,
    leadtrack: false,
  };
  return setPortalAccessCache(access);
}

function workspaceLandingPath() {
  const { user, permissions } = store.getState().auth;
  return getDefaultLandingPath(user, permissions);
}

/** After login / when /apps is not a chooser: go to the one app or stay on /apps. */
export async function applyPortalLanding({ navigate, setError, setBusy }) {
  const access = await fetchPortalAccess();
  const kind = resolvePortalLanding(access);
  if (kind === 'pnl') {
    await openPnlApp({ setError, setBusy });
    return kind;
  }
  if (kind === 'leadtrack') {
    await openLeadTrackApp({ setError, setBusy });
    return kind;
  }
  if (kind === 'workspace') {
    // SPA: single-app users land on Shipping (etc.), not the /home chooser.
    const land = workspaceLandingPath();
    if (land && land !== '/home' && land !== '/apps') {
      navigate(land, { replace: true });
      return kind;
    }
    openWorkspaceApp({ setBusy, setError });
    return kind;
  }
  // SPA navigate keeps Redux token + access cache (full reload stuck on Opening…).
  navigate('/apps', { replace: true });
  return kind;
}
