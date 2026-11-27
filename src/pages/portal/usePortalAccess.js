import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { portalApi } from '../../api/portalApi';

let cachedAccess = null;
let accessPromise = null;

/** Clear after logout / user switch so the next login cannot reuse another user's apps. */
export function clearPortalAccessCache() {
  cachedAccess = null;
  accessPromise = null;
}

/** Seed cache right after login so /apps never briefly looks single-app. */
export function setPortalAccessCache(access) {
  cachedAccess = {
    pnl: Boolean(access?.pnl),
    workspace: Boolean(access?.workspace),
    leadtrack: Boolean(access?.leadtrack),
  };
  accessPromise = null;
  return cachedAccess;
}

function loadPortalAccess() {
  if (cachedAccess) return Promise.resolve(cachedAccess);
  if (!accessPromise) {
    accessPromise = portalApi
      .me()
      .then((res) => {
        const a = res.data?.data?.access || {};
        cachedAccess = {
          pnl: Boolean(a.pnl),
          workspace: Boolean(a.workspace),
          leadtrack: Boolean(a.leadtrack),
        };
        return cachedAccess;
      })
      .finally(() => {
        accessPromise = null;
      });
  }
  return accessPromise;
}

export function usePortalAccess(enabled = true) {
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [access, setAccess] = useState(
    cachedAccess || { pnl: false, workspace: false, leadtrack: false },
  );
  const [ready, setReady] = useState(Boolean(cachedAccess));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    // Wait for fetchMe/refresh so /apps me() is not a race after login.
    if (!bootstrapped) return undefined;
    if (!accessToken && !cachedAccess) {
      setReady(true);
      setError('Session expired — sign in again');
      return undefined;
    }
    let cancelled = false;
    loadPortalAccess()
      .then((a) => {
        if (cancelled) return;
        setAccess(a);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load app access');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, bootstrapped, accessToken]);

  return { access, ready: enabled ? ready : false, error, setError };
}
