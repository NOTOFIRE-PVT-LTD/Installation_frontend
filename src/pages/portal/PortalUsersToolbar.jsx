export default function PortalUsersToolbar({ search, onSearchChange, onDownload, disabled }) {
  return (
    <div className="central-users-toolbar">
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
