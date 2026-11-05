import { useEffect, useMemo, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../hooks/useAuth';
import { NAV_ITEMS, expandNavItems } from '../routes/routeConfig';
import { complaintApi } from '../api/complaintApi';

function isSidebarItemActive(location, item) {
  const pathname = location.pathname;
  const [itemPath, itemQuery] = item.path.split('?');
  if (itemQuery) {
    if (pathname !== itemPath) return false;
    const want = new URLSearchParams(itemQuery).get('tab');
    const have = new URLSearchParams(location.search || '').get('tab');
    return (have || 'home') === (want || 'home');
  }
  if (item.path === '/complaints/desk') {
    return pathname === '/complaints/desk';
  }
  if (item.path === '/complaints/dashboard') {
    if (pathname === '/complaints/desk') return false;
    return (
      pathname === '/complaints/dashboard' ||
      pathname === '/complaints' ||
      pathname.startsWith('/complaints/')
    );
  }
  if (item.path === '/complaints') {
    if (pathname === '/complaints/desk' || pathname === '/complaints/dashboard') return false;
    return (
      pathname === '/complaints' ||
      pathname.startsWith('/complaints/') ||
      pathname === '/support' ||
      pathname.startsWith('/support/') ||
      pathname === '/submit' ||
      pathname === '/track'
    );
  }
  if (item.path === '/attendance') {
    return (
      pathname === '/attendance' ||
      pathname.startsWith('/attendance/') ||
      pathname === '/salesperson-tracking' ||
      pathname.startsWith('/salesperson-tracking/')
    );
  }
  if (item.path === '/visits/today') return pathname === '/visits/today';
  if (item.path === '/visits/new') return pathname === '/visits/new';
  if (item.path === '/visits') {
    return (
      pathname === '/visits' ||
      (pathname.startsWith('/visits/') && pathname !== '/visits/new' && pathname !== '/visits/today')
    );
  }
  if (item.path === '/expenses') return pathname === '/expenses' || pathname.startsWith('/expenses/');
  if (item.path === '/my-approvals') return pathname === '/my-approvals';
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  return false;
}

export default function SidebarNavList({ isCollapsed = false, onNavigate }) {
  const location = useLocation();
  const { user, permissions, isSuperAdmin } = useAuth();
  const navItems = useMemo(() => expandNavItems(NAV_ITEMS, user, permissions), [user, permissions]);
  const showAppSections = !isSuperAdmin && navItems.some((item) => item.section);

  const listRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({
    top: 0,
    height: 40,
    visible: false,
    ready: false,
  });
  const [unassignedComplaints, setUnassignedComplaints] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchUnassigned = async () => {
      try {
        const res = await complaintApi.dashboardMetrics();
        const kpis = res.data?.data?.kpis || res.data?.kpis;
        if (mounted && kpis?.unassignedCount != null) {
          setUnassignedComplaints(kpis.unassignedCount);
        } else if (mounted && kpis?.newTicketsCount != null) {
          setUnassignedComplaints(kpis.newTicketsCount);
        }
      } catch {
        // user might not have complaints permission
      }
    };
    fetchUnassigned();
    const interval = setInterval(fetchUnassigned, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const activeItem = useMemo(() => {
    return navItems.find((item) => isSidebarItemActive(location, item));
  }, [location, navItems]);

  const updateIndicator = useCallback(() => {
    if (!activeItem || !listRef.current) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }
    const el = itemRefs.current[activeItem.path];
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight || 40;
      setIndicator((prev) => ({
        top,
        height,
        visible: true,
        ready: true,
      }));
    }
  }, [activeItem]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, isCollapsed, navItems]);

  useEffect(() => {
    updateIndicator();
    const t1 = setTimeout(updateIndicator, 50);
    const t2 = setTimeout(updateIndicator, 220); // Sync after drawer 0.2s transition finishes
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateIndicator, isCollapsed]);

  useEffect(() => {
    if (!listRef.current) return;
    const observer = new ResizeObserver(() => {
      updateIndicator();
    });
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List
        ref={listRef}
        sx={{
          position: 'relative',
          flex: 1,
          px: 1,
          pt: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: isCollapsed ? 'calc(50% - 22px)' : 8,
            width: isCollapsed ? 44 : 'calc(100% - 16px)',
            height: indicator.height,
            borderRadius: 999,
            background: 'linear-gradient(180deg, #FFE997 0%, #E5B85C 42%, #D4A34E 100%)',
            boxShadow: '0 2px 10px rgba(32, 18, 4, 0.28)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: indicator.visible ? 1 : 0,
            transform: `translateY(${indicator.top}px)`,
            willChange: 'transform',
            transition: indicator.ready
              ? 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), left 0.22s ease, width 0.22s ease, height 0.22s ease, opacity 0.2s ease'
              : 'none',
          }}
        />

        {navItems.map((item, index) => {
          const prev = navItems[index - 1];
          const showSection =
            showAppSections && item.section && item.section !== prev?.section && !isCollapsed;
          const active = isSidebarItemActive(location, item);
          return (
            <Box key={item.path}>
              {showSection ? (
                <ListSubheader
                  disableSticky
                  sx={{
                    bgcolor: 'transparent',
                    color: '#F2CE7A',
                    lineHeight: 2,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.section}
                </ListSubheader>
              ) : null}
              <Tooltip title={isCollapsed ? item.label : ''} placement="right">
                <ListItemButton
                  ref={(el) => {
                    if (el) itemRefs.current[item.path] = el;
                  }}
                  component={NavLink}
                  to={item.path}
                  selected={active}
                  onClick={onNavigate}
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    borderRadius: 999,
                    mb: 0.5,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: isCollapsed ? 1.5 : 2,
                    color: active ? '#241404 !important' : '#FAE2B4 !important',
                    bgcolor: 'transparent !important',
                    overflow: 'hidden',
                    transition: 'color 0.25s ease, transform 0.15s ease',
                    '&:active': {
                      transform: 'scale(0.97)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: active ? '#241404 !important' : '#E5B85C !important',
                      transition: 'color 0.25s ease',
                    },
                    '& .MuiListItemText-root': {
                      minWidth: 0,
                      my: 0,
                    },
                    '& .MuiListItemText-primary': {
                      color: active ? '#241404 !important' : '#FAE2B4 !important',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.25s ease',
                    },
                    // Kiro-Style Expanding Pill Bubble Micro-Interaction on Hover
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 999,
                      bgcolor: 'rgba(229, 184, 92, 0.22)',
                      transform: 'translateY(50%) scale(0)',
                      transformOrigin: 'center bottom',
                      transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                      pointerEvents: 'none',
                      zIndex: -1,
                      opacity: 0,
                    },
                    '&:not(.Mui-selected):hover::before': {
                      transform: 'translateY(0) scaleX(1.4) scaleY(2.2)',
                      opacity: 1,
                    },
                    '&:not(.Mui-selected):hover': {
                      color: '#FFF2D1 !important',
                      '& .MuiListItemIcon-root': { color: '#FFE997 !important' },
                      '& .MuiListItemText-primary': { color: '#FFF2D1 !important' },
                    },
                    // When selected, keep text & icon deep brown ALWAYS (never white on hover)
                    '&.Mui-selected, &.Mui-selected:hover': {
                      color: '#241404 !important',
                      '& .MuiListItemIcon-root': { color: '#241404 !important' },
                      '& .MuiListItemText-primary': { color: '#241404 !important', fontWeight: 600 },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 40,
                      justifyContent: 'center',
                      color: 'inherit',
                    }}
                  >
                    <Badge
                      badgeContent={
                        isCollapsed && item.path === '/complaints/dashboard' ? unassignedComplaints : 0
                      }
                      color="error"
                      sx={{
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
                      }}
                    >
                      <FontAwesomeIcon icon={item.icon} fixedWidth style={{ color: 'currentColor' }} />
                    </Badge>
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />}
                  {!isCollapsed && item.path === '/complaints/dashboard' && unassignedComplaints > 0 && (
                    <Box
                      sx={{
                        ml: 'auto',
                        minWidth: 20,
                        height: 20,
                        px: 0.75,
                        borderRadius: 10,
                        bgcolor: active ? '#991B1B' : '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.45)',
                      }}
                    >
                      {unassignedComplaints}
                    </Box>
                  )}
                </ListItemButton>
              </Tooltip>
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

