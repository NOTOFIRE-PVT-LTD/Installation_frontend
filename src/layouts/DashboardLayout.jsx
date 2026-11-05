import { useEffect, useMemo, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
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
import { NAV_ITEMS, flattenNavItems, getDefaultLandingPath, isNavItemAllowed } from '../routes/routeConfig';
import { logout } from '../features/auth/authThunks';
import { stopImpersonation } from '../features/auth/authSlice';
import { hideSnackbar } from '../features/ui/uiSlice';
import logo from '../assets/logo.png';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import SidebarNavList from './SidebarNavList';
import { goToCentralLogin } from '../utils/centralAuth';

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
  return flattenNavItems(NAV_ITEMS).filter((item) => isNavItemAllowed(item, user, permissions));
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
  const { user, permissions, isSuperAdmin } = useAuth();
  const impersonatorAdmin = useAppSelector((state) => state.auth.impersonatorAdmin);
  const snackbar = useAppSelector((state) => state.ui.snackbar);
  const navItems = useVisibleNavItems();
  // Stabilize the dependency for the effect below — navItems is a new array reference on every
  // render (from .filter()), which would otherwise re-run this effect constantly.
  const navPathsKey = useMemo(() => navItems.map((item) => item.path).join('|'), [navItems]);

  // Keep every non–Super Admin inside apps they were granted (impersonation + normal login).
  useEffect(() => {
    if (!user || isSuperAdmin) return;

    const path = location.pathname;
    const canStayOnPath =
      path === '/profile' ||
      path === '/home' ||
      path.startsWith('/visits') ||
      path.startsWith('/expenses') ||
      path.startsWith('/leave') ||
      path === '/my-approvals' ||
      path.startsWith('/salesperson-tracking') ||
      path.startsWith('/contractor-attendance') ||
      navItems.some((item) => path === item.path || path.startsWith(`${item.path}/`));

    if (!canStayOnPath) {
      navigate(getDefaultLandingPath(user, permissions), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin, impersonatorAdmin, location.pathname, navPathsKey, navigate]);

  const handleLogout = async () => {
    await dispatch(logout());
    goToCentralLogin();
  };

  const handleExitImpersonation = () => {
    const restoredPath = getDefaultLandingPath(impersonatorAdmin.user, impersonatorAdmin.permissions);
    dispatch(stopImpersonation());
    navigate(restoredPath, { replace: true });
  };



  return (
    <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          borderRadius: 0,
          boxShadow: '0 2px 10px rgba(26, 17, 7, 0.25)',
          border: 'none',
          borderBottom: '1px solid rgba(212, 167, 85, 0.35)',
          background: 'linear-gradient(90deg, #E5B85C 0%, #C99846 15%, #8C591D 45%, #543310 70%, #2A1705 100%)',
          color: '#FFFFFF',
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
              onClick={() => (isMobile ? setMobileOpen(true) : toggleCollapsed())}
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
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pr: { xs: 0.5, sm: 2 },
            }}
          >
            {isSuperAdmin ? (
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: { xs: 'stretch', sm: 'center' } }}>
                <GlobalSearchBar placeholder={isMobile ? 'Search…' : 'Search projects, users, stations...'} />
              </Box>
            ) : (
              <Box sx={{ flex: 1, minWidth: 0 }} />
            )}
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0, flexShrink: 0, '&:hover': { bgcolor: 'transparent' } }}
            >
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
              borderRight: '1px solid rgba(212, 167, 85, 0.25)',
              boxShadow: '4px 0 20px rgba(26, 17, 7, 0.35)',
              background: 'linear-gradient(180deg, #201204 0%, #341D08 25%, #563310 50%, #82521B 72%, #B57F2F 88%, #D4A34E 100%)',
              top: 52,
              height: 'calc(100% - 52px)',
            },
          }}
        >
          <SidebarNavList isCollapsed={false} onNavigate={() => setMobileOpen(false)} />
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
              borderRight: '1px solid rgba(212, 167, 85, 0.25)',
              boxShadow: '2px 0 14px rgba(26, 17, 7, 0.25)',
              background: 'linear-gradient(180deg, #201204 0%, #341D08 25%, #563310 50%, #82521B 72%, #B57F2F 88%, #D4A34E 100%)',
              top: 52,
              height: 'calc(100% - 52px)',
            },
          }}
          open
        >
          <SidebarNavList isCollapsed={collapsed} onNavigate={() => {}} />
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
          bgcolor: '#F8F6F1',
          minHeight: '100vh',
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
