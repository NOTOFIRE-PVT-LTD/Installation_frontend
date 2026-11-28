import { useEffect } from 'react';
import { store } from '../../app/store';
import { getDefaultLandingPath } from '../../routes/navAccess';
import { resolvePortalLanding } from './portalLanding';
import {
  openLeadTrackApp,
  openPnlApp,
  openWorkspaceApp,
} from './portalAppActions';

const OPEN_WATCHDOG_MS = 12_000;

function workspaceLandPath() {
  const { user, permissions } = store.getState().auth;
  return getDefaultLandingPath(user, permissions);
}

/** Auto-open the only granted app; unlock if navigation never leaves /apps. */
export function usePortalSingleAppRedirect({
  ready,
  busy,
  bothApps,
  error,
  access,
  setBusy,
  setError,
}) {
  useEffect(() => {
    if (!busy) return undefined;
    const id = window.setTimeout(() => {
      setBusy(null);
      setError('Still opening — check your connection or try again');
    }, OPEN_WATCHDOG_MS);
    return () => window.clearTimeout(id);
  }, [busy, setBusy, setError]);

  useEffect(() => {
    if (!ready || busy || bothApps || error) return;
    const kind = resolvePortalLanding(access);
    if (kind === 'pnl') openPnlApp({ setError, setBusy });
    else if (kind === 'leadtrack') openLeadTrackApp({ setError, setBusy });
    else if (kind === 'workspace') {
      openWorkspaceApp({ setBusy, setError, landPath: workspaceLandPath() });
    } else setError('No app access for this account');
  }, [ready, access, busy, bothApps, error, setError, setBusy]);
}

export function retryPortalAppOpen(access, setError, setBusy) {
  setError(null);
  setBusy(null);
  const kind = resolvePortalLanding(access);
  if (kind === 'pnl') return openPnlApp({ setError, setBusy });
  if (kind === 'leadtrack') return openLeadTrackApp({ setError, setBusy });
  if (kind === 'workspace') {
    return openWorkspaceApp({
      setBusy,
      setError,
      landPath: workspaceLandPath(),
    });
  }
  setError('No app access for this account');
  return undefined;
}
