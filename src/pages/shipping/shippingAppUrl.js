export function shippingAppBase() {
  return String(import.meta.env.VITE_SHIPPING_APP_URL || '')
    .trim()
    .replace(/\/$/, '');
}

export function hasShippingAppUrl() {
  return Boolean(shippingAppBase());
}

/** SSO entry URL that lands on a Shipping path (embed=1 is added by Shipping). */
export function pathSsoUrl(nextPath) {
  const base = shippingAppBase();
  const next = String(nextPath || '').startsWith('/') ? nextPath : `/${nextPath || ''}`;
  if (!base || !next || next === '/') {
    if (!base) return '';
    return `${base}/valuecon-sso?next=${encodeURIComponent('/')}`;
  }
  return `${base}/valuecon-sso?next=${encodeURIComponent(next)}`;
}

export function shipmentSsoUrl(shipmentId) {
  if (!shipmentId) return '';
  return pathSsoUrl(`/shipments/${shipmentId}`);
}
