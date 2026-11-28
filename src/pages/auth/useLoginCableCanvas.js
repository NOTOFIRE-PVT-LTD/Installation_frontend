import { useEffect } from 'react';

const PALETTE = [
  /* Most cables stay copper/gold */
  {
    sheath: 'rgba(168,123,50,0.28)',
    copper: 'rgba(184,107,53,0.72)',
    gold: 'rgba(232,194,122,0.88)',
  },
  {
    sheath: 'rgba(184,107,53,0.26)',
    copper: 'rgba(166,88,52,0.7)',
    gold: 'rgba(229,184,92,0.85)',
  },
  /* Soft red — clearly readable on beige, not every cable */
  {
    sheath: 'rgba(200,72,78,0.38)',
    copper: 'rgba(214,74,82,0.88)',
    gold: 'rgba(242,148,148,0.95)',
  },
  {
    sheath: 'rgba(140,72,40,0.24)',
    copper: 'rgba(198,130,58,0.68)',
    gold: 'rgba(223,182,108,0.82)',
  },
  /* Soft green — clearly readable on beige, not every cable */
  {
    sheath: 'rgba(64,138,82,0.36)',
    copper: 'rgba(68,152,96,0.86)',
    gold: 'rgba(148,208,158,0.94)',
  },
]

const DENSE_SPECS = [
  [0.14, 30, 0.01, 0.3, 0.004, 0.08, 9, 3],
  [0.26, 36, 0.0085, 1.4, 0.0034, 0.3, 10, 3],
  [0.38, 28, 0.012, 2.6, 0.0046, 0.48, 8.5, 3],
  [0.5, 34, 0.0075, 3.8, 0.003, 0.62, 10, 3],
  [0.62, 32, 0.011, 1.0, 0.0048, 0.75, 9, 3],
  [0.74, 26, 0.0095, 2.2, 0.0036, 0.88, 8, 3],
  [0.84, 38, 0.007, 4.2, 0.0042, 0.2, 11, 3],
];
const COMPACT_SPECS = [
  [0.2, 22, 0.011, 0.5, 0.004, 0.12, 8, 3],
  [0.36, 28, 0.009, 1.5, 0.0035, 0.38, 9, 3],
  [0.5, 24, 0.012, 2.5, 0.0045, 0.58, 8, 3],
  [0.64, 30, 0.0085, 3.4, 0.0038, 0.78, 9.5, 3],
  [0.78, 20, 0.013, 0.9, 0.005, 0.25, 7.5, 3],
];

/** Thick twisted multi-core cables (Gemini-style), denser on desktop. */
function makeCables(h, w) {
  const dense = w > 700;
  const specs = dense ? DENSE_SPECS : COMPACT_SPECS;
  /* Copper, copper, red, copper, green, copper, red — accents on mid cables */
  const tone = dense ? [0, 1, 2, 3, 4, 0, 2] : [0, 2, 1, 4, 3];
  return specs.map(([yRatio, amp, freq, phase, pulseSpeed, pulseOffset, sheathWidth, strands], i) => ({
    baseY: h * yRatio,
    amp,
    freq,
    phase,
    pulseSpeed,
    pulseOffset,
    sheathWidth,
    strands,
    speed: (i % 2 === 0 ? 1 : -1) * (0.011 + (i % 3) * 0.003),
    ...PALETTE[tone[i] ?? 0],
  }));
}

function cableY(c, x, t) {
  return (
    c.baseY
    + Math.sin(x * c.freq + c.phase + t * c.speed) * c.amp
    + Math.cos(x * c.freq * 0.5 - t * c.speed * 0.7) * (c.amp * 0.38)
  );
}

function strokePath(ctx, width, getY) {
  ctx.beginPath();
  for (let x = -20; x <= width + 20; x += 3) {
    const y = getY(x);
    if (x === -20) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPulse(ctx, c, t, width) {
  const progress = ((t * c.pulseSpeed + c.pulseOffset) % 1.35) - 0.12;
  const px = progress * width;
  const py = cableY(c, px, t);
  const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
  glow.addColorStop(0, 'rgba(255,252,240,0.95)');
  glow.addColorStop(0.35, 'rgba(223,170,76,0.55)');
  glow.addColorStop(1, 'rgba(198,151,73,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(px, py, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(px, py, 2.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCable(ctx, c, t, width) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = c.sheath;
  ctx.lineWidth = c.sheathWidth;
  strokePath(ctx, width, (x) => cableY(c, x, t));

  for (let s = 0; s < c.strands; s += 1) {
    const strandPhase = (s * Math.PI * 2) / c.strands;
    ctx.strokeStyle = s % 2 === 0 ? c.copper : c.gold;
    ctx.lineWidth = 2.4;
    strokePath(ctx, width, (x) => {
      const twist = Math.sin(x * 0.06 + t * 0.045 + strandPhase) * (c.sheathWidth * 0.38);
      return cableY(c, x, t) + twist;
    });
  }
  drawPulse(ctx, c, t, width);
}

/** Thick twisted copper/gold cables under the glass login card. */
export default function useLoginCableCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let time = 0;
    let cables = [];

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || 412;
      const h = parent?.clientHeight || 220;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cables = makeCables(h, w);
    };

    const tick = () => {
      const w = canvas.clientWidth;
      ctx.clearRect(0, 0, w, canvas.clientHeight);
      time += 1;
      cables.forEach((c) => drawCable(ctx, c, time, w));
      raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}
