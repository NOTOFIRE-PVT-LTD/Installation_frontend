import { portalApi } from '../../api/portalApi';
import { goToFullPortalLogout } from '../../utils/centralAuth';

export async function openPnlApp({ setError, setBusy }) {
  setError(null);
  setBusy('pnl');
  try {
    const res = await portalApi.openPnl();
    const url = res.data?.data?.url;
    if (!url) throw new Error('missing url');
    window.location.assign(url);
  } catch {
    setError('Could not open P&L');
    setBusy(null);
  }
}

export function openWorkspaceApp({ setBusy, setError }) {
  setError?.(null);
  setBusy('workspace');
  // Hard nav leaves the portal shell; soft navigate can leave busy stuck on /apps.
  window.location.assign('/home');
}

export async function logoutPortalApp({ dispatch, logoutThunk }) {
  await dispatch(logoutThunk());
  goToFullPortalLogout();
}
