/** Shown while single-app SSO runs, or when access load fails. */
export default function PortalOpeningScreen({ error, onRetry, onSignIn }) {
  return (
    <div className="central-shell central-shell--redirect">
      {error ? (
        <>
          <p className="central-home__lede">{error}</p>
          <div className="central-home__apps" style={{ marginTop: '1rem', maxWidth: '16rem' }}>
            {onRetry ? (
              <button type="button" className="central-home__app-btn" onClick={onRetry}>
                <span>Try again</span>
              </button>
            ) : null}
            {onSignIn ? (
              <button type="button" className="central-home__app-btn" onClick={onSignIn}>
                <span>Sign in</span>
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="central-home__lede">Opening your app…</p>
      )}
    </div>
  );
}
