import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

export default function SlidingPills({
  items: itemsProp,
  tabs,
  value: valueProp,
  activeTab,
  onChange,
  fullWidth = false,
}) {
  const items = itemsProp || tabs || [];
  const value = valueProp !== undefined ? valueProp : activeTab;
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
        background: 'linear-gradient(145deg, #F7EFE3 0%, #EFE4D2 55%, #E6D8C0 100%)',
        borderStyle: 'solid',
        borderWidth: '1.5px 1px 1px 1.5px',
        borderColor:
          'rgba(184,134,59,0.5) rgba(226,211,190,0.95) rgba(200,175,140,0.9) rgba(184,134,59,0.4)',
        boxShadow: 'inset 0 1px 1px rgba(255,252,245,0.7), 0 2px 8px rgba(120,85,40,0.08)',
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
          background: 'linear-gradient(180deg, #E8C46A 0%, #D4A34E 55%, #B8863B 100%)',
          borderStyle: 'solid',
          borderWidth: '1.5px 1px 1px 1.5px',
          borderColor:
            'rgba(245,208,120,0.55) rgba(140,89,29,0.4) rgba(100,60,15,0.35) rgba(212,163,78,0.4)',
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
