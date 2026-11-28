import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { useAuth } from '../hooks/useAuth';
import { usePortalAccess } from '../pages/portal/usePortalAccess';
import { NAV_ITEMS, expandNavItems, listWorkspaceApps } from '../routes/routeConfig';
import { filterPortalNavItems } from './filterPortalNavItems';
import { scopeWorkspaceSidebarNav } from './scopeWorkspaceSidebarNav';
import { isSidebarItemActive } from './sidebarNavActive';
import { useUnassignedComplaintsCount } from './useUnassignedComplaintsCount';
import { useSidebarNavIndicator } from './useSidebarNavIndicator';
import SidebarNavIndicatorPill from './SidebarNavIndicatorPill';
import SidebarNavListItems from './SidebarNavListItems';

export default function SidebarNavList({ isCollapsed = false, onNavigate }) {
  const location = useLocation();
  const { user, permissions } = useAuth();
  const { access, ready } = usePortalAccess();
  const bothApps = Boolean(access.pnl && access.workspace);
  const path = String(location.pathname || '').split('?')[0];
  const onHub = path === '/home' || path === '/' || path === '';
  const navItems = useMemo(() => {
    const expanded = expandNavItems(NAV_ITEMS, user, permissions);
    const portalFiltered = filterPortalNavItems(expanded, { bothApps, ready });
    const hubApps = listWorkspaceApps(user, permissions);
    // Everyone (incl. Super Admin): hub Home → /apps when dual portal; else /home.
    return scopeWorkspaceSidebarNav(portalFiltered, location.pathname, {
      bothApps,
      hubApps,
    });
  }, [user, permissions, bothApps, ready, location.pathname]);
  const showAppSections = false;
  const unassignedComplaints = useUnassignedComplaintsCount();

  const activeItem = useMemo(() => {
    // On hub, Home links to /apps but should still look current.
    if (onHub) {
      const home = navItems.find((item) => item.path === '/apps' || item.path === '/home');
      if (home) return home;
    }
    return navItems.find((item) => isSidebarItemActive(location, item));
  }, [location, navItems, onHub]);

  const { listRef, itemRefs, indicator } = useSidebarNavIndicator(activeItem, isCollapsed, navItems);

  const registerItemRef = (path, el) => {
    if (el) itemRefs.current[path] = el;
  };

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
        <SidebarNavIndicatorPill indicator={indicator} isCollapsed={isCollapsed} />
        <SidebarNavListItems
          navItems={navItems}
          location={location}
          showAppSections={showAppSections}
          isCollapsed={isCollapsed}
          unassignedComplaints={unassignedComplaints}
          onNavigate={onNavigate}
          registerItemRef={registerItemRef}
        />
      </List>
    </Box>
  );
}