import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from '../../features/auth/authThunks';
import CentralLoginEmailForm from './CentralLoginEmailForm';

export default function CentralLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error: storeError } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);

  async function onEmailSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await dispatch(login({ email: email.trim(), password }));
    if (res.error) {
      setError(res.payload || 'Invalid email or password');
      return;
    }
    const from = location.state?.from?.pathname;
    navigate(from && from !== '/login' ? from : '/apps', { replace: true });
  }

  return (
    <section className="login-form-panel">
      <div className="login-form-card">
        <div className="login-form-card__top">
          <div className="login-form-card__intro">
            <h2>Welcome back</h2>
            <p className="lead">Sign in to Centralisation — then open P&amp;L or Workspace.</p>
          </div>
        </div>

        <div className="login-mode-tabs" role="tablist" aria-label="Login">
          <button type="button" role="tab" aria-selected className="is-active">
            Email
          </button>
        </div>

        {error || storeError ? (
          <div className="alert alert--error" role="alert">
            {error || storeError}
          </div>
        ) : null}

        <CentralLoginEmailForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          loading={status === 'loading'}
          onSubmit={onEmailSubmit}
          onForgotPassword={() => navigate('/forgot-password')}
        />
      </div>
    </section>
  );
}
