import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SlidingPills from '../../components/common/SlidingPills';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faClock,
  faRoute,
  faClipboardCheck,
  faBuildingUser,
} from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import PeopleListPage from '../people/PeopleListPage';
import VisitsHomePage from '../visits/VisitsHomePage';
import CustomersListPage from '../customers/CustomersListPage';
import AttendancePage from '../attendance/AttendancePage';
import AdminAttendanceRoster from '../attendance/AdminAttendanceRoster';
import TrackingApprovalsPage from './TrackingApprovalsPage';
import AttendanceDashboardPanel from './AttendanceDashboardPanel';
import { peopleApi } from '../../api/peopleApi';
import { attendanceApi } from '../../api/attendanceApi';
import { visitApi } from '../../api/visitApi';
import { customerApi } from '../../api/customerApi';

// Content-area hub tabs — Super Admin only (many apps). Admins/users use the sidebar.
const SUPER_ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'people', label: 'People' },
  { id: 'visits', label: 'Visits' },
  { id: 'customers', label: 'Customers' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'approvals', label: 'Approvals' },
];

const ADMIN_SECTION_IDS = ['dashboard', 'people', 'visits', 'customers', 'attendance', 'approvals'];

function SectionBody({ current }) {
  if (current === 'people') return <PeopleListPage embedded />;
  if (current === 'visits') return <VisitsHomePage embedded />;
  if (current === 'customers') return <CustomersListPage embedded />;
  if (current === 'attendance') return <AdminAttendanceRoster />;
  if (current === 'approvals') return <TrackingApprovalsPage />;
  return null;
}

export default function SalespersonTrackingPage() {
  const { isAdmin, isSuperAdmin, isSalesperson } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const allowed = isSuperAdmin
    ? SUPER_ADMIN_TABS.map((t) => t.id)
    : ADMIN_SECTION_IDS;
  const current = allowed.includes(requested) ? requested : 'dashboard';

  const [metrics, setMetrics] = useState({
    totalStaff: 0,
    attendanceToday: 0,
    visitsToday: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
  });

  const loadKpis = async () => {
    try {
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      const [peopleRes, attRes, visitsRes, custRes] = await Promise.allSettled([
        peopleApi.list({ pageSize: 1 }),
        attendanceApi.list({ from: today, to: today, pageSize: 1 }),
        visitApi.list({ from: today, to: today, pageSize: 1 }),
        customerApi.list({ pageSize: 1, active: 'true' }),
      ]);

      const staffCount = peopleRes.status === 'fulfilled' ? peopleRes.value.data?.meta?.total || 0 : 0;
      const attCount = attRes.status === 'fulfilled' ? attRes.value.data?.meta?.total || attRes.value.data?.total || 0 : 0;
      const visitCount = visitsRes.status === 'fulfilled' ? visitsRes.value.data?.meta?.total || visitsRes.value.data?.total || 0 : 0;
      const custCount = custRes.status === 'fulfilled' ? custRes.value.data?.meta?.total || custRes.value.data?.total || 0 : 0;

      setMetrics({
        totalStaff: staffCount,
        attendanceToday: attCount,
        visitsToday: visitCount,
        totalCustomers: custCount,
        pendingApprovals: 0,
      });
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    if (isAdmin) loadKpis();
  }, [isAdmin]);

  if (isSalesperson && !isAdmin) {
    return <AttendancePage />;
  }

  const setTab = (id) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    next.delete('page');
    next.delete('search');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (!requested || !allowed.includes(requested)) setTab('dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);

  // Super Admin: content hub with pills (many apps). Admin: sidebar only — no content pills.
  if (isSuperAdmin) {
    return (
      <>
        <PageHeader
          title="Attendance & Field Operations"
          subtitle="People, visits, customers, attendance records, and approvals in one place"
        />
        <Box sx={{ mb: 2.5 }}>
          <DashboardPanel metrics={metrics} onOpen={setTab} clickable />
        </Box>
        <Box sx={{ mb: 2 }}>
          <SlidingPills
            fullWidth
            value={current}
            onChange={setTab}
            items={SUPER_ADMIN_TABS.map((tab, index) => ({
              id: tab.id,
              label: `${index + 1}. ${tab.label}`,
            }))}
          />
        </Box>
        {current !== 'dashboard' ? <SectionBody current={current} /> : null}
      </>
    );
  }

  const titles = {
    dashboard: ['Dashboard', 'Attendance overview'],
    people: ['People', 'Sales staff and coordinators'],
    visits: ['Visits', 'Planned and completed field visits'],
    customers: ['Customers', 'Registered client accounts'],
    attendance: ['Attendance', 'Today’s punches and visit counts'],
    approvals: ['Approvals', 'Visits, expense and leave queue'],
  };
  const [title, subtitle] = titles[current] || titles.dashboard;

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      {current === 'dashboard' ? (
        <DashboardPanel metrics={metrics} onOpen={setTab} clickable={false} />
      ) : (
        <SectionBody current={current} />
      )}
    </>
  );
}
