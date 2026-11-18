import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { impersonateUser } from '../../features/users/usersThunks';
import { startImpersonation } from '../../features/auth/authSlice';
import { getDefaultLandingPath } from '../../routes/routeConfig';
import PortalUsersToolbar from './PortalUsersToolbar';
import PortalUsersTable from './PortalUsersTable';
import {
  downloadPortalUsersCsv,
  filterPortalUsers,
} from './portalUsersHelpers';

export default function PortalUsersPanel({ users, loading, error }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState(null);

  const filtered = useMemo(() => filterPortalUsers(users, search), [users, search]);

  async function onLoginAs(row) {
    if (!row.workspaceId) return;
    setActionError(null);
    try {
      const result = await dispatch(impersonateUser(row.workspaceId)).unwrap();
      dispatch(startImpersonation(result));
      navigate(getDefaultLandingPath(result.user, result.permissions));
    } catch (err) {
      setActionError(typeof err === 'string' ? err : 'Could not log in as this user');
    }
  }

  if (loading) {
    return (
      <div className="central-users-page">
        <p className="central-home__eyebrow">Directory</p>
        <h2 className="central-users__title">Users</h2>
        <p className="central-users__lead">Loading directory…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="central-users-page">
        <p className="central-home__eyebrow">Directory</p>
        <h2 className="central-users__title">Users</h2>
        <p className="portal-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="central-users-page">
      <header className="central-users-page__head">
        <p className="central-home__eyebrow">Directory</p>
        <h2 className="central-users__title">Users</h2>
        <p className="central-users__lead">
          {users.length} people across P&amp;L and Workspace.
        </p>
      </header>
      <PortalUsersToolbar
        search={search}
        onSearchChange={setSearch}
        onDownload={() => downloadPortalUsersCsv(filtered)}
        disabled={!filtered.length}
      />
      {actionError ? <p className="portal-error">{actionError}</p> : null}
      <PortalUsersTable users={filtered} onLoginAs={onLoginAs} />
    </div>
  );
}
