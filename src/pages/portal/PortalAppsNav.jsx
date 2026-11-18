export default function PortalAppsNav({
  name,
  email,
  initial,
  menuOpen,
  menuRef,
  onToggleMenu,
  onProfile,
  onLogout,
}) {
  return (
    <header className="central-navbar">
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
