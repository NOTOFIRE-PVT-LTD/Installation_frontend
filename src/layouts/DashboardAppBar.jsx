import AppBar from '@mui/material/AppBar';
import { getDashboardAppBarSx } from './dashboardAppBarStyles';
import DashboardAppBarToolbar from './DashboardAppBarToolbar';

export default function DashboardAppBar(props) {
  const searchPlaceholder = props.isMobile ? 'Search…' : 'Search projects, users, stations...';

  return (
    <AppBar position="fixed" elevation={0} sx={getDashboardAppBarSx()}>
      <DashboardAppBarToolbar {...props} searchPlaceholder={searchPlaceholder} />
    </AppBar>
  );
}