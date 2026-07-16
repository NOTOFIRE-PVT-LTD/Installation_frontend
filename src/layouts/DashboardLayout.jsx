import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
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
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
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

  const renderDrawerContent = ({ collapsible = false, forceExpanded = false } = {}) => {
    const isCollapsed = forceExpanded ? false : collapsed;
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {!isCollapsed && (
            <Box component="img" src={logo} alt={APP_NAME} sx={{ height: 36, maxWidth: 160, objectFit: 'contain' }} />
          )}
          {collapsible && (
            <IconButton onClick={toggleCollapsed} size="small" sx={{ ml: isCollapsed ? 'auto' : 0, mr: isCollapsed ? 'auto' : 0 }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        <Divider />
        <List sx={{ flex: 1, px: 1 }}>
          {navItems.map((item) => (
            <Tooltip key={item.path} title={isCollapsed ? item.label : ''} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 0,
                  mb: 0.5,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 1.5 : 2,
                  '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } },
                }}
              >
                <ListItemIcon sx={{ color: item.accent?.color, minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={item.icon} fixedWidth />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          ))}
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s, margin-left 0.2s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1, px: { xs: 1, sm: 2 }, minWidth: 0 }}>
          <IconButton edge="start" sx={{ display: { sm: 'none' } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <GlobalSearchBar />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {APP_NAME}
            </Typography>
          </Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={user?.profileImage?.url} sx={{ width: 34, height: 34 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/profile');
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
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
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRadius: 0 },
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
              transition: 'width 0.2s',
              borderRadius: 0,
            },
          }}
          open
        >
          {renderDrawerContent({ collapsible: true })}
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
