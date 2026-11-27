import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';

export default function DashboardAppBarUserAvatar({ user, onOpenMenu }) {
  return (
    <IconButton
      onClick={onOpenMenu}
      sx={{
        p: 0,
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: '50% !important',
        background: 'transparent !important',
        border: 'none !important',
        boxShadow: 'none !important',
        '&:hover': { bgcolor: 'transparent !important', filter: 'brightness(1.05)' },
      }}
    >
      <Avatar
        src={user?.profileImage?.url}
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50% !important',
          border: '2px solid #FAE2B4',
          color: '#241404',
          fontSize: '0.8125rem',
          fontWeight: 800,
          bgcolor: 'transparent',
          background: 'linear-gradient(165deg, #ffe9a8 0%, #f0c86a 45%, #d4a34e 100%) !important',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {user?.name?.[0]?.toUpperCase()}
      </Avatar>
    </IconButton>
  );
}
