import SidebarNavItem from './SidebarNavItem';
import { isSidebarItemActive } from './sidebarNavActive';

export default function SidebarNavListItems({
  navItems,
  location,
  showAppSections,
  isCollapsed,
  unassignedComplaints,
  onNavigate,
  registerItemRef,
}) {
  return navItems.map((item, index) => {
    const prev = navItems[index - 1];
    const showSection =
      showAppSections && item.section && item.section !== prev?.section && !isCollapsed;
    const active = isSidebarItemActive(location, item);
    return (
      <SidebarNavItem
        key={item.path}
        item={item}
        showSection={showSection}
        active={active}
        isCollapsed={isCollapsed}
        unassignedComplaints={unassignedComplaints}
        onNavigate={onNavigate}
        registerItemRef={registerItemRef}
      />
    );
  });
}