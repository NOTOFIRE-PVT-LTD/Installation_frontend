import ValueconWordmark from './ValueconWordmark';
import LoginCableBackdrop from './LoginCableBackdrop';

/** Left / top brand half — cables stay inside this panel (desktop split). */
export default function CentralLoginVisual({ brandName, tagline }) {
  return (
    <section className="login-visual" aria-label={brandName || 'VALUECON'}>
      <LoginCableBackdrop />
      <svg
        className="login-visual__wave"
        viewBox="0 0 412 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,42 C95,96 175,12 285,52 C345,74 385,48 412,36 L412,120 L0,120 Z"
          fill="rgba(232,215,185,0.55)"
        />
        <path
          d="M0,66 C110,22 205,108 315,62 C360,44 390,56 412,68 L412,120 L0,120 Z"
          fill="rgba(243,232,211,0.85)"
        />
        <path d="M0,92 C125,118 245,48 412,90 L412,120 L0,120 Z" fill="#f6f0e4" />
      </svg>
      <div className="login-visual__content">
        <ValueconWordmark />
        <p className="login-visual__tagline">{tagline}</p>
      </div>
    </section>
  );
}
