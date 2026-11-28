import { useEffect } from 'react';

/** Poll same-origin iframe path (strip /ship-app) so parent can hide top tabs. */
export function useIframePathWatch(iframeRef, onPath) {
  useEffect(() => {
    if (!onPath) return undefined;
    const tick = () => {
      try {
        const raw = iframeRef.current?.contentWindow?.location?.pathname || '';
        if (!raw) return;
        const path = raw.replace(/^\/ship-app(?=\/|$)/, '') || '/';
        onPath(path);
      } catch {
        /* navigating / cross-origin briefly */
      }
    };
    const id = window.setInterval(tick, 700);
    return () => window.clearInterval(id);
  }, [iframeRef, onPath]);
}
