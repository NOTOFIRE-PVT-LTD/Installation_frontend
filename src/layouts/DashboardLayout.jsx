import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/PersonOutline';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useAuth } from '../hooks/useAuth';
import { NAV_ITEMS, getDefaultLandingPath, isNavItemAllowed } from '../routes/routeConfig';
import { logout } from '../features/auth/authThunks';
import { stopImpersonation } from '../features/auth/authSlice';
import { hideSnackbar } from '../features/ui/uiSlice';
import { APP_NAME } from '../utils/constants';
import logo from '../assets/logo.png';
import GlobalSearchBar from '../components/common/GlobalSearchBar';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 76;

function isSidebarItemActive(pathname, item) {
  if (item.path === '/visits/today') return pathname === '/visits/today';
  if (item.path === '/visits/new') return pathname === '/visits/new';
  if (item.path === '/visits') {
    return (
      pathname === '/visits' ||
      (pathname.startsWith('/visits/') && pathname !== '/visits/new' && pathname !== '/visits/today')
    );
  }
  if (item.path === '/expenses') return pathname === '/expenses' || pathname.startsWith('/expenses/');
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  if (item.path === '/salesperson-tracking' && (pathname.startsWith('/visits/') || pathname.startsWith('/expenses/'))) {
    return true;
  }
  return false;
}

function useVisibleNavItems() {
  const { user, permissions } = useAuth();
  return NAV_ITEMS.filter((item) => isNavItemAllowed(item, user, permissions));
}

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [anchorEl, setAnchorEl] = useState(null);
  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, permissions } = useAuth();
  const impersonatorAdmin = useAppSelector((state) => state.auth.impersonatorAdmin);
  const snackbar = useAppSelector((state) => state.ui.snackbar);
  const navItems = useVisibleNavItems();
  // Stabilize the dependency for the effect below — navItems is a new array reference on every
  // render (from .filter()), which would otherwise re-run this effect constantly.
  const navPathsKey = useMemo(() => navItems.map((item) => item.path).join('|'), [navItems]);

  useEffect(() => {
    if (!impersonatorAdmin) return;

    const canStayOnPath =
      location.pathname === '/profile' ||
      location.pathname.startsWith('/visits/') ||
      location.pathname.startsWith('/expenses') ||
      navItems.some((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));

    if (!canStayOnPath) {
      navigate(getDefaultLandingPath(user, permissions), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impersonatorAdmin, location.pathname, navPathsKey, navigate]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleExitImpersonation = () => {
    const restoredPath = getDefaultLandingPath(impersonatorAdmin.user, impersonatorAdmin.permissions);
    dispatch(stopImpersonation());
    navigate(restoredPath, { replace: true });
  };

  const renderDrawerContent = ({ forceExpanded = false } = {}) => {
    const isCollapsed = forceExpanded ? false : collapsed;
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flex: 1, px: 1, pt: 1, overflowY: 'auto' }}>
          {navItems.map((item, index) => {
            const prev = navItems[index - 1];
            const showSection = item.section && item.section !== prev?.section && !isCollapsed;
            const active = isSidebarItemActive(location.pathname, item);
            return (
              <Box key={item.path}>
                {showSection ? (
                  <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: 2, fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                    {item.section}
                  </ListSubheader>
                ) : null}
                <Tooltip title={isCollapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    selected={active}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 999,
                      mb: 0.5,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      px: isCollapsed ? 1.5 : 2,
                      '&.Mui-selected': {
                        background: (t) => `${t.palette.primary.gradient} !important`,
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': { color: 'inherit' },
                        '& .MuiListItemText-primary': { color: 'inherit', fontWeight: 600 },
                      },
                      '&.Mui-selected:hover': {
                        background: (t) => `${t.palette.primary.gradientHover} !important`,
                      },
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        '& .MuiListItemIcon-root': { color: 'inherit' },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 40,
                        justifyContent: 'center',
                        color: active ? '#fff' : 'primary.main',
                      }}
                    >
                      <FontAwesomeIcon icon={item.icon} fixedWidth style={{ color: 'currentColor' }} />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={item.label} />}
                  </ListItemButton>
                </Tooltip>
              </Box>
            );
          })}
        </List>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 0, px: { xs: 1, sm: 0 }, minWidth: 0 }}>
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
              color="primary"
              onClick={() => (isMobile ? setMobileOpen(true) : toggleCollapsed())}
              sx={{ color: 'primary.main' }}
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
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pr: { xs: 0, sm: 2 },
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                justifyContent: 'center',
                position: 'absolute',
                left: 0,
                right: 0,
                px: 2,
                pointerEvents: 'none',
                '& > *': { pointerEvents: 'auto', width: '100%', maxWidth: 520 },
              }}
            >
              <GlobalSearchBar />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'flex', sm: 'none' }, alignItems: 'center', mr: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {APP_NAME}
              </Typography>
            </Box>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0, position: 'relative', zIndex: 1, '&:hover': { bgcolor: 'transparent' } }}
            >
              <Avatar
                src={user?.profileImage?.url}
                sx={{
                  width: 36,
                  height: 36,
                  border: 0,
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  bgcolor: 'transparent',
                  background: (t) =>
                    `${Boolean(anchorEl) ? t.palette.primary.gradientHover : t.palette.primary.gradient60} !important`,
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/profile');
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRadius: 0,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              top: 52,
              height: 'calc(100% - 52px)',
            },
          }}
        >
          {renderDrawerContent({ forceExpanded: true })}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              overflowY: 'auto',
              transition: 'width 0.2s',
              borderRadius: 0,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              top: 52,
              height: 'calc(100% - 52px)',
            },
          }}
          open
        >
          {renderDrawerContent()}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflowX: 'hidden',
          p: { xs: 1, sm: 2 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        {impersonatorAdmin && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleExitImpersonation}>
                Return to Admin
              </Button>
            }
          >
            Viewing as {user?.name} ({user?.role}) — logged in by {impersonatorAdmin.user?.name}
          </Alert>
        )}
        <Outlet />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => dispatch(hideSnackbar())} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
