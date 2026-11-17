import { useEffect, useState } from 'react';
import { portalApi } from '../../api/portalApi';

export function usePortalDirectory(enabled) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    portalApi
      .directory()
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data?.data?.users || []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load directory');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { users, loading, error };
}
