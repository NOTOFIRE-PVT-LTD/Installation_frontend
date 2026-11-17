import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';

export default function DashboardAppBarUserAvatar({ user, onOpenMenu }) {
  return (
    <IconButton onClick={onOpenMenu} sx={{ p: 0, flexShrink: 0, '&:hover': { bgcolor: 'transparent' } }}>
      <Avatar
        src={user?.profileImage?.url}
        sx={{
          width: 36,
          height: 36,
          border: '1.5px solid #FAE2B4',
          color: '#241404',
          fontSize: '0.8125rem',
          fontWeight: 800,
          bgcolor: 'transparent',
          background: 'linear-gradient(135deg, #FAE2B4 0%, #E5B85C 50%, #D4A34E 100%) !important',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {user?.name?.[0]?.toUpperCase()}
      </Avatar>
    </IconButton>
  );
}