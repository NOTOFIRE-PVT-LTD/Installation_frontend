export default function PortalAppsNav({
  name,
  email,
  initial,
  menuOpen,
  menuRef,
  onToggleMenu,
  onToggleNav,
  showNavToggle,
  onProfile,
  onLogout,
}) {
  return (
    <header className="central-navbar">
      {showNavToggle ? (
        <button
          type="button"
          className="central-navbar__menu"
          aria-label="Open menu"
          onClick={onToggleNav}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      <div className="central-navbar__brand">
        <img
          src={`${import.meta.env.BASE_URL}brand/valuecon.png`}
          alt="Valuecon"
          className="central-navbar__brand-logo"
        />
      </div>
      <div className="central-navbar__spacer" />
      <div className="central-navbar__user" ref={menuRef}>
        <button type="button" className="central-avatar" onClick={onToggleMenu}>
          {initial}
        </button>
        {menuOpen ? (
          <div className="central-menu" role="menu">
            <div className="central-menu__meta">
              <strong>{name}</strong>
              <span>{email}</span>
            </div>
            <button type="button" onClick={onProfile}>Edit profile</button>
            <button type="button" onClick={onLogout}>Logout</button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
