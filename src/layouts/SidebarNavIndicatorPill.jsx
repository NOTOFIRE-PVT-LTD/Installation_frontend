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
        background: 'linear-gradient(180deg, #FFE997 0%, #E5B85C 42%, #D4A34E 100%)',
        boxShadow: '0 2px 10px rgba(32, 18, 4, 0.28)',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: indicator.visible ? 1 : 0,
        transform: `translateY(${indicator.top}px)`,
        willChange: 'transform',
        transition,
      }}
    />
  );
}