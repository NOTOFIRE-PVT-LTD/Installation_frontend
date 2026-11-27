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
        mr: { xs: 0.5, sm: 0 },
        boxSizing: 'border-box',
        transition: 'width 0.2s',
      }}
    >
      <IconButton
        onClick={onToggleSidebar}
        aria-label="Open menu"
        sx={{
          color: '#3d2410',
          flexShrink: 0,
          mr: { xs: 0.25, sm: 0 },
          background: 'linear-gradient(145deg, #e8c46a 0%, #d4a34e 55%, #b8863b 100%) !important',
          border: '1px solid rgba(120,70,20,0.35) !important',
          boxShadow: '3px 4px 10px rgba(60,35,10,0.25), inset 0 1px 1px rgba(255,233,168,0.4) !important',
          '&:hover': {
            background: 'linear-gradient(145deg, #f0d078 0%, #e0b050 55%, #c99846 100%) !important',
          },
        }}
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