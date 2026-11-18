import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import logo from '../assets/logo.png';

export default function DashboardAppBarBrand({ drawerWidth, collapsed, isMobile, onToggleSidebar }) {
  return (
    <Box
      sx={{
        width: { xs: 'auto', sm: drawerWidth },
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', sm: collapsed ? 'center' : 'flex-start' },
        gap: 0.5,
        px: { xs: 0, sm: collapsed ? 0 : 1 },
        boxSizing: 'border-box',
        transition: 'width 0.2s',
      }}
    >
      <IconButton
        onClick={onToggleSidebar}
        sx={{ color: '#241404', '&:hover': { bgcolor: 'rgba(36, 20, 4, 0.12)' } }}
      >
        {collapsed && !isMobile ? <MenuOpenIcon /> : <MenuIcon />}
      </IconButton>
      <Box
        component="img"
        src={logo}
        alt="Valuecon"
        sx={{
          height: 32,
          maxWidth: 160,
          objectFit: 'contain',
          display: { xs: 'none', sm: collapsed ? 'none' : 'block' },
        }}
      />
    </Box>
  );
}