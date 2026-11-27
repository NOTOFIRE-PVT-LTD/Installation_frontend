import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { impersonateUser } from '../../features/users/usersThunks';
import { startImpersonation } from '../../features/auth/authSlice';
import { getDefaultLandingPath } from '../../routes/routeConfig';
import { clearPortalAccessCache } from './usePortalAccess';
import PortalUsersToolbar from './PortalUsersToolbar';
import PortalUsersTable from './PortalUsersTable';
import { downloadPortalUsersCsv, filterPortalUsers } from './portalUsersHelpers';

function PortalDirectoryLoading() {
  return (
    <div className="central-users-page">
      <p className="central-home__eyebrow">Directory</p>
      <h2 className="central-users__title">Users</h2>
      <p className="central-users__lead">Loading directory…</p>
    </div>
  );
}

function PortalDirectoryError({ error }) {
  return (
    <div className="central-users-page">
      <p className="central-home__eyebrow">Directory</p>
      <h2 className="central-users__title">Users</h2>
      <p className="portal-error">{error}</p>
    </div>
  );
}

function PortalUsersHeader({ count, onGoHome }) {
  return (
    <header className="central-users-page__head">
      {onGoHome ? (
        <button type="button" className="central-users__home" onClick={onGoHome}>
          ← Apps home
        </button>
      ) : null}
      <p className="central-home__eyebrow">Directory</p>
      <h2 className="central-users__title">Users</h2>
      <p className="central-users__lead">{count} people across P&amp;L and Workspace.</p>
    </header>
  );
}

function usePortalPanelState(users) {
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [actionError, setActionError] = useState(null);

  const counts = useMemo(
    () => ({
      all: users.length,
      workspace: users.filter((u) => u.apps?.includes('workspace')).length,
      pnl: users.filter((u) => u.apps?.includes('pnl')).length,
    }),
    [users]
  );

  const filtered = useMemo(
    () => filterPortalUsers(users, search, appFilter),
    [users, search, appFilter]
  );

  return { search, setSearch, appFilter, setAppFilter, actionError, setActionError, counts, filtered };
}

export default function PortalUsersPanel({ users, loading, error, onGoHome }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = usePortalPanelState(users);

  async function onLoginAs(row) {
    if (!row.workspaceId) return;
    state.setActionError(null);
    try {
      const res = await dispatch(impersonateUser(row.workspaceId)).unwrap();
      clearPortalAccessCache();
      dispatch(startImpersonation(res));
      navigate(getDefaultLandingPath(res.user, res.permissions), { replace: true });
    } catch (err) {
      state.setActionError(typeof err === 'string' ? err : 'Could not log in as this user');
    }
  }

  if (loading) return <PortalDirectoryLoading />;
  if (error) return <PortalDirectoryError error={error} />;

  return (
    <div className="central-users-page">
      <PortalUsersHeader count={state.filtered.length} onGoHome={onGoHome} />
      <PortalUsersToolbar
        search={state.search}
        onSearchChange={state.setSearch}
        appFilter={state.appFilter}
        onAppFilterChange={state.setAppFilter}
        counts={state.counts}
        onDownload={() => downloadPortalUsersCsv(state.filtered)}
        disabled={!state.filtered.length}
      />
      {state.actionError ? <p className="portal-error">{state.actionError}</p> : null}
      <PortalUsersTable users={state.filtered} onLoginAs={onLoginAs} />
    </div>
  );
}
