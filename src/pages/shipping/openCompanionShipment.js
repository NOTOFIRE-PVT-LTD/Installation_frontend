import { companionApi } from '../../api/companionApi';
import { hasShippingAppUrl, shippingAppBase, shipmentSsoUrl } from './shippingAppUrl';

export { hasShippingAppUrl, shippingAppBase };

/** Open a shipment in a new tab via SSO (fallback). */
export async function openCompanionShipment(shipmentId) {
  const base = shippingAppBase();
  const ssoUrl = shipmentSsoUrl(shipmentId);
  if (!base || !ssoUrl) {
    throw new Error('Shipping app URL is not configured');
  }

  const { data } = await companionApi.createSession('shipping');
  const email = data?.data?.email;
  const password = data?.data?.password;
  if (!email || !password) throw new Error('Could not create Shipping sign-in');

  const popup = window.open(ssoUrl, '_blank', 'noopener');
  if (!popup) {
    window.location.assign(`${base}/shipments/${shipmentId}`);
    return;
  }

  const onMessage = (event) => {
    if (event.source !== popup) return;
    if (event.data?.type !== 'valuecon-sso-waiting') return;
    popup.postMessage({ type: 'valuecon-sso', email, password }, base);
    window.removeEventListener('message', onMessage);
  };
  window.addEventListener('message', onMessage);
  window.setTimeout(() => window.removeEventListener('message', onMessage), 30_000);
}
