function getSidebarNavItemLayoutSx(active, isCollapsed) {
  return {
    position: 'relative',
    zIndex: 2,
    borderRadius: 999,
    mb: 0.5,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    px: isCollapsed ? 1.25 : 1.5,
    py: 0.65,
    color: active ? '#241404 !important' : '#563310 !important',
    bgcolor: 'transparent !important',
    overflow: 'visible',
    transition: 'color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    borderStyle: 'solid',
    borderWidth: active ? '2px 1px 1px 2px' : '0',
    borderColor: active
      ? 'rgba(245,208,120,0.55) rgba(120,70,20,0.5) rgba(60,30,8,0.45) rgba(212,163,78,0.4)'
      : 'transparent',
    background: active
      ? 'linear-gradient(145deg, #e5b85c 0%, #d4a34e 42%, #bd832d 78%, #9a6a22 100%) !important'
      : 'transparent !important',
    boxShadow: active
      ? '0 5px 16px rgba(120,70,20,0.4), inset 0 1px 2px rgba(255,230,160,0.35), inset 0 -2px 3px rgba(80,45,10,0.25)'
      : 'none',
    '&:active': { transform: 'scale(0.97)' },
  };
}

function getSidebarNavItemTypographySx(active) {
  return {
    '& .MuiListItemIcon-root': {
      color: active ? '#241404 !important' : '#7D511E !important',
      transition: 'color 0.2s ease',
    },
    '& .MuiListItemText-root': { minWidth: 0, my: 0 },
    '& .MuiListItemText-primary': {
      color: active ? '#241404 !important' : '#563310 !important',
      fontWeight: active ? 700 : 600,
      fontSize: '0.8125rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };
}

function getSidebarNavItemInteractionSx() {
  return {
    '&:not(.Mui-selected):hover': {
      color: '#241404 !important',
      background: 'rgba(229, 184, 92, 0.22) !important',
      borderWidth: '2px 1px 1px 2px',
      borderStyle: 'solid',
      borderColor:
        'rgba(229,184,92,0.35) rgba(125,81,30,0.25) rgba(86,51,16,0.2) rgba(212,163,78,0.3)',
      '& .MuiListItemIcon-root': { color: '#563310 !important' },
      '& .MuiListItemText-primary': { color: '#241404 !important' },
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      color: '#241404 !important',
      background:
        'linear-gradient(145deg, #e5b85c 0%, #d4a34e 42%, #bd832d 78%, #9a6a22 100%) !important',
      '& .MuiListItemIcon-root': { color: '#201204 !important' },
      '& .MuiListItemIcon-root .glass-icon--nav': {
        color: '#fae2b4 !important',
        background: 'linear-gradient(145deg, #3d2410, #201204) !important',
      },
      '& .MuiListItemText-primary': { color: '#241404 !important', fontWeight: 700 },
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
