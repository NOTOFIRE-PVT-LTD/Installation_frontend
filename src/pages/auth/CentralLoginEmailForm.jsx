import PasswordEyeIcon from './PasswordEyeIcon';

export default function CentralLoginEmailForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  loading,
  onSubmit,
  onForgotPassword,
}) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="login-password">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-password__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
          >
            <PasswordEyeIcon visible={showPassword} />
          </button>
        </div>
      </div>
      <div className="login-email-meta">
        <label className="login-remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <button type="button" className="login-link-btn login-email-meta__forgot" onClick={onForgotPassword}>
          Forgot password?
        </button>
      </div>
      <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
