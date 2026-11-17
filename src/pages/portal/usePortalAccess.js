import { useEffect, useState } from 'react';
import { portalApi } from '../../api/portalApi';

export function usePortalAccess() {
  const [access, setAccess] = useState({ pnl: false, workspace: false });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    portalApi
      .me()
      .then((res) => {
        if (cancelled) return;
        const a = res.data?.data?.access || {};
        setAccess({ pnl: Boolean(a.pnl), workspace: Boolean(a.workspace) });
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
