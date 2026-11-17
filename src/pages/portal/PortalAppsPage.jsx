import PortalAppsNav from './PortalAppsNav';
import PortalAppsCards from './PortalAppsCards';
import PortalSidebar from './PortalSidebar';
import PortalUsersPanel from './PortalUsersPanel';
import { usePortalApps } from './usePortalApps';
import './centralPortal.css';

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
        <PortalSidebar
          view={p.view}
          setView={p.setView}
          access={p.access}
          busy={p.busy}
          onOpenPnl={p.openPnl}
          onOpenWorkspace={p.openWorkspace}
          usersLoading={p.usersLoading}
          userCount={p.users.length}
        />
        <div className="central-main">
          {p.view === 'users' ? (
            <PortalUsersPanel users={p.users} loading={p.usersLoading} error={p.usersError} />
          ) : (
            <PortalAppsCards
              access={p.access}
              busy={p.busy}
              error={p.error}
              onOpenPnl={p.openPnl}
              onOpenWorkspace={p.openWorkspace}
            />
          )}
        </div>
      </div>
    </div>
  );
}
