import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { DASH_CARD_SX } from './DashboardOverdueList';

export default function DashboardEngineerWorkloadTable({
  engineerList,
  engineerPage,
  setEngineerPage,
  engineerRowsPerPage,
  setEngineerRowsPerPage,
}) {
  const paginatedEngineers = engineerList.slice(
    engineerPage * engineerRowsPerPage,
    engineerPage * engineerRowsPerPage + engineerRowsPerPage
  );

  return (
    <Paper elevation={0} sx={DASH_CARD_SX}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <EngineeringIcon sx={{ color: '#583714' }} />
        <Typography variant="subtitle1" fontWeight={800} color="#241404">
          Field Engineer Workload & Active Ticket Distribution
        </Typography>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Engineer Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department / Role</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Assigned</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>In Progress</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Active</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Resolved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEngineers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No field engineers registered for ticket allocation.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEngineers.map((eng) => {
                const displayRole = eng.department === 'INSTALLER' || !eng.department ? 'Field Engineer' : eng.department;
                const isCoordinator = displayRole.includes('Coordinator') || displayRole.includes('Admin');
                return (
                  <TableRow key={eng.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{eng.name}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={displayRole}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          bgcolor: isCoordinator ? 'rgba(212, 163, 78, 0.16)' : '#E0F2FE',
                          color: isCoordinator ? '#85581A' : '#0369A1',
                          border: '1px solid',
                          borderColor: isCoordinator ? 'rgba(212, 163, 78, 0.35)' : '#BAE6FD',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{eng.assigned}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#4338ca' }}>{eng.inProgress}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        size="small"
                        label={eng.totalActive}
                        sx={{ fontWeight: 800, bgcolor: eng.totalActive > 3 ? '#fef2f2' : '#f0fdfa', color: eng.totalActive > 3 ? '#b91c1c' : '#0f766e' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', color: '#047857', fontWeight: 600 }}>{eng.resolved}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={engineerList.length}
        rowsPerPage={engineerRowsPerPage}
        page={engineerPage}
        onPageChange={(_event, newPage) => setEngineerPage(newPage)}
        onRowsPerPageChange={(event) => {
          setEngineerRowsPerPage(parseInt(event.target.value, 10));
          setEngineerPage(0);
        }}
        sx={{ borderTop: '1px solid #E2D3BE', mt: 1, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8125rem', fontWeight: 600, color: '#583714' } }}
      />
    </Paper>
  );
}
