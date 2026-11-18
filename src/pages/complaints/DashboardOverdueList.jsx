import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const DASH_CARD_SX = {
  p: 2.5,
  borderRadius: '16px',
  border: '1.5px solid #E2D3BE',
  background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
  height: '100%',
  transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease',
  '&:hover': {
    transform: 'translate3d(0, -12px, 0)',
    boxShadow: '0 16px 32px rgba(88, 55, 20, 0.18)',
  },
};

export default function DashboardOverdueList({ overdue, onSelectTicket }) {
  return (
    <Paper elevation={0} sx={{ ...DASH_CARD_SX, minHeight: 240 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <WarningAmberIcon sx={{ color: '#dc2626' }} />
        <Typography variant="subtitle1" fontWeight={800} color="#991b1b">
          Overdue Follow-ups (Action Required)
        </Typography>
      </Stack>

      {overdue.rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Excellent! No overdue tickets currently.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {overdue.rows.map((t) => (
            <Box
              key={t._id}
              onClick={() => onSelectTicket(t._id)}
              sx={{ p: 1.5, borderRadius: '16px', border: '1px solid #fecaca', bgcolor: '#fef2f2', cursor: 'pointer' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={700} color="#b91c1c">{t.ticketNo} • {t.customerName}</Typography>
                <Typography variant="caption" fontWeight={700} color="#dc2626">
                  Passed: {new Date(t.followUpDate || t.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Typography>
              </Stack>
              <Typography variant="caption" color="#7f1d1d" noWrap sx={{ display: 'block', mt: 0.25 }}>
                Assigned: {t.assignedTo?.name || 'Unassigned'} • Issue: {t.subject}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {overdue.total > 0 && (
        <TablePagination
          component="div"
          count={overdue.total}
          page={overdue.page}
          rowsPerPage={overdue.rowsPerPage}
          onPageChange={(_, next) => overdue.setPage(next)}
          onRowsPerPageChange={(e) => { overdue.setRowsPerPage(parseInt(e.target.value, 10)); overdue.setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ borderTop: '1px solid #E2D3BE', mt: 1, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem', fontWeight: 600, color: '#583714' } }}
        />
      )}
    </Paper>
  );
}

