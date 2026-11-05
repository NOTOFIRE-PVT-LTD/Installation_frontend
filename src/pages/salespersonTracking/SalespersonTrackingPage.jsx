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
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 4px 16px rgba(163, 120, 54, 0.16)' : 'none',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 18px rgba(88, 55, 20, 0.1)',
              borderColor: '#A37836',
            }
          : undefined,
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

function DashboardPanel({ metrics, onOpen, clickable }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
        gap: 1.5,
      }}
    >
      <AttendanceStatCard
        label="Total Staff"
        value={metrics.totalStaff}
        sub="Sales & Coordinators"
        icon={faUsers}
        onClick={clickable ? () => onOpen('people') : undefined}
      />
      <AttendanceStatCard
        label="Today's Visits"
        value={metrics.visitsToday}
        sub="Scheduled & completed"
        icon={faRoute}
        onClick={clickable ? () => onOpen('visits') : undefined}
      />
      <AttendanceStatCard
        label="Active Clients"
        value={metrics.totalCustomers}
        sub="Registered accounts"
        icon={faBuildingUser}
        onClick={clickable ? () => onOpen('customers') : undefined}
      />
      <AttendanceStatCard
        label="Today's Punches"
        value={metrics.attendanceToday}
        sub="Punch in / out logged"
        icon={faClock}
        onClick={clickable ? () => onOpen('attendance') : undefined}
      />
      <AttendanceStatCard
        label="Approvals Queue"
        value={metrics.pendingApprovals}
        sub="Visits, expense & leave"
        icon={faClipboardCheck}
        onClick={clickable ? () => onOpen('approvals') : undefined}
      />
    </Box>
  );
}

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
