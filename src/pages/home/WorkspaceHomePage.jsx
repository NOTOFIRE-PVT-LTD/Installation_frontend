import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, isNavItemAllowed } from '../../routes/routeConfig';
import PageHeader from '../../components/common/PageHeader';

/** Top-level Workspace apps (not nested children). */
function useWorkspaceApps() {
  const { user, permissions } = useAuth();
  return useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) =>
          item.path !== '/home' &&
          !item.path.includes('?') &&
          item.path !== '/complaints/desk' &&
          isNavItemAllowed(item, user, permissions),
      ),
    [user, permissions],
  );
}

export default function WorkspaceHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const apps = useWorkspaceApps();

  return (
    <Box>
      <PageHeader
        title="Workspace"
        subtitle={`Signed in as ${user?.name || user?.email || 'user'}. Open any app below.`}
      />

      <Grid container spacing={2}>
        {apps.map((app) => (
          <Grid item xs={12} sm={6} md={4} key={app.path}>
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(36, 20, 4, 0.12)',
                },
              }}
              onClick={() => navigate(app.path)}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: app.accent?.bg || '#FDF7EB',
                  color: app.accent?.color || '#563310',
                }}
              >
                <FontAwesomeIcon icon={app.icon} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                {app.label}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(app.path);
                }}
              >
                Open
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
