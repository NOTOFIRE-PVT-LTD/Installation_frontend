import { useEffect, useState } from 'react';
import CentralLoginVisual from './CentralLoginVisual';
import CentralLoginForm from './CentralLoginForm';
import { getLoginCopy } from './centralLoginCopy';
import './centralLogin.css';

/** Desktop: split halves. Mobile: curvy hero + lightly frosted card. */
export default function LoginPage() {
  const [locale, setLocale] = useState(() => localStorage.getItem('portal_locale') || 'en');
  const t = getLoginCopy(locale);

  useEffect(() => {
    const sync = () => setLocale(localStorage.getItem('portal_locale') || 'en');
    window.addEventListener('portal-locale', sync);
    return () => window.removeEventListener('portal-locale', sync);
  }, []);

  return (
    <div className="login-screen">
      <CentralLoginVisual brandName={t.brandName} tagline={t.tagline} />
      <CentralLoginForm />
    </div>
  );
}
