import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/PersonOutline';

export default function DashboardUserMenu({ anchorEl, onClose, onProfile, onLogout }) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem
        onClick={() => {
          onClose();
          onProfile();
        }}
      >
        <ListItemIcon sx={{ color: 'primary.main' }}>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem onClick={onLogout}>
        <ListItemIcon sx={{ color: 'primary.main' }}>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
}