import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export function KpiCard({ label, count, color, bg, border, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: 108,
        cursor: onClick ? 'pointer' : 'default',
        transform: 'translate3d(0, 0, 0)',
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
        '&:hover': { transform: 'translate3d(0, -12px, 0)' },
        '&:hover .kpi-card-paper': { borderColor: '#D4A34E', boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)' },
      }}
    >
      <Paper
        elevation={0}
        className="kpi-card-paper"
        sx={{
          p: 2,
          borderRadius: '14px',
          border: `1.5px solid ${border || '#E2D3BE'}`,
          background: bg || 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: 108,
          boxShadow: '0 2px 8px rgba(36, 20, 4, 0.03)',
          transition: 'box-shadow 0.32s ease, border-color 0.2s ease',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: color || '#583714', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontSize: '0.6875rem' }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#241404', mt: 0.5, lineHeight: 1.1 }}>
          {count ?? 0}
        </Typography>
      </Paper>
    </Box>
  );
}

export default function DashboardKpiSection({ kpis, isFieldEngineer, ticketsPath }) {
  const navigate = useNavigate();
  return (
    <Stack spacing={2.5}>
      {!isFieldEngineer && kpis.newTicketsCount > 0 && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #fecaca', bgcolor: '#fef2f2', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <NotificationsActiveIcon />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" fontWeight={800} color="#991b1b">
                  {kpis.newTicketsCount} Unprocessed New Complaint{kpis.newTicketsCount > 1 ? 's' : ''}
                </Typography>
                <Chip size="small" label="Action Needed" sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
              </Stack>
              <Typography variant="body2" color="#7f1d1d">New customer complaints awaiting handler acknowledgment.</Typography>
            </Box>
          </Stack>
          <Button component={Link} to={`${ticketsPath}?isNewOnly=true`} variant="contained" size="small" sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, borderRadius: '16px', fontWeight: 700, textTransform: 'none' }}>
            Review New Queue
          </Button>
        </Paper>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, pt: 1.5, alignItems: 'stretch' }}>
        <KpiCard label="Total Open" count={kpis.totalOpenCount} color="#583714" onClick={() => navigate(ticketsPath)} />
        <KpiCard label="Assigned" count={kpis.assignedCount} color="#85581A" onClick={() => navigate(`${ticketsPath}?status=ASSIGNED`)} />
        <KpiCard label="In Progress" count={kpis.inProgressCount} color="#B37A22" onClick={() => navigate(`${ticketsPath}?status=IN_PROGRESS`)} />
        <KpiCard label="Resolved" count={kpis.resolvedCount} color="#2E623B" onClick={() => navigate(`${ticketsPath}?status=RESOLVED`)} />
        <KpiCard label="Closed" count={kpis.closedCount} color="#6B5E4F" onClick={() => navigate(`${ticketsPath}?status=CLOSED`)} />
      </Box>
    </Stack>
  );
}
