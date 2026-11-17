import { usePortalProfile } from './usePortalProfile';

export default function PortalProfilePanel() {
  const p = usePortalProfile();

  return (
    <div className="central-profile-wrap">
      <div className="central-profile">
        <p className="central-home__eyebrow">Account</p>
        <h2 className="central-users__title">Edit profile</h2>
        <p className="central-users__lead">
          Update your photo, name, or password for Centralisation.
        </p>
        <form className="central-profile__form" onSubmit={p.onSubmit}>
          <div className="central-avatar-edit">
            <button
              type="button"
              className="central-avatar-edit__preview"
              onClick={() => p.fileRef.current?.click()}
              aria-label="Change profile picture"
            >
              {p.preview ? <img src={p.preview} alt="" /> : <span>{p.initial}</span>}
            </button>
            <div className="central-avatar-edit__actions">
              <button type="button" className="central-page-btn" onClick={() => p.fileRef.current?.click()}>
                Upload photo
              </button>
              {p.preview ? (
                <button type="button" className="central-page-btn" onClick={p.onRemovePhoto}>
                  Remove
                </button>
              ) : null}
              <input
                ref={p.fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={p.onPickFile}
              />
            </div>
          </div>

          <label className="central-field">
            <span>Email</span>
            <input type="email" value={p.email} disabled readOnly />
          </label>
          <label className="central-field">
            <span>Name</span>
            <input
              type="text"
              value={p.name}
              onChange={(e) => p.setName(e.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label className="central-field">
            <span>Mobile</span>
            <input
              type="text"
              value={p.mobile}
              onChange={(e) => p.setMobile(e.target.value)}
              required
              maxLength={20}
            />
          </label>
          <label className="central-field">
            <span>Current password</span>
            <input
              type="password"
              value={p.currentPwd}
              onChange={(e) => p.setCurrentPwd(e.target.value)}
              autoComplete="current-password"
              placeholder="Only if changing password"
            />
          </label>
          <label className="central-field">
            <span>New password</span>
            <input
              type="password"
              value={p.newPwd}
              onChange={(e) => p.setNewPwd(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
          </label>
          <label className="central-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={p.confirmPwd}
              onChange={(e) => p.setConfirmPwd(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat new password"
            />
          </label>
          {p.msg ? <p className="central-profile__msg">{p.msg}</p> : null}
          <button type="submit" className="central-save-btn" disabled={p.saving}>
            {p.saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
