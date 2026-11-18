import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import SidebarNavItemButton from './SidebarNavItemButton';

function SidebarSectionHeader({ section }) {
  return (
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
      {section}
    </ListSubheader>
  );
}

export default function SidebarNavItem(props) {
  const { item, showSection } = props;
  return (
    <Box>
      {showSection ? <SidebarSectionHeader section={item.section} /> : null}
      <SidebarNavItemButton {...props} />
    </Box>
  );
}