import confetti from 'canvas-confetti';

const GOLD = ['#FAE2B4', '#FFE997', '#E5B85C', '#D4A34E', '#C99846', '#B57F2F', '#A37836', '#8C591D'];

function goldShapes() {
  const shapes = ['square', 'circle', 'star'];
  try {
    shapes.push(confetti.shapeFromPath({ path: 'M8 0 L16 8 L8 16 L0 8 Z' }));
    shapes.push(confetti.shapeFromPath({ path: 'M0 2 L14 2 L14 6 L0 6 Z' }));
  } catch {
    // shapeFromPath needs OffscreenCanvas
  }
  return shapes;
}

/** Gold confetti raining from the top of the page. */
export function fireCelebrationConfetti() {
  const shapes = goldShapes();
  const end = Date.now() + 1800;

  const rain = () => {
    try {
      confetti({
        particleCount: 8,
        angle: 270,
        spread: 60,
        startVelocity: 24,
        gravity: 1.2,
        ticks: 280,
        origin: { x: Math.random(), y: -0.04 },
        colors: GOLD,
        shapes,
        scalar: 0.85 + Math.random() * 0.5,
        zIndex: 9999,
        disableForReducedMotion: true,
      });
      if (Date.now() < end) requestAnimationFrame(rain);
    } catch {
      // ignore in environments without canvas support
    }
  };
  rain();
}
