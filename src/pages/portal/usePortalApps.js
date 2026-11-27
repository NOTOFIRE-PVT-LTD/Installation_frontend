import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authThunks';
import { usePortalAccess } from './usePortalAccess';
import { usePortalMenu } from './usePortalMenu';
import { usePortalDirectory } from './usePortalDirectory';
import {
  retryPortalAppOpen,
  usePortalSingleAppRedirect,
} from './usePortalSingleAppRedirect';
import {
  logoutPortalApp,
  openPnlApp,
  openLeadTrackApp,
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

  usePortalSingleAppRedirect({
    ready,
    busy,
    bothApps,
    error,
    access,
    setBusy,
    setError,
  });

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
    setError,
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
    openLeadTrack: () => openLeadTrackApp({ setError, setBusy }),
    prefetchPnl: () => {
      prefetchPnlUrl().catch(() => {});
    },
    openWorkspace: () => openWorkspaceApp({ setBusy, setError }),
    retryOpen: () => retryPortalAppOpen(access, setError, setBusy),
    onLogout: () => logoutPortalApp({ dispatch, logoutThunk: logout }),
    goProfile: () => {
      setMenuOpen(false);
      setView('profile');
    },
  };
}
