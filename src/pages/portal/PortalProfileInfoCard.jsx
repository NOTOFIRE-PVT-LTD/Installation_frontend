export default function PortalProfileInfoCard({ p }) {
  return (
    <form className="central-profile-card" onSubmit={p.onSaveInfo}>
      <h3 className="central-profile-card__title">Profile Information</h3>
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
            Change Photo
          </button>
          {p.preview ? (
            <button type="button" className="central-page-btn" onClick={p.onRemovePhoto}>
              Delete Photo
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
        <span>Full Name</span>
        <input
          type="text"
          value={p.name}
          onChange={(e) => p.setName(e.target.value)}
          required
          maxLength={120}
        />
      </label>
      <label className="central-field">
        <span>Mobile Number</span>
        <input
          type="text"
          value={p.mobile}
          onChange={(e) => p.setMobile(e.target.value)}
          required
          maxLength={20}
        />
      </label>
      <label className="central-field">
        <span>Email</span>
        <input type="email" value={p.email} disabled readOnly />
      </label>
      {p.infoMsg ? <p className="central-profile__msg">{p.infoMsg}</p> : null}
      <button type="submit" className="central-save-btn" disabled={p.savingInfo}>
        {p.savingInfo ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
