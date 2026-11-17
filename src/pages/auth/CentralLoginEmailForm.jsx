import PasswordEyeIcon from './PasswordEyeIcon';

export default function CentralLoginEmailForm({ t, ...p }) {
  return (
    <form className="form-grid" onSubmit={p.onSubmit}>
      <div className="field">
        <label htmlFor="email">{t.email}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder={t.email}
          value={p.email}
          onChange={(e) => p.setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">{t.password}</label>
        <div className="login-password">
          <input
            id="password"
            type={p.showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder={t.password}
            value={p.password}
            onChange={(e) => p.setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-password__toggle"
            onClick={() => p.setShowPassword((v) => !v)}
            aria-label={p.showPassword ? t.hidePassword : t.showPassword}
            disabled={p.loading}
          >
            <PasswordEyeIcon visible={p.showPassword} />
          </button>
        </div>
      </div>
      <div className="login-email-meta">
        <label className="login-remember-me">
          <input
            type="checkbox"
            checked={p.rememberMe}
            onChange={(e) => p.setRememberMe(e.target.checked)}
          />
          <span>{t.rememberMe}</span>
        </label>
        <button type="button" className="login-link-btn login-email-meta__forgot" onClick={p.onForgotPassword}>
          {t.forgotPassword}
        </button>
      </div>
      <button className="btn btn-primary login-submit" type="submit" disabled={p.loading}>
        {p.loading ? t.signingIn : t.signInEmail}
      </button>
    </form>
  );
}
