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
    return <PortalUsersPanel users={p.users} loading={p.usersLoading} error={p.usersError} />;
  }
  return (
    <PortalAppsCards
      access={p.access}
      busy={p.busy}
      error={p.error}
      onOpenPnl={p.openPnl}
      onPrefetchPnl={p.prefetchPnl}
      onOpenWorkspace={p.openWorkspace}
    />
  );
}

export default function PortalAppsPage() {
  const p = usePortalApps();

  return (
    <div className="central-shell">
      <PortalAppsNav
        name={p.name}
        email={p.email}
        initial={p.initial}
        menuOpen={p.menuOpen}
        menuRef={p.menuRef}
        onToggleMenu={() => p.setMenuOpen((v) => !v)}
        onProfile={p.goProfile}
        onLogout={p.onLogout}
      />
      <div className="central-body">
        {p.bothApps ? (
          <PortalSidebar
            view={p.view}
            setView={p.setView}
            access={p.access}
            bothApps={p.bothApps}
            busy={p.busy}
            onOpenPnl={p.openPnl}
            onPrefetchPnl={p.prefetchPnl}
            onOpenWorkspace={p.openWorkspace}
            usersLoading={p.usersLoading}
            userCount={p.users.length}
          />
        ) : null}
        <div className="central-main">
          <PortalMain p={p} />
        </div>
      </div>
    </div>
  );
}
