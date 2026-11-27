import Box from '@mui/material/Box';

export default function SidebarNavIndicatorPill({ indicator, isCollapsed }) {
  const transition = indicator.ready
    ? 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), left 0.22s ease, width 0.22s ease, height 0.22s ease, opacity 0.2s ease'
    : 'none';

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: isCollapsed ? 'calc(50% - 22px)' : 8,
        width: isCollapsed ? 44 : 'calc(100% - 16px)',
        height: indicator.height,
        borderRadius: 999,
        background: 'linear-gradient(145deg, #e5b85c 0%, #d4a34e 42%, #bd832d 78%, #9a6a22 100%)',
        borderStyle: 'solid',
        borderWidth: '2px 1px 1px 2px',
        borderColor:
          'rgba(245,208,120,0.55) rgba(120,70,20,0.5) rgba(60,30,8,0.45) rgba(212,163,78,0.4)',
        boxShadow:
          '0 5px 16px rgba(120,70,20,0.4), inset 0 1px 2px rgba(255,230,160,0.35), inset 0 -2px 3px rgba(80,45,10,0.25)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 1,
        opacity: indicator.visible ? 1 : 0,
        transform: `translateY(${indicator.top}px)`,
        willChange: 'transform',
        transition,
      }}
    />
  );
}