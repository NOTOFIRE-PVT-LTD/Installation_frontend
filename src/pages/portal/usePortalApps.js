import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authThunks';
import { usePortalAccess } from './usePortalAccess';
import { usePortalMenu } from './usePortalMenu';
import { usePortalDirectory } from './usePortalDirectory';
import {
  logoutPortalApp,
  openPnlApp,
  openWorkspaceApp,
} from './portalAppActions';

export function usePortalApps() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, permissions } = useAppSelector((s) => s.auth);
  const { access, error, setError } = usePortalAccess();
  const { menuOpen, setMenuOpen, menuRef } = usePortalMenu();
  const [busy, setBusy] = useState(null);
  const [view, setView] = useState('home');
  const directory = usePortalDirectory(true);

  const email = user?.email || '';
  const name = user?.name || email;
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  return {
    name,
    email,
    initial,
    access,
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
    openWorkspace: () => openWorkspaceApp({ navigate, user, permissions, setBusy }),
    onLogout: () => logoutPortalApp({ dispatch, logoutThunk: logout }),
    goProfile: () => navigate('/profile'),
  };
}
