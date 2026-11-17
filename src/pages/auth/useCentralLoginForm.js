import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { login, loginWithOtp } from '../../features/auth/authThunks';
import { authApi } from '../../api/authApi';
import { getLoginCopy } from './centralLoginCopy';

export function useCentralLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [locale, setLocale] = useState(() => localStorage.getItem('portal_locale') || 'en');
  const t = getLoginCopy(locale);
  const [mode, setMode] = useState('whatsapp');
  const [whatsappStep, setWhatsappStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  useEffect(() => {
    localStorage.setItem('portal_locale', locale);
    window.dispatchEvent(new Event('portal-locale'));
  }, [locale]);

  useEffect(() => {
    if (!otpExpiresAt) return undefined;
    const tick = () => setOtpSecondsLeft(Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  function goApps() {
    const from = location.state?.from?.pathname;
    navigate(from && from !== '/login' ? from : '/apps', { replace: true });
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    if (next === 'whatsapp') {
      setWhatsappStep('phone');
      setOtp('');
      setOtpExpiresAt(null);
    }
  }

  async function onSendOtp(e) {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) {
      setError(t.invalidPhone);
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await authApi.requestOtp(`+91${phone}`);
      if (!data?.ok && !data?.success) throw new Error(data?.message || 'otp');
      setWhatsappStep('otp');
      setOtp(data.devCode || '');
      setOtpExpiresAt(data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 600_000);
    } catch {
      setError(t.couldNotSendOtp);
    } finally {
      setSendingOtp(false);
    }
  }

  async function onWhatsappLogin(e) {
    e.preventDefault();
    setError(null);
    if (otpSecondsLeft <= 0) {
      setError(t.otpExpiredRequest);
      return;
    }
    if (otp.trim().length !== 4) {
      setError(t.enterOtp);
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch(loginWithOtp({ phone: `+91${phone}`, code: otp.trim() }));
      if (res.error) {
        setError(res.payload || t.invalidOtp);
        return;
      }
      goApps();
    } catch {
      setError(t.signInFailed);
    } finally {
      setLoading(false);
    }
  }

  async function onEmailSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await dispatch(
        login({ email: email.trim().toLowerCase(), password: password.trim() }),
      );
      if (res.error) {
        setError(res.payload || t.invalidEmailPassword);
        return;
      }
      goApps();
    } catch {
      setError(t.signInFailed);
    } finally {
      setLoading(false);
    }
  }

  return {
    t,
    locale,
    setLocale,
    mode,
    switchMode,
    whatsappStep,
    setWhatsappStep,
    phone,
    setPhone,
    otp,
    setOtp,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    error,
    loading,
    sendingOtp,
    otpSecondsLeft,
    onSendOtp,
    onWhatsappLogin,
    onEmailSubmit,
    setOtpExpiresAt,
    goForgot: () => navigate('/forgot-password'),
  };
}
