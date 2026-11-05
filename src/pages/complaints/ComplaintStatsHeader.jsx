import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';

function StatCard({ label, value, icon, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: 88,
        cursor: onClick ? 'pointer' : 'default',
        transform: 'translate3d(0, 0, 0)',
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
        '&:hover': { transform: 'translate3d(0, -12px, 0)' },
        '&:hover .stat-card-paper': { borderColor: '#D4A34E', boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)' },
      }}
    >
      <Paper
        elevation={0}
        className="stat-card-paper"
        sx={{
          p: 1.75,
          borderRadius: '16px',
          border: '1px solid #E2D3BE',
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 0,
          minHeight: 88,
          height: '100%',
          boxShadow: '0 2px 8px rgba(36, 20, 4, 0.04)',
          transition: 'box-shadow 0.32s ease, border-color 0.2s ease',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6E4D27', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: '#241404', mt: 0.25 }}>
            {(value ?? 0).toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(212, 163, 78, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#85581A', flexShrink: 0 }}>
          {icon}
        </Box>
      </Paper>
    </Box>
  );
}

export default function ComplaintStatsHeader({ stats, isFieldEngineer, onFilterClick }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: isFieldEngineer ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)' }, gap: 1.5, mb: 2.5 }}>
      {isFieldEngineer ? (
        <>
          <StatCard label="Assigned Tickets" value={stats.myTickets} icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('my_tickets')} />
          <StatCard label="In Progress" value={stats.inProgress} icon={<AutorenewIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('in_progress')} />
          <StatCard label="Overdue SLA" value={stats.overdue} icon={<WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('overdue')} />
          <StatCard label="Resolved Tickets" value={stats.resolved + stats.closed} icon={<ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('resolved')} />
        </>
      ) : (
        <>
          <StatCard label="Open Tickets" value={stats.total} icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('all')} />
          <StatCard label="Unprocessed New" value={stats.open} icon={<ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('unassigned')} />
          <StatCard label="In Progress" value={stats.inProgress} icon={<AutorenewIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('in_progress')} />
          <StatCard label="Overdue SLA" value={stats.overdue} icon={<WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('overdue')} />
          <StatCard label="Unassigned" value={stats.unassigned} icon={<PersonOffOutlinedIcon sx={{ fontSize: 20 }} />} onClick={() => onFilterClick('unassigned')} />
        </>
      )}
    </Box>
  );
}
