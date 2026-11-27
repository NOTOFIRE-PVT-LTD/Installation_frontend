import { AppsIcon, ChartIcon, HomeIcon, UsersIcon } from './portalSideIcons';

export default function PortalSidebar({
  view,
  setView,
  access,
  bothApps,
  busy,
  onOpenPnl,
  onPrefetchPnl,
  onOpenWorkspace,
  usersLoading,
  userCount,
}) {
  return (
    <aside className="central-sidebar" aria-label="Centralisation navigation">
      {bothApps ? (
        <button
          type="button"
          className={`central-side-btn${view === 'home' ? ' is-active' : ''}`}
          onClick={() => setView('home')}
        >
          <span className="central-side-btn__left">
            <HomeIcon />
            <span>Home</span>
          </span>
        </button>
      ) : null}

      <p className="central-side-label">Applications</p>
      {access.pnl ? (
        <button
          type="button"
          className="central-side-btn"
          onClick={onOpenPnl}
          onPointerEnter={onPrefetchPnl}
          onFocus={onPrefetchPnl}
          disabled={busy !== null}
        >
          <span className="central-side-btn__left">
            <ChartIcon />
            <span>P&amp;L</span>
          </span>
          <span className="central-side-hint">{busy === 'pnl' ? '…' : 'Open'}</span>
        </button>
      ) : null}
      {access.workspace ? (
        <button
          type="button"
          className="central-side-btn"
          onClick={onOpenWorkspace}
          disabled={busy !== null}
        >
          <span className="central-side-btn__left">
            <AppsIcon />
            <span>Workspace</span>
          </span>
          <span className="central-side-hint">{busy === 'workspace' ? '…' : 'Open'}</span>
        </button>
      ) : null}
      {bothApps ? (
        <>
          <p className="central-side-label">Directory</p>
          <button
            type="button"
            className={`central-side-btn${view === 'users' ? ' is-active' : ''}`}
            onClick={() => setView('users')}
          >
            <span className="central-side-btn__left">
              <UsersIcon />
              <span>Users</span>
            </span>
            <span className="central-side-hint">{usersLoading ? '…' : String(userCount)}</span>
          </button>
        </>
      ) : null}
    </aside>
  );
}
