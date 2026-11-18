export default function PortalAppsCards({
  access,
  busy,
  error,
  onOpenPnl,
  onPrefetchPnl,
  onOpenWorkspace,
}) {
  return (
    <main className="central-home">
      <p className="central-home__eyebrow">Valuecon</p>
      <h2 className="central-home__title">All your apps. One place.</h2>
      <p className="central-home__lead">
        Valuecon Centralisation — open P&amp;L or Workspace below. One login. No second sign-in.
      </p>
      <p className="central-home__sub">Plant numbers. Field work. Connected.</p>
      <div className="central-home__apps">
        {access.pnl ? (
          <button
            type="button"
            className="central-home__app-btn"
            disabled={busy !== null}
            onClick={onOpenPnl}
            onPointerEnter={onPrefetchPnl}
            onFocus={onPrefetchPnl}
          >
            <span>P&amp;L</span>
            <span className="central-home__app-hint">{busy === 'pnl' ? '…' : 'Open'}</span>
          </button>
        ) : null}
        {access.workspace ? (
          <button type="button" className="central-home__app-btn" disabled={busy !== null} onClick={onOpenWorkspace}>
            <span>Workspace</span>
            <span className="central-home__app-hint">{busy === 'workspace' ? '…' : 'Open'}</span>
          </button>
        ) : null}
      </div>
      {error ? <p className="portal-error">{error}</p> : null}
    </main>
  );
}
