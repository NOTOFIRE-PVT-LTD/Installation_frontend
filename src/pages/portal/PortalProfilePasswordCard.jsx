export default function PortalProfilePasswordCard({ p }) {
  return (
    <form className="central-profile-card" onSubmit={p.onSavePassword}>
      <h3 className="central-profile-card__title">Change Password</h3>
      <label className="central-field">
        <span>Current Password</span>
        <input
          type="password"
          value={p.currentPwd}
          onChange={(e) => p.setCurrentPwd(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <label className="central-field">
        <span>New Password</span>
        <input
          type="password"
          value={p.newPwd}
          onChange={(e) => p.setNewPwd(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          required
        />
      </label>
      <label className="central-field">
        <span>Confirm New Password</span>
        <input
          type="password"
          value={p.confirmPwd}
          onChange={(e) => p.setConfirmPwd(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          required
        />
      </label>
      {p.pwdMsg ? <p className="central-profile__msg">{p.pwdMsg}</p> : null}
      <button type="submit" className="central-save-btn" disabled={p.savingPwd}>
        {p.savingPwd ? 'Updating…' : 'Change Password'}
      </button>
    </form>
  );
}
