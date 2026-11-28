import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { companionApi } from '../../api/companionApi';
import { shippingAppBase, pathSsoUrl } from './shippingAppUrl';
import { useIframePathWatch } from './useIframePathWatch';

/** Direct page URL for in-iframe hops after SSO. */
export function embedPageUrl(path) {
  const base = shippingAppBase();
  if (!base) return '';
  const next = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (!next) return `${base}/?embed=1`;
  return `${base}${next}${next.includes('?') ? '&' : '?'}embed=1`;
}

function useIframeSso(path) {
  const iframeRef = useRef(null);
  const signedInRef = useRef(false);
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let onMessage = null;
    let hangTimer = null;
    const base = shippingAppBase();

    async function start() {
      if (!base) {
        setError('Shipping app URL is not configured');
        setLoading(false);
        return;
      }

      if (signedInRef.current && iframeRef.current) {
        const target = embedPageUrl(path);
        if (target) iframeRef.current.src = target;
        setLoading(false);
        return;
      }

      const ssoUrl = pathSsoUrl(path || '/');
      try {
        const { data } = await companionApi.createSession('shipping');
        const email = data?.data?.email;
        const password = data?.data?.password;
        if (!email || !password) throw new Error('Could not create Shipping sign-in');
        const origin = new URL(base).origin;
        onMessage = (event) => {
          if (event.origin !== origin) return;
          if (event.source !== iframeRef.current?.contentWindow) return;
          if (event.data?.type === 'valuecon-sso-ready') {
            signedInRef.current = true;
            if (hangTimer) clearTimeout(hangTimer);
            const target = embedPageUrl(path);
            window.setTimeout(() => {
              const frame = iframeRef.current;
              if (!frame || !target) return;
              try {
                const href = frame.contentWindow?.location?.href || '';
                if (href.includes('valuecon-sso')) frame.src = target;
              } catch {
                frame.src = target;
              }
            }, 1500);
            return;
          }
          if (event.data?.type !== 'valuecon-sso-waiting') return;
          event.source.postMessage({ type: 'valuecon-sso', email, password }, origin);
        };
        window.addEventListener('message', onMessage);
        hangTimer = window.setTimeout(() => {
          if (!cancelled && !signedInRef.current) {
            setError('Shipping sign-in timed out. Click Back and try again.');
          }
        }, 20000);
        if (!cancelled) {
          setSrc(ssoUrl);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Could not open Shipping');
          setLoading(false);
        }
      }
    }

    setError('');
    setLoading(true);
    start();
    return () => {
      cancelled = true;
      if (hangTimer) clearTimeout(hangTimer);
      if (onMessage) window.removeEventListener('message', onMessage);
    };
  }, [path]);

  return { iframeRef, src, error, loading, signedInRef };
}

export default function ShippingEmbedFrame({
  path,
  onBack,
  backLabel = 'Back',
  onLivePath,
  showBack = true,
  backToPath = null,
}) {
  const { iframeRef, src, error, loading } = useIframeSso(path);
  useIframePathWatch(iframeRef, onLivePath);

  const handleBack = () => {
    // Force navigation even when parent path state is unchanged (iframe went deep alone).
    const target = embedPageUrl(backToPath != null ? backToPath : '/');
    if (iframeRef.current && target) iframeRef.current.src = target;
    if (onLivePath) onLivePath(backToPath != null ? backToPath : '/');
    if (onBack) onBack();
  };

  // Match Workspace cream so embed is not a white “card” on the shell.
  const shellBg = '#f8f0df';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        bgcolor: shellBg,
      }}
    >
      {showBack ? (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
            fontWeight: 500,
            color: 'text.secondary',
            px: 1.5,
            py: 0.25,
            minHeight: 32,
            flexShrink: 0,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          {backLabel}
        </Button>
      ) : null}
      {error ? (
        <Typography sx={{ color: 'error.main', fontWeight: 500, px: 1 }}>{error}</Typography>
      ) : null}
      {loading ? (
        <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#C99846' }} />
        </Box>
      ) : null}
      {src ? (
        <Box
          component="iframe"
          ref={iframeRef}
          src={src}
          title="Shipping"
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            border: 'none',
            borderRadius: 0,
            bgcolor: shellBg,
            display: 'block',
          }}
        />
      ) : null}
    </Box>
  );
}
