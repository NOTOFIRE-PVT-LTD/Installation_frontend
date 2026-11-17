import CentralLoginLangSwitch from './CentralLoginLangSwitch';
import CentralLoginEmailForm from './CentralLoginEmailForm';
import CentralLoginWhatsappPhone from './CentralLoginWhatsappPhone';
import CentralLoginWhatsappOtp from './CentralLoginWhatsappOtp';
import { useCentralLoginForm } from './useCentralLoginForm';

export default function CentralLoginForm() {
  const f = useCentralLoginForm();
  const { t } = f;

  return (
    <section className="login-form-panel">
      <div className="login-form-card">
        <div className="login-form-card__top">
          <div className="login-form-card__intro">
            <h2>{t.welcomeBack}</h2>
            <p className="lead">{t.signInLead}</p>
          </div>
          <div className="login-form-card__lang">
            <CentralLoginLangSwitch locale={f.locale} onChange={f.setLocale} label={t.language} />
          </div>
        </div>

        <div className="login-mode-tabs" role="tablist" aria-label="Login">
          <button
            type="button"
            role="tab"
            aria-selected={f.mode === 'whatsapp'}
            className={f.mode === 'whatsapp' ? 'is-active' : ''}
            onClick={() => f.switchMode('whatsapp')}
          >
            {t.whatsappLogin}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={f.mode === 'email'}
            className={f.mode === 'email' ? 'is-active' : ''}
            onClick={() => f.switchMode('email')}
          >
            {t.emailLogin}
          </button>
        </div>

        {f.error ? (
          <div className="alert alert--error" role="alert">
            {f.error}
          </div>
        ) : null}

        {f.mode === 'whatsapp' ? (
          f.whatsappStep === 'phone' ? (
            <CentralLoginWhatsappPhone
              t={t}
              phone={f.phone}
              setPhone={f.setPhone}
              rememberMe={f.rememberMe}
              setRememberMe={f.setRememberMe}
              sendingOtp={f.sendingOtp}
              onSendOtp={f.onSendOtp}
            />
          ) : (
            <CentralLoginWhatsappOtp
              t={t}
              otp={f.otp}
              setOtp={f.setOtp}
              otpSecondsLeft={f.otpSecondsLeft}
              rememberMe={f.rememberMe}
              setRememberMe={f.setRememberMe}
              loading={f.loading}
              sendingOtp={f.sendingOtp}
              onWhatsappLogin={f.onWhatsappLogin}
              onChangeNumber={() => {
                f.setWhatsappStep('phone');
                f.setOtp('');
                f.setOtpExpiresAt(null);
              }}
            />
          )
        ) : (
          <CentralLoginEmailForm
            t={t}
            email={f.email}
            setEmail={f.setEmail}
            password={f.password}
            setPassword={f.setPassword}
            showPassword={f.showPassword}
            setShowPassword={f.setShowPassword}
            rememberMe={f.rememberMe}
            setRememberMe={f.setRememberMe}
            loading={f.loading}
            onSubmit={f.onEmailSubmit}
            onForgotPassword={f.goForgot}
          />
        )}
      </div>
    </section>
  );
}
