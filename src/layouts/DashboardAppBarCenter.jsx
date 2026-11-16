import Box from '@mui/material/Box';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import DashboardAppBarUserAvatar from './DashboardAppBarUserAvatar';

export default function DashboardAppBarCenter({
  isSuperAdmin,
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
      <DashboardAppBarUserAvatar user={user} onOpenMenu={(e) => setAnchorEl(e.currentTarget)} />
    </Box>
  );
}