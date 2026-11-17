import { portalApi } from '../../api/portalApi';
import { getDefaultLandingPath } from '../../routes/routeConfig';
import { goToFullPortalLogout } from '../../utils/centralAuth';

export async function openPnlApp({ setError, setBusy }) {
  setError(null);
  setBusy('pnl');
  try {
    const res = await portalApi.openPnl();
    const url = res.data?.data?.url;
    if (!url) throw new Error('missing url');
    window.location.href = url;
  } catch {
    setError('Could not open P&L');
    setBusy(null);
  }
}

export function openWorkspaceApp({ navigate, user, permissions, setBusy }) {
  setBusy('workspace');
  const path = getDefaultLandingPath(user, permissions) || '/home';
  navigate(path === '/apps' ? '/home' : path);
}

export async function logoutPortalApp({ dispatch, logoutThunk }) {
  await dispatch(logoutThunk());
  goToFullPortalLogout();
}
