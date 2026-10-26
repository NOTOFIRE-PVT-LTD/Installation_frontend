import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { customerApi } from '../../api/customerApi';
import { visitApi } from '../../api/visitApi';
import VisitFormDrawer from './VisitFormDrawer';

export default function VisitCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    customerApi
      .list({ pageSize: 100, active: 'true' })
      .then(({ data }) => setCustomers((data.data || []).map((c) => ({ value: c._id, label: c.companyName }))))
      .catch(() => setCustomers([]));
  }, []);

  const createVisit = async (values) => {
    setSubmitting(true);
    try {
      await visitApi.create(values);
      dispatch(showSnackbar({ message: 'Visit created' }));
      navigate('/visits');
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not create visit', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Create Visit" subtitle="Add a customer visit to the plan" />
      <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', md: 'center' } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%', maxWidth: 480, border: '1px solid', borderColor: 'divider' }}>
          <VisitFormDrawer
            inline
            open
            onClose={() => navigate('/visits')}
            onSubmit={createVisit}
            submitting={submitting}
            showSalesperson={false}
            customerOptions={customers}
          />
        </Paper>
      </Box>
    </>
  );
}
