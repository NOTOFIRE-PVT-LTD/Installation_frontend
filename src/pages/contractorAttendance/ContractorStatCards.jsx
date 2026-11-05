import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuildingUser,
  faCalendarCheck,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons';

function StatCard({ label, value, sub, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: '16px',
        border: '1px solid #E2D3BE',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6E4D27', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.375rem' }, fontWeight: 800, color: '#241404', mt: 0.25 }}>
          {value}
        </Typography>
        {sub ? (
          <Typography sx={{ fontSize: '0.6875rem', color: '#8A5D18', mt: 0.5, fontWeight: 600 }}>{sub}</Typography>
        ) : null}
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

export default function ContractorStatCards({ summary }) {
  const cards = [
    { label: 'Total Workers', value: (summary.totalWorkers || 0).toLocaleString('en-IN'), sub: 'Extracted workforce', icon: faUsers },
    { label: 'Contractors', value: summary.totalContractors || 0, sub: 'Agencies / vendors', icon: faBuildingUser },
    { label: 'Total Days', value: (summary.totalDays || 0).toLocaleString('en-IN'), sub: 'Total working days', icon: faCalendarCheck },
    { label: 'Total Wages (INR)', value: `INR ${(summary.totalWages || 0).toLocaleString('en-IN')}`, sub: 'Payable amount', icon: faIndianRupeeSign },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2.5 }}>
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Box>
  );
}

