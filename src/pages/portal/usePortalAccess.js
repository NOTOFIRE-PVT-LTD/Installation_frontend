import { useEffect, useState } from 'react';
import { portalApi } from '../../api/portalApi';

let cachedAccess = null;
let accessPromise = null;

function loadPortalAccess() {
  if (cachedAccess) return Promise.resolve(cachedAccess);
  if (!accessPromise) {
    accessPromise = portalApi
      .me()
      .then((res) => {
        const a = res.data?.data?.access || {};
        cachedAccess = { pnl: Boolean(a.pnl), workspace: Boolean(a.workspace) };
        return cachedAccess;
      })
      .finally(() => {
        accessPromise = null;
      });
  }
  return accessPromise;
}

export function usePortalAccess() {
  const [access, setAccess] = useState(cachedAccess || { pnl: false, workspace: false });
  const [ready, setReady] = useState(Boolean(cachedAccess));
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  return { access, ready, error, setError };
}
