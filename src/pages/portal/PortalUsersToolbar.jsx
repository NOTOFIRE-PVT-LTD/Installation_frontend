function PortalUsersTabs({ appFilter, onAppFilterChange, counts }) {
  return (
    <div className="central-users-tabs" role="tablist" aria-label="Filter by application">
      <button
        type="button"
        className={`central-users-tab ${appFilter === 'all' ? 'is-active' : ''}`}
        onClick={() => onAppFilterChange('all')}
      >
        All ({counts.all})
      </button>
      <button
        type="button"
        className={`central-users-tab ${appFilter === 'workspace' ? 'is-active' : ''}`}
        onClick={() => onAppFilterChange('workspace')}
      >
        Workspace ({counts.workspace})
      </button>
      <button
        type="button"
        className={`central-users-tab ${appFilter === 'pnl' ? 'is-active' : ''}`}
        onClick={() => onAppFilterChange('pnl')}
      >
        P&amp;L ({counts.pnl})
      </button>
    </div>
  );
}

function PortalUsersSearch({ search, onSearchChange }) {
  return (
    <label className="central-users-search">
      <span className="sr-only">Search users</span>
      <input
        type="search"
        placeholder="Search name, email, role…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <svg className="central-users-search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79l5 5L20.49 19l-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
        />
      </svg>
    </label>
  );
}

export default function PortalUsersToolbar({
  search,
  onSearchChange,
  appFilter,
  onAppFilterChange,
  counts,
  onDownload,
  disabled,
}) {
  return (
    <div className="central-users-toolbar">
      <PortalUsersTabs
        appFilter={appFilter}
        onAppFilterChange={onAppFilterChange}
        counts={counts}
      />
      <PortalUsersSearch search={search} onSearchChange={onSearchChange} />
      <button
        type="button"
        className="central-users-download"
        onClick={onDownload}
        disabled={disabled}
        title="Download"
        aria-label="Download users CSV"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
        </svg>
      </button>
    </div>
  );
}
