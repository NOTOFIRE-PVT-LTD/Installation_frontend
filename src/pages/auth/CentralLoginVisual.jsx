/** Left-panel brand atmosphere — Valuecon gold & brown cable art. */
export default function CentralLoginVisual() {
  return (
    <section className="login-visual" aria-hidden="true">
      <div className="login-visual__blob login-visual__blob--gold" />
      <div className="login-visual__blob login-visual__blob--brown" />
      <div className="login-visual__blob login-visual__blob--amber" />
      <svg className="login-visual__cables" viewBox="0 0 640 820" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="cableGradA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#563310" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E5B85C" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="cableGradB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C99846" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38200A" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="cableGradC" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7D511E" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FAE2B4" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {[
          { d: 'M -60,110 C 140,170 240,300 430,350', grad: 'cableGradA', cls: 'cable-line--1' },
          { d: 'M -60,280 C 110,270 280,410 430,350', grad: 'cableGradC', cls: 'cable-line--2' },
          { d: 'M -60,470 C 150,440 270,380 430,350', grad: 'cableGradA', cls: 'cable-line--3' },
          { d: 'M -60,650 C 190,600 300,420 430,350', grad: 'cableGradC', cls: 'cable-line--4' },
          { d: 'M 430,350 C 500,430 540,560 520,720', grad: 'cableGradB', cls: 'cable-line--5' },
          { d: 'M 430,350 C 490,390 610,410 700,370', grad: 'cableGradB', cls: 'cable-line--6' },
        ].map((c) => (
          <path key={c.cls} className={`cable-line ${c.cls}`} d={c.d} stroke={`url(#${c.grad})`} strokeWidth="3" strokeLinecap="round" />
        ))}
        <circle className="cable-ring cable-ring--1" cx="430" cy="350" r="10" stroke="#D4A34E" strokeWidth="1.5" />
        <circle className="cable-ring cable-ring--2" cx="430" cy="350" r="10" stroke="#563310" strokeWidth="1.5" />
        <circle className="cable-node" cx="430" cy="350" r="7" fill="#FFFDF8" />
      </svg>
      <div className="login-visual__content">
        <h1 className="login-visual__brand">Valuecon</h1>
        <p className="login-visual__tagline">Plant numbers. Field work. One login.</p>
      </div>
    </section>
  );
}
