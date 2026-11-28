import Box from '@mui/material/Box';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import DashboardAppBarUserAvatar from './DashboardAppBarUserAvatar';

/** Apps chooser lives in sidebar Home — no duplicate navbar control. */
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
        pl: { xs: 0.5, sm: 0 },
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