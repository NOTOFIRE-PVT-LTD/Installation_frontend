function getSidebarNavItemLayoutSx(active, isCollapsed) {
  return {
    position: 'relative',
    zIndex: 2,
    borderRadius: 999,
    mb: 0.5,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    px: isCollapsed ? 1.5 : 2,
    color: active ? '#241404 !important' : '#FAE2B4 !important',
    bgcolor: 'transparent !important',
    overflow: 'hidden',
    transition: 'color 0.25s ease, transform 0.15s ease',
    '&:active': { transform: 'scale(0.97)' },
  };
}

function getSidebarNavItemTypographySx(active) {
  return {
    '& .MuiListItemIcon-root': {
      color: active ? '#241404 !important' : '#E5B85C !important',
      transition: 'color 0.25s ease',
    },
    '& .MuiListItemText-root': { minWidth: 0, my: 0 },
    '& .MuiListItemText-primary': {
      color: active ? '#241404 !important' : '#FAE2B4 !important',
      fontWeight: 600,
      fontSize: '0.8125rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'color 0.25s ease',
    },
  };
}

function getSidebarNavItemInteractionSx() {
  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 999,
      bgcolor: 'rgba(229, 184, 92, 0.22)',
      transform: 'translateY(50%) scale(0)',
      transformOrigin: 'center bottom',
      transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
      pointerEvents: 'none',
      zIndex: -1,
      opacity: 0,
    },
    '&:not(.Mui-selected):hover::before': {
      transform: 'translateY(0) scaleX(1.4) scaleY(2.2)',
      opacity: 1,
    },
    '&:not(.Mui-selected):hover': {
      color: '#FFF2D1 !important',
      '& .MuiListItemIcon-root': { color: '#FFE997 !important' },
      '& .MuiListItemText-primary': { color: '#FFF2D1 !important' },
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      color: '#241404 !important',
      '& .MuiListItemIcon-root': { color: '#241404 !important' },
      '& .MuiListItemText-primary': { color: '#241404 !important', fontWeight: 600 },
    },
  };
}

export function getSidebarNavItemSx(active, isCollapsed) {
  return {
    ...getSidebarNavItemLayoutSx(active, isCollapsed),
    ...getSidebarNavItemTypographySx(active),
    ...getSidebarNavItemInteractionSx(),
  };
}