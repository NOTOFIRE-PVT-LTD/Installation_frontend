import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * TwoButtonPill - Luxury Gold & Bronze Segmented Switcher with Kiro-Style Sliding Pill Animation
 * 
 * Inspired by Kiro.dev's micro-interactions:
 * - Fluid sliding indicator with spring overshoot easing (cubic-bezier)
 * - Radial / pill bubble expansion on hover (transform scale + translateY)
 * - Deep brown text on yellow indicator / golden text on brown background
 */
export default function TwoButtonPill({
  options = [],
  value,
  onChange,
  size = 'medium',
  sx = {},
}) {
  const activeIndex = useMemo(() => {
    const idx = options.findIndex((opt) => opt.value === value || opt.to === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const isSmall = size === 'small';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        p: '4px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, rgba(88, 55, 20, 0.12) 0%, rgba(36, 20, 4, 0.18) 100%)',
        border: '1px solid rgba(212, 163, 78, 0.4)',
        boxShadow: 'inset 0 1px 4px rgba(32, 18, 4, 0.15), 0 2px 8px rgba(36, 20, 4, 0.08)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        ...sx,
      }}
    >
      {/* Sliding Active Pill Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 4,
          width: 'calc(50% - 4px)',
          borderRadius: 999,
          background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%)',
          boxShadow: '0 4px 14px rgba(32, 18, 4, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          transform: `translateX(${activeIndex * 100}%)`,
          transition: 'transform 0.32s cubic-bezier(0.34, 1.25, 0.64, 1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Button Options */}
      {options.map((opt, idx) => {
        const isActive = activeIndex === idx;
        const Component = opt.to ? RouterLink : 'button';
        const componentProps = opt.to
          ? { component: RouterLink, to: opt.to }
          : { type: 'button', onClick: () => onChange?.(opt.value) };

        return (
          <Box
            key={opt.value || opt.label || idx}
            {...componentProps}
            sx={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              py: isSmall ? 0.6 : 0.85,
              px: isSmall ? 1.75 : 2.5,
              borderRadius: 999,
              cursor: 'pointer',
              textDecoration: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              overflow: 'hidden', // Contain the Kiro bubble expand
              transition: 'color 0.25s ease, transform 0.15s ease',
              '&:active': {
                transform: 'scale(0.97)',
              },
              // Kiro-style expanding bubble on hover
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                background: 'rgba(255, 233, 151, 0.22)',
                transform: 'translateY(50%) scale(0)',
                transformOrigin: 'center bottom',
                transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                pointerEvents: 'none',
                zIndex: -1,
                opacity: 0,
              },
              '&:not(:disabled):hover::after': {
                transform: 'translateY(0) scaleX(1.4) scaleY(2.2)',
                opacity: 1,
              },
            }}
          >
            {opt.icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? '#241404' : '#583714',
                  transition: 'color 0.25s ease',
                  '& svg': { fontSize: isSmall ? '1rem' : '1.15rem' },
                }}
              >
                {opt.icon}
              </Box>
            )}
            <Typography
              sx={{
                fontSize: isSmall ? '0.75rem' : '0.8125rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#241404' : '#583714',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                transition: 'color 0.25s ease',
              }}
            >
              {opt.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

