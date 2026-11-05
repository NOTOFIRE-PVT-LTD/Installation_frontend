import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faClock,
  faRoute,
  faClipboardCheck,
  faBuildingUser,
} from '@fortawesome/free-solid-svg-icons';

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
        width: '100%',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
    >
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6E4D27', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.375rem' }, fontWeight: 800, color: '#241404', mt: 0.25 }}>
          {(value ?? 0).toLocaleString('en-IN')}
        </Typography>
        {sub ? <Typography sx={{ fontSize: '0.6875rem', color: '#8A5D18', mt: 0.5, fontWeight: 600 }}>{sub}</Typography> : null}
      </Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          width: 38,
          height: 38,
          borderRadius: '12px',
          bgcolor: 'rgba(229, 184, 92, 0.22)',
          border: '1px solid rgba(212, 163, 78, 0.4)',
          color: '#38200A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
      </Box>
    </Paper>
  );
}

export default function AttendanceDashboardPanel({ metrics, onOpen, clickable }) {
  const cards = [
    { label: 'Total Staff', value: metrics.totalStaff, sub: 'Sales & Coordinators', icon: faUsers, tab: 'people' },
    { label: "Today's Visits", value: metrics.visitsToday, sub: 'Scheduled & done', icon: faRoute, tab: 'visits' },
    { label: 'Active Clients', value: metrics.totalCustomers, sub: 'Registered accounts', icon: faBuildingUser, tab: 'customers' },
    { label: "Today's Punches", value: metrics.attendanceToday, sub: 'Punch in/out logged', icon: faClock, tab: 'attendance' },
    { label: 'Approvals Queue', value: metrics.pendingApprovals, sub: 'Pending approvals', icon: faClipboardCheck, tab: 'approvals' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
      {cards.map((c) => (
        <AttendanceStatCard
          key={c.label}
          label={c.label}
          value={c.value}
          sub={c.sub}
          icon={c.icon}
          onClick={clickable ? () => onOpen(c.tab) : undefined}
        />
      ))}
    </Box>
  );
}

