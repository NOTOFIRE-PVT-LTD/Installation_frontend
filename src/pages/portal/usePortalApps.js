import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authThunks';
import { usePortalAccess } from './usePortalAccess';
import { usePortalMenu } from './usePortalMenu';
import { usePortalDirectory } from './usePortalDirectory';
import { resolvePortalLanding } from './portalLanding';
import {
  logoutPortalApp,
  openPnlApp,
  openWorkspaceApp,
  prefetchPnlUrl,
  warmPnlApp,
} from './portalAppActions';

export function usePortalApps() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { access, ready, error, setError } = usePortalAccess();
  const { menuOpen, setMenuOpen, menuRef } = usePortalMenu();
  const [navOpen, setNavOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [view, setView] = useState('home');
  const bothApps = Boolean(access.pnl && access.workspace);
  const directory = usePortalDirectory(bothApps);

  // Only unlock after Back/bfcache — not on every pageshow (that cancelled P&L navigation).
  useEffect(() => {
    const unlock = (e) => {
      if (e?.persisted) setBusy(null);
    };
    window.addEventListener('pageshow', unlock);
    return () => window.removeEventListener('pageshow', unlock);
  }, []);

  useEffect(() => {
    if (!ready || !access.pnl || !bothApps) return undefined;
    warmPnlApp();
    prefetchPnlUrl().catch(() => {});
    return undefined;
  }, [ready, access.pnl, bothApps]);

  // Single-app users never see the chooser (login + browser Back to /apps).
  useEffect(() => {
    if (!ready || busy || bothApps) return;
    const kind = resolvePortalLanding(access);
    if (kind === 'pnl') openPnlApp({ setError, setBusy });
    else if (kind === 'workspace') openWorkspaceApp({ setBusy, setError });
  }, [ready, access, busy, bothApps, setError]);

  const email = user?.email || '';
  const name = user?.name || email;
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  return {
    name,
    email,
    initial,
    access,
    bothApps,
    ready,
    busy,
    error,
    menuOpen,
    menuRef,
    setMenuOpen,
    navOpen,
    setNavOpen,
    view,
    setView,
    users: directory.users,
    usersLoading: directory.loading,
    usersError: directory.error,
    openPnl: () => openPnlApp({ setError, setBusy }),
    prefetchPnl: () => {
      prefetchPnlUrl().catch(() => {});
    },
    openWorkspace: () => openWorkspaceApp({ setBusy, setError }),
    onLogout: () => logoutPortalApp({ dispatch, logoutThunk: logout }),
    goProfile: () => {
      setMenuOpen(false);
      setView('profile');
    },
  };
}
