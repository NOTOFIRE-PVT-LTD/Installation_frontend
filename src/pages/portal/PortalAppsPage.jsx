import PortalAppsNav from './PortalAppsNav';
import PortalAppsCards from './PortalAppsCards';
import PortalSidebar from './PortalSidebar';
import PortalUsersPanel from './PortalUsersPanel';
import PortalProfilePanel from './PortalProfilePanel';
import { usePortalApps } from './usePortalApps';
import './centralPortal.css';

function PortalMain({ p }) {
  if (p.view === 'profile') return <PortalProfilePanel />;
  if (p.view === 'users' && p.bothApps) {
    return (
      <PortalUsersPanel
        users={p.users}
        loading={p.usersLoading}
        error={p.usersError}
        onGoHome={() => p.setView('home')}
        canLoginAs={p.bothApps}
      />
    );
  }
  return (
    <PortalAppsCards
      access={p.access}
      busy={p.busy}
      error={p.error}
      onOpenPnl={p.openPnl}
      onPrefetchPnl={p.prefetchPnl}
      onOpenWorkspace={p.openWorkspace}
      onOpenLeadTrack={p.openLeadTrack}
    />
  );
}

export default function PortalAppsPage() {
  const p = usePortalApps();

  // Hide chooser until access is known; single-app users redirect away (no flash).
  if (!p.ready || !p.bothApps) {
    return (
      <div className="central-shell central-shell--redirect">
        <p className="central-home__lede">Opening your app…</p>
      </div>
    );
  }

  return (
    <div className="central-shell">
      <PortalAppsNav
        name={p.name}
        email={p.email}
        initial={p.initial}
        menuOpen={p.menuOpen}
        menuRef={p.menuRef}
        onToggleMenu={() => p.setMenuOpen((v) => !v)}
        showNavToggle={p.bothApps}
        onToggleNav={() => p.setNavOpen((v) => !v)}
        onProfile={p.goProfile}
        onLogout={p.onLogout}
      />
      <div className={`central-body${p.navOpen ? ' is-nav-open' : ''}`}>
        <PortalSidebar
          view={p.view}
          setView={(next) => {
            p.setView(next);
            p.setNavOpen(false);
          }}
          access={p.access}
          bothApps={p.bothApps}
          busy={p.busy}
          onOpenPnl={() => {
            p.setNavOpen(false);
            p.openPnl();
          }}
          onPrefetchPnl={p.prefetchPnl}
          onOpenWorkspace={() => {
            p.setNavOpen(false);
            p.openWorkspace();
          }}
          onOpenLeadTrack={() => {
            p.setNavOpen(false);
            p.openLeadTrack();
          }}
          usersLoading={p.usersLoading}
          userCount={p.users.length}
        />
        {p.navOpen ? (
          <button
            type="button"
            className="central-nav-backdrop"
            aria-label="Close menu"
            onClick={() => p.setNavOpen(false)}
          />
        ) : null}
        <div className="central-main">
          <PortalMain p={p} />
        </div>
      </div>
    </div>
  );
}
