/** Metallic VALUECON® mark adapted from the Gemini login mock (SVG, no Tailwind). */
export default function ValueconWordmark({ className = 'login-visual__logo' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VALUECON"
    >
      <defs>
        <linearGradient id="vcCopper" x1="0%" y1="15%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#8C4828" />
          <stop offset="16%" stopColor="#D4845A" />
          <stop offset="32%" stopColor="#F2B48C" />
          <stop offset="50%" stopColor="#A65834" />
          <stop offset="68%" stopColor="#DF9066" />
          <stop offset="84%" stopColor="#F4B790" />
          <stop offset="100%" stopColor="#8A4626" />
        </linearGradient>
        <linearGradient id="vcSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9A512E" />
          <stop offset="48%" stopColor="#E79B70" />
          <stop offset="78%" stopColor="#F6BE98" />
          <stop offset="100%" stopColor="#8D4726" />
        </linearGradient>
      </defs>
      <path d="M12 10 L18.5 10 L32.5 47.5 L46.5 10 L52.5 10 L34.2 58 L30.8 58 Z" fill="url(#vcSheen)" />
      <path d="M72.5 13 L76 13 L92.5 48 L86.8 48 L82.6 38.8 L65.8 38.8 L61.6 48 L56.2 48 Z M74.2 20.5 L67.8 34.4 L80.6 34.4 Z" fill="url(#vcCopper)" />
      <path d="M101.5 13.5 L106.8 13.5 L106.8 43.4 L125.5 43.4 L125.5 48 L101.5 48 Z" fill="url(#vcSheen)" />
      <path d="M135.5 13.5 L140.8 13.5 L140.8 34.2 C140.8 40.5 144.6 44 150.5 44 C156.4 44 160.2 40.5 160.2 34.2 L160.2 13.5 L165.5 13.5 L165.5 34.5 C165.5 43.4 159.6 48.6 150.5 48.6 C141.4 48.6 135.5 43.4 135.5 34.5 Z" fill="url(#vcCopper)" />
      <path d="M178.5 13.5 L203 13.5 L203 18.1 L183.8 18.1 L183.8 28.2 L200.5 28.2 L200.5 32.7 L183.8 32.7 L183.8 43.4 L203.5 43.4 L203.5 48 L178.5 48 Z" fill="url(#vcSheen)" />
      <path d="M241.5 20.2 C238.6 18.1 235.2 17.2 231.4 17.2 C223.4 17.2 217.8 22.8 217.8 30.8 C217.8 38.8 223.4 44.3 231.4 44.3 C235.3 44.3 238.7 43.3 241.6 41.2 L244.4 45.1 C240.8 47.7 236.4 49 231.2 49 C220.2 49 212.2 41.5 212.2 30.8 C212.2 20 220.2 12.6 231.3 12.6 C236.5 12.6 240.8 13.9 244.3 16.4 Z" fill="url(#vcCopper)" />
      <path d="M280.8 16.8 A 17.4 17.4 0 1 1 259.6 16.8" stroke="url(#vcCopper)" strokeWidth="4.9" fill="none" />
      <rect x="267.8" y="9.2" width="4.8" height="20.5" fill="url(#vcSheen)" />
      <path d="M299.5 13.5 L304.4 13.5 L324.6 39.6 L324.6 13.5 L329.8 13.5 L329.8 48 L325.2 48 L304.7 21.5 L304.7 48 L299.5 48 Z" fill="url(#vcCopper)" />
      <circle cx="342" cy="13.5" r="7.5" stroke="#8C5327" strokeWidth="1.2" fill="rgba(255,252,246,0.22)" />
      <text x="342" y="16.6" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="9.5" fontWeight="700" fill="#6F3F1B">
        R
      </text>
    </svg>
  );
}
