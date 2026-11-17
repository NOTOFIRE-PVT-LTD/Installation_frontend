export default function CentralLoginLangSwitch({ locale, onChange, label }) {
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      <button
        type="button"
        className={`lang-switch__btn${locale === 'en' ? ' is-active' : ''}`}
        aria-pressed={locale === 'en'}
        onClick={() => onChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-switch__btn${locale === 'hi' ? ' is-active' : ''}`}
        aria-pressed={locale === 'hi'}
        onClick={() => onChange('hi')}
      >
        हिं
      </button>
    </div>
  );
}
