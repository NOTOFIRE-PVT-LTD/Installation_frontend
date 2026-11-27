import { useId } from 'react';

/** Cream embossed tile + gold→bronze gradient glyph (ref match). */
export default function GlassIcon({ icon: Icon, size = 22, className = '', strokeWidth = 2.4 }) {
  const gid = useId().replace(/:/g, '');
  if (!Icon) return null;
  return (
    <span className={`glass-icon${className ? ` ${className}` : ''}`}>
      <span className="glass-icon__gloss" aria-hidden />
      <svg width={0} height={0} aria-hidden style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8C46A" />
            <stop offset="45%" stopColor="#D4A34E" />
            <stop offset="100%" stopColor="#8B5A1A" />
          </linearGradient>
        </defs>
      </svg>
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className="glass-icon__glyph"
        stroke={`url(#${gid})`}
        color={`url(#${gid})`}
        aria-hidden
      />
    </span>
  );
}
