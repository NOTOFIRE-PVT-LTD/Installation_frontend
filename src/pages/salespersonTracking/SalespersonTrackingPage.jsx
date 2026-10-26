import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import PeopleListPage from '../people/PeopleListPage';
import VisitsHomePage from '../visits/VisitsHomePage';
import CustomersListPage from '../customers/CustomersListPage';
import AttendancePage from '../attendance/AttendancePage';
import TrackingApprovalsPage from './TrackingApprovalsPage';

const ALL_TABS = [
  { id: 'people', label: 'People', adminOnly: true },
  { id: 'visits', label: 'Visits' },
  { id: 'customers', label: 'Customers' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'approvals', label: 'Approvals', adminOnly: true },
];

function isTabAllowed(tab, { isAdmin, permissions }) {
  if (tab.adminOnly) return isAdmin;
  if (isAdmin) return true;
  if (tab.id === 'customers') return permissions?.customers !== false;
  return permissions?.attendance !== false;
}

export default function SalespersonTrackingPage() {
  const { isAdmin, permissions } = useAuth();
  const [params, setParams] = useSearchParams();
  const tabs = ALL_TABS.filter((tab) => isTabAllowed(tab, { isAdmin, permissions }));
  const requested = params.get('tab');
  const current = tabs.some((tab) => tab.id === requested) ? requested : tabs[0]?.id;

  const setTab = (id) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    next.delete('page');
    next.delete('search');
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Salesperson Tracking"
        subtitle="People, customers, visits, attendance, and approvals in one place"
      />

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={current || false}
          onChange={(_e, next) => setTab(next)}
          variant="fullWidth"
          scrollButtons={false}
          sx={{ '& .MuiTab-root': { maxWidth: 'none' } }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.id} value={tab.id} label={`${index + 1}. ${tab.label}`} />
          ))}
        </Tabs>
      </Box>

      {current === 'people' && <PeopleListPage embedded />}
      {current === 'visits' && <VisitsHomePage embedded />}
      {current === 'customers' && <CustomersListPage embedded />}
      {current === 'attendance' && <AttendancePage embedded />}
      {current === 'approvals' && <TrackingApprovalsPage />}
    </>
  );
}
