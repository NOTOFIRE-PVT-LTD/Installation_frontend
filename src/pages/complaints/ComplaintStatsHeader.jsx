import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Folder, Clock, AlertTriangle, RefreshCw, UserX, Ticket } from 'lucide-react';
import GlassIcon from '../../components/common/GlassIcon';

const CARD_SX = {
  p: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minWidth: 0,
  minHeight: 96,
  height: '100%',
  borderRadius: '20px',
  border: '1.5px solid transparent',
  backgroundImage:
    'linear-gradient(145deg, #FFFDF8 0%, #F8F0E2 42%, #EFE0C4 100%), linear-gradient(135deg, #FFE9A8 0%, #E5B85C 35%, #D4A34E 65%, #8C591D 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow:
    '0 8px 20px rgba(99,66,30,0.12), 0 2px 4px rgba(99,66,30,0.05), inset 0 1px 1px rgba(255,252,245,0.7)',
  transition: 'box-shadow 0.28s ease',
};

function StatCard({ label, value, icon, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: 96,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': { transform: 'translate3d(0, -6px, 0)' },
        '&:hover .stat-card-paper': {
          boxShadow: '0 14px 28px rgba(99,66,30,0.14), inset 0 1px 1px rgba(255,255,255,0.9)',
        },
      }}
    >
      <Paper elevation={0} className="stat-card-paper" sx={CARD_SX}>
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: '#5c3a12',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#3d2410', mt: 0.85, lineHeight: 1 }}>
            {(value ?? 0).toLocaleString('en-IN')}
          </Typography>
        </Box>
        <GlassIcon icon={icon} size={22} className="glass-icon--sm" strokeWidth={2.45} />
      </Paper>
    </Box>
  );
}

export default function ComplaintStatsHeader({ stats, isFieldEngineer, onFilterClick }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: isFieldEngineer ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
        },
        gap: 1.75,
        mb: 2.5,
      }}
    >
      {isFieldEngineer ? (
        <>
          <StatCard label="Assigned Tickets" value={stats.myTickets} icon={Ticket} onClick={() => onFilterClick('my_tickets')} />
          <StatCard label="In Progress" value={stats.inProgress} icon={RefreshCw} onClick={() => onFilterClick('in_progress')} />
          <StatCard label="Overdue SLA" value={stats.overdue} icon={AlertTriangle} onClick={() => onFilterClick('overdue')} />
          <StatCard label="Resolved Tickets" value={stats.resolved + stats.closed} icon={Folder} onClick={() => onFilterClick('resolved')} />
        </>
      ) : (
        <>
          <StatCard label="Open Tickets" value={stats.total} icon={Folder} onClick={() => onFilterClick('all')} />
          <StatCard label="Unprocessed New" value={stats.open} icon={Clock} onClick={() => onFilterClick('unassigned')} />
          <StatCard label="In Progress" value={stats.inProgress} icon={RefreshCw} onClick={() => onFilterClick('in_progress')} />
          <StatCard label="Overdue SLA" value={stats.overdue} icon={AlertTriangle} onClick={() => onFilterClick('overdue')} />
          <StatCard label="Unassigned" value={stats.unassigned} icon={UserX} onClick={() => onFilterClick('unassigned')} />
        </>
      )}
    </Box>
  );
}
