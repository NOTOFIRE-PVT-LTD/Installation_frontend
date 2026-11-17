function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CentralLoginWhatsappOtp({
  t,
  otp,
  setOtp,
  otpSecondsLeft,
  rememberMe,
  setRememberMe,
  loading,
  sendingOtp,
  onWhatsappLogin,
  onChangeNumber,
}) {
  const time = `${pad(Math.floor(otpSecondsLeft / 60))}:${pad(otpSecondsLeft % 60)}`;

  return (
    <form className="form-grid login-form-body" onSubmit={onWhatsappLogin}>
      <div className="login-form-body__main">
        <p className="login-otp-hint">{t.otpSentWhatsapp}</p>
        <p className={`login-otp-expiry${otpSecondsLeft <= 0 ? ' is-expired' : ''}`} role="timer">
          {otpSecondsLeft > 0 ? t.otpExpiresIn(time) : t.otpExpired}
        </p>
        <div className="field">
          <label htmlFor="login-otp">{t.enterOtpLabel}</label>
          <input
            id="login-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            maxLength={4}
            pattern="[0-9]{4}"
            placeholder={t.otpPlaceholder}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>
      </div>

      <div className="login-form-body__footer">
        <label className="login-remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>{t.rememberMe}</span>
        </label>
        <button
          className="btn btn-primary login-submit"
          type="submit"
          disabled={loading || otpSecondsLeft <= 0}
        >
          {loading ? t.signingIn : t.verifyLogin}
        </button>
        <button
          type="button"
          className="login-link-btn"
          disabled={loading || sendingOtp}
          onClick={onChangeNumber}
        >
          {t.changeNumber}
        </button>
      </div>
    </form>
  );
}
