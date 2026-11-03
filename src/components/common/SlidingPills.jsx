import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

export default function SlidingPills({ items = [], value, onChange, fullWidth = false }) {
  const wrapRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const update = useCallback(() => {
    const el = btnRefs.current[value];
    if (!el) return;
    setIndicator({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      ready: true,
    });
  }, [value]);

  useLayoutEffect(() => {
    update();
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [update, items]);

  return (
    <Box
      ref={wrapRef}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 0.25,
        p: '4px',
        minWidth: 0,
        width: fullWidth ? '100%' : 'max-content',
        maxWidth: '100%',
        flexShrink: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        borderRadius: 999,
        bgcolor: '#F7EFE1',
        border: '1px solid #E2D3BE',
        alignSelf: 'stretch',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: indicator.height || 0,
          width: indicator.width || 0,
          borderRadius: 999,
          background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 40%, #C99846 100%)',
          boxShadow: '0 2px 8px rgba(88, 55, 20, 0.22)',
          transform: `translate(${indicator.left}px, ${indicator.top}px)`,
          transition: indicator.ready
            ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.3s ease, height 0.3s ease'
            : 'none',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {items.map((item) => {
        const active = item.id === value;
        return (
          <ButtonBase
            key={item.id}
            ref={(el) => {
              if (el) btnRefs.current[item.id] = el;
            }}
            onClick={() => onChange?.(item.id)}
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: fullWidth ? '1 0 auto' : '0 0 auto',
              minWidth: 'fit-content',
              px: 1.5,
              py: fullWidth ? 1 : 0.75,
              borderRadius: 999,
              fontSize: fullWidth ? { xs: '0.8125rem', sm: '0.875rem' } : '0.75rem',
              fontWeight: active ? 800 : 600,
              color: item.isAlert && !active ? '#B91C1C' : active ? '#241404' : '#6E4D27',
              whiteSpace: 'nowrap',
              transition: 'color 0.25s ease',
            }}
          >
            {item.label}
            {item.showCount ? (
              <Box
                component="span"
                sx={{
                  ml: 0.75,
                  minWidth: 18,
                  height: 18,
                  px: 0.5,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: item.isAlert ? '#DC2626' : active ? '#7D511E' : '#E5B85C',
                  color: '#fff',
                }}
              >
                {item.count ?? 0}
              </Box>
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
