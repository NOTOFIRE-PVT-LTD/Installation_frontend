import { useEffect, useRef, useState } from 'react';
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
  const [busy, setBusy] = useState(null);
  const [view, setView] = useState('home');
  const singleAppRedirected = useRef(false);
  const bothApps = Boolean(access.pnl && access.workspace);
  const directory = usePortalDirectory(bothApps);

  useEffect(() => {
    if (!ready || !access.pnl) return undefined;
    warmPnlApp();
    const t = window.setTimeout(() => {
      prefetchPnlUrl().catch(() => {});
    }, 400);
    return () => window.clearTimeout(t);
  }, [ready, access.pnl]);

  useEffect(() => {
    if (!ready || busy || singleAppRedirected.current) return;
    const kind = resolvePortalLanding(access);
    if (kind === 'pnl') {
      singleAppRedirected.current = true;
      openPnlApp({ setError, setBusy });
    } else if (kind === 'workspace') {
      singleAppRedirected.current = true;
      openWorkspaceApp({ setBusy, setError });
    }
  }, [ready, access, busy, setError]);

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
