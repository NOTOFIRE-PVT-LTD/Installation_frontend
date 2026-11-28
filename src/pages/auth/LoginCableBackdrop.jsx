import { useRef } from 'react';
import useLoginCableCanvas from './useLoginCableCanvas';

/** Full-bleed copper cable canvas behind login (Gemini-style under glass card). */
export default function LoginCableBackdrop() {
  const canvasRef = useRef(null);
  useLoginCableCanvas(canvasRef);

  return (
    <div className="login-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="login-bg__canvas" />
      <div className="login-bg__fade" />
    </div>
  );
}
