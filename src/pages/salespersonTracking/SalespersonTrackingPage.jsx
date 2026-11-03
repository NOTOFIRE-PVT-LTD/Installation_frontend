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
import TrackingApprovalsPage from './TrackingApprovalsPage';
import { peopleApi } from '../../api/peopleApi';
import { attendanceApi } from '../../api/attendanceApi';
import { visitApi } from '../../api/visitApi';
import { customerApi } from '../../api/customerApi';

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

function AttendanceStatCard({ label, value, sub, icon, active, onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 1.75,
        borderRadius: '16px',
        border: active ? '1.5px solid #A37836' : '1px solid #E2D3BE',
        background: active
          ? 'linear-gradient(135deg, #FFF9E6 0%, #FDF2D0 50%, #F5E2B3 100%)'
          : 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 4px 16px rgba(163, 120, 54, 0.16)' : 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 18px rgba(88, 55, 20, 0.1)',
          borderColor: '#A37836',
        },
      }}
    >
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#6E4D27',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.25,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.375rem' }, fontWeight: 800, color: '#241404', mt: 0.25, lineHeight: 1.1 }}>
          {(value ?? 0).toLocaleString('en-IN')}
        </Typography>
        {sub ? (
          <Typography sx={{ fontSize: '0.6875rem', color: '#8A5D18', mt: 0.5, fontWeight: 600, lineHeight: 1.25 }}>
            {sub}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          width: 38,
          height: 38,
          borderRadius: '12px',
          bgcolor: active ? 'rgba(163, 120, 54, 0.25)' : 'rgba(229, 184, 92, 0.22)',
          border: '1px solid rgba(212, 163, 78, 0.4)',
          color: '#38200A',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
      </Box>
    </Paper>
  );
}

export default function SalespersonTrackingPage() {
  const { isAdmin, isSalesperson, permissions } = useAuth();
  const [params, setParams] = useSearchParams();
  const tabs = ALL_TABS.filter((tab) => isTabAllowed(tab, { isAdmin, permissions }));
  const requested = params.get('tab');
  const current = tabs.some((tab) => tab.id === requested) ? requested : tabs[0]?.id || 'people';

  const [metrics, setMetrics] = useState({
    totalStaff: 0,
    attendanceToday: 0,
    visitsToday: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
  });

  const loadKpis = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [peopleRes, attRes, visitsRes, custRes] = await Promise.allSettled([
        peopleApi.list({ pageSize: 1 }),
        attendanceApi.list({ from: today, to: today, pageSize: 1 }),
        visitApi.today(),
        customerApi.list({ pageSize: 1, active: 'true' }),
      ]);

      const staffCount = peopleRes.status === 'fulfilled' ? peopleRes.value.data?.meta?.total || 0 : 0;
      const attCount = attRes.status === 'fulfilled' ? attRes.value.data?.total || 0 : 0;

      let visitCount = 0;
      if (visitsRes.status === 'fulfilled') {
        const vData = visitsRes.value.data?.data;
        if (Array.isArray(vData)) visitCount = vData.length;
        else if (vData?.visits) visitCount = vData.visits.length;
        else if (typeof vData?.total === 'number') visitCount = vData.total;
      }

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
    if (isAdmin) {
      loadKpis();
    }
  }, [isAdmin]);

  // If user is a regular field salesperson (non-admin), directly render personal punch card & chart
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

  return (
    <>
      <PageHeader
        title="Attendance & Field Operations"
        subtitle="People, visits, customers, attendance records, and approvals in one place"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <AttendanceStatCard
          label="Total Staff"
          value={metrics.totalStaff}
          sub="Sales & Coordinators"
          icon={faUsers}
          active={current === 'people'}
          onClick={() => setTab('people')}
        />
        <AttendanceStatCard
          label="Today's Visits"
          value={metrics.visitsToday}
          sub="Scheduled & completed"
          icon={faRoute}
          active={current === 'visits'}
          onClick={() => setTab('visits')}
        />
        <AttendanceStatCard
          label="Active Clients"
          value={metrics.totalCustomers}
          sub="Registered accounts"
          icon={faBuildingUser}
          active={current === 'customers'}
          onClick={() => setTab('customers')}
        />
        <AttendanceStatCard
          label="Today's Punches"
          value={metrics.attendanceToday}
          sub="Punch in / out logged"
          icon={faClock}
          active={current === 'attendance'}
          onClick={() => setTab('attendance')}
        />
        <AttendanceStatCard
          label="Approvals Queue"
          value={metrics.pendingApprovals}
          sub="Visits, expense & leave"
          icon={faClipboardCheck}
          active={current === 'approvals'}
          onClick={() => setTab('approvals')}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <SlidingPills
          fullWidth
          value={current}
          onChange={setTab}
          items={tabs.map((tab, index) => ({
            id: tab.id,
            label: `${index + 1}. ${tab.label}`,
          }))}
        />
      </Box>

      {current === 'people' && <PeopleListPage embedded />}
      {current === 'visits' && <VisitsHomePage embedded />}
      {current === 'customers' && <CustomersListPage embedded />}
      {current === 'attendance' && <AttendancePage embedded />}
      {current === 'approvals' && <TrackingApprovalsPage />}
    </>
  );
}
