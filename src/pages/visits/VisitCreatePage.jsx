import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useVisitPlanForm } from './useVisitPlanForm';
import VisitPlanFormBody from './VisitPlanFormBody';

export default function VisitCreatePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const form = useVisitPlanForm({
    isAdmin,
    dispatch,
    onSuccess: () => navigate('/visits'),
  });

  return (
    <>
      <PageHeader
        title="Plan Visits"
        subtitle="Plan a single day or whole week with multiple customer stops in a single form"
      />
      <Box sx={{ maxWidth: 840, mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '20px',
            border: '1.5px solid #D4A34E',
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
            boxShadow: '0 6px 24px rgba(36, 20, 4, 0.08)',
          }}
        >
          <VisitPlanFormBody
            form={form}
            pageLayout
            onCancel={() => navigate('/visits')}
          />
        </Paper>
      </Box>
    </>
  );
}