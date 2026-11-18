import { NavLink } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { getSidebarNavItemSx } from './sidebarNavItemSx';
import SidebarNavItemIcon from './SidebarNavItemIcon';
import SidebarNavComplaintsCount from './SidebarNavComplaintsCount';

export default function SidebarNavItemButton({
  item,
  active,
  isCollapsed,
  unassignedComplaints,
  onNavigate,
  registerItemRef,
}) {
  const badgeOnIcon =
    isCollapsed && item.path === '/complaints/dashboard' ? unassignedComplaints : 0;
  const showExpandedBadge = !isCollapsed && item.path === '/complaints/dashboard';

  return (
    <Tooltip title={isCollapsed ? item.label : ''} placement="right">
      <ListItemButton
        ref={(el) => registerItemRef(item.path, el)}
        component={NavLink}
        to={item.path}
        selected={active}
        onClick={onNavigate}
        sx={getSidebarNavItemSx(active, isCollapsed)}
      >
        <SidebarNavItemIcon icon={item.icon} isCollapsed={isCollapsed} badgeContent={badgeOnIcon} />
        {!isCollapsed && <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />}
        {showExpandedBadge ? (
          <SidebarNavComplaintsCount count={unassignedComplaints} active={active} />
        ) : null}
      </ListItemButton>
    </Tooltip>
  );
}