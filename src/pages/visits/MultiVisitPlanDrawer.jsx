import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useVisitPlanForm } from './useVisitPlanForm';
import VisitPlanFormBody from './VisitPlanFormBody';

export default function MultiVisitPlanDrawer({ open, onClose, onCreated, initialSalespersonId }) {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const form = useVisitPlanForm({
    isAdmin,
    dispatch,
    drawerOpen: open,
    initialSalespersonId,
    onSuccess: () => {
      onCreated?.();
      onClose();
    },
  });

  return (
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 600 },
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
            color: '#241404',
            borderLeft: '1.5px solid #D4A34E',
            boxShadow: '-6px 0 28px rgba(36, 20, 4, 0.15)',
          },
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <div>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#241404' }}>
                Plan Visits
              </Typography>
              <Typography variant="caption" sx={{ color: '#6E4D27', fontWeight: 600 }}>
                Plan a single day or whole week with multiple customer stops
              </Typography>
            </div>
          <IconButton onClick={onClose} size="small" sx={{ borderRadius: '8px', border: '1px solid rgba(212, 163, 78, 0.4)', bgcolor: '#FFFFFF' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

        <VisitPlanFormBody form={form} compact scrollable onCancel={onClose} />
        </Box>
      </Drawer>
  );
}