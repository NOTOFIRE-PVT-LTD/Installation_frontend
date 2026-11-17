import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { useAuth } from '../hooks/useAuth';
import { usePortalAccess } from '../pages/portal/usePortalAccess';
import { NAV_ITEMS, expandNavItems } from '../routes/routeConfig';
import { filterPortalNavItems } from './filterPortalNavItems';
import { isSidebarItemActive } from './sidebarNavActive';
import { useUnassignedComplaintsCount } from './useUnassignedComplaintsCount';
import { useSidebarNavIndicator } from './useSidebarNavIndicator';
import SidebarNavIndicatorPill from './SidebarNavIndicatorPill';
import SidebarNavListItems from './SidebarNavListItems';

export default function SidebarNavList({ isCollapsed = false, onNavigate }) {
  const location = useLocation();
  const { user, permissions, isSuperAdmin } = useAuth();
  const { access, ready } = usePortalAccess();
  const bothApps = Boolean(access.pnl && access.workspace);
  const navItems = useMemo(() => {
    const expanded = expandNavItems(NAV_ITEMS, user, permissions);
    return filterPortalNavItems(expanded, { bothApps, ready });
  }, [user, permissions, bothApps, ready]);
  const showAppSections = !isSuperAdmin && navItems.some((item) => item.section);
  const unassignedComplaints = useUnassignedComplaintsCount();

  const activeItem = useMemo(
    () => navItems.find((item) => isSidebarItemActive(location, item)),
    [location, navItems],
  );

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