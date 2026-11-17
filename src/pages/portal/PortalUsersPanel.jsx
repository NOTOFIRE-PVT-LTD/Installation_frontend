export default function PortalUsersPanel({ users, loading, error }) {
  if (loading) {
    return (
      <div className="central-home">
        <p className="central-home__eyebrow">Directory</p>
        <h2 className="central-home__title">Users</h2>
        <p className="central-home__lead">Loading directory…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="central-home">
        <p className="central-home__eyebrow">Directory</p>
        <h2 className="central-home__title">Users</h2>
        <p className="portal-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="central-home">
      <p className="central-home__eyebrow">Directory</p>
      <h2 className="central-home__title">Users</h2>
      <p className="central-home__lead">{users.length} people across apps.</p>
      <div className="central-user-list">
        {users.map((u) => (
          <div key={`${u.app || 'ws'}-${u.id}`} className="central-user-row">
            <div>
              <strong>{u.name || u.email}</strong>
              <div className="central-user-row__meta">{u.email}</div>
            </div>
            <span className="central-user-row__app">{u.app || 'workspace'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
