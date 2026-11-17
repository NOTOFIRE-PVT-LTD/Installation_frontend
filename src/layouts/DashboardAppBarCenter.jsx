import Box from '@mui/material/Box';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import DashboardAppBarUserAvatar from './DashboardAppBarUserAvatar';
import DashboardAppsHomeLink from './DashboardAppsHomeLink';

export default function DashboardAppBarCenter({
  isSuperAdmin,
  showAppsHome,
  searchPlaceholder,
  user,
  setAnchorEl,
}) {
  return (
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
          <GlobalSearchBar placeholder={searchPlaceholder} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minWidth: 0 }} />
      )}
      {showAppsHome ? <DashboardAppsHomeLink /> : null}
      <DashboardAppBarUserAvatar user={user} onOpenMenu={(e) => setAnchorEl(e.currentTarget)} />
    </Box>
  );
}