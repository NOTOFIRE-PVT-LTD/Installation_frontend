function digits(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 10);
}

export default function CentralLoginWhatsappPhone({ t, phone, setPhone, rememberMe, setRememberMe, sendingOtp, onSendOtp }) {
  return (
    <form className="form-grid" onSubmit={onSendOtp}>
      <div className="field">
        <label htmlFor="login-phone">{t.mobile}</label>
        <div className="login-phone">
          <span className="login-phone__prefix" aria-hidden="true">+91</span>
          <input
            id="login-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            required
            value={phone}
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder={t.mobile}
            onChange={(e) => setPhone(digits(e.target.value))}
          />
        </div>
      </div>
      <label className="login-remember-me">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <span>{t.rememberMe}</span>
      </label>
      <button className="btn btn-primary login-submit" type="submit" disabled={sendingOtp}>
        {sendingOtp ? t.sendingOtp : t.sendOtp}
      </button>
    </form>
  );
}
