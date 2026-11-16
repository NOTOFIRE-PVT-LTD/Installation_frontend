import ListItemIcon from '@mui/material/ListItemIcon';
import Badge from '@mui/material/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const badgeSx = {
  '& .MuiBadge-badge': {
    fontSize: '0.625rem',
    height: 16,
    minWidth: 16,
    top: -2,
    right: -4,
    bgcolor: '#dc2626',
    color: '#fff',
    fontWeight: 800,
  },
};

export default function SidebarNavItemIcon({ icon, isCollapsed, badgeContent }) {
  return (
    <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center', color: 'inherit' }}>
      <Badge badgeContent={badgeContent} color="error" sx={badgeSx}>
        <FontAwesomeIcon icon={icon} fixedWidth style={{ color: 'currentColor' }} />
      </Badge>
    </ListItemIcon>
  );
}