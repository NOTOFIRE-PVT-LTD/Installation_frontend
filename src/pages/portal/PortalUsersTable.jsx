import { formatPortalApps, formatPortalRole } from './portalUsersHelpers';

export default function PortalUsersTable({ users, onLoginAs, canLoginAs = false }) {
  if (!users.length) {
    return <p className="central-users-empty">No users match this search.</p>;
  }

  return (
    <div className="central-users-table-wrap">
      <table className="central-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>App Access</th>
            <th>Status</th>
            {canLoginAs ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="central-users-name">
                  <span className="central-users-avatar" aria-hidden>
                    {(u.name || u.email || '?').trim().charAt(0).toUpperCase()}
                  </span>
                  <span>{u.name || '—'}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td>
                <span className="central-users-pill">{formatPortalRole(u.role)}</span>
              </td>
              <td>
                <span className="central-users-pill central-users-pill--app">
                  {formatPortalApps(u.apps, u.workspaceApps)}
                </span>
              </td>
              <td>
                <span className={u.active === false ? 'central-users-status is-off' : 'central-users-status'}>
                  {u.active === false ? 'Inactive' : 'Active'}
                </span>
              </td>
              {canLoginAs ? (
                <td>
                  {u.workspaceId ? (
                    <button
                      type="button"
                      className="central-page-btn"
                      onClick={() => onLoginAs(u)}
                      title="Log in as this Workspace user"
                    >
                      Log in as
                    </button>
                  ) : (
                    <span className="central-users-muted">P&amp;L only</span>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
