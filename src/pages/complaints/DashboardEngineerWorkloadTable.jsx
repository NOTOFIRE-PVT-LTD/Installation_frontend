import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { DASH_CARD_SX } from './DashboardOverdueList';

const headSx = {
  px: 1,
  py: 1,
  fontWeight: 800,
  fontSize: '0.6875rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: '#583714',
  borderColor: 'rgba(226, 211, 190, 0.7)',
  lineHeight: 1.25,
};

const cellSx = {
  px: 1,
  py: 1.1,
  borderColor: 'rgba(226, 211, 190, 0.7)',
  verticalAlign: 'middle',
};

function HeadLabel({ children }) {
  return (
    <Box component="span" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
      {children}
    </Box>
  );
}

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
    <Paper
      elevation={0}
      sx={{
        ...DASH_CARD_SX,
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        p: 0,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EngineeringIcon sx={{ color: '#583714', flexShrink: 0 }} />
          <Typography variant="subtitle1" fontWeight={800} color="#241404" sx={{ lineHeight: 1.3 }}>
            Field Engineer Workload & Active Ticket Distribution
          </Typography>
        </Stack>
      </Box>

      {/* Inset scroll area so left/right card padding never gets clipped */}
      <TableContainer
        sx={{
          mx: 2.5,
          mb: 1,
          width: 'auto',
          maxWidth: 'calc(100% - 40px)',
          overflowX: 'auto',
          borderRadius: '10px',
          border: '1px solid rgba(226, 211, 190, 0.85)',
          bgcolor: 'rgba(255, 253, 248, 0.65)',
        }}
      >
        <Table size="small" sx={{ minWidth: 560, width: '100%' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(245, 230, 200, 0.45)' }}>
              <TableCell sx={{ ...headSx, minWidth: 110 }}>
                <HeadLabel>Eng. Name</HeadLabel>
              </TableCell>
              <TableCell sx={{ ...headSx, minWidth: 120 }}>
                <HeadLabel>Role</HeadLabel>
              </TableCell>
              <TableCell sx={{ ...headSx, textAlign: 'center', minWidth: 72 }}>
                <HeadLabel>Assign</HeadLabel>
              </TableCell>
              <TableCell sx={{ ...headSx, textAlign: 'center', minWidth: 80 }}>
                <HeadLabel>Progress</HeadLabel>
              </TableCell>
              <TableCell sx={{ ...headSx, textAlign: 'center', minWidth: 64 }}>
                <HeadLabel>Active</HeadLabel>
              </TableCell>
              <TableCell sx={{ ...headSx, textAlign: 'center', minWidth: 72 }}>
                <HeadLabel>Resolved</HeadLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEngineers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ ...cellSx, py: 3, color: 'text.secondary' }}>
                  No field engineers registered for ticket allocation.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEngineers.map((eng) => {
                const displayRole =
                  eng.department === 'INSTALLER' || !eng.department ? 'Field Engineer' : eng.department;
                const isCoordinator = displayRole.includes('Coordinator') || displayRole.includes('Admin');
                return (
                  <TableRow key={eng.id} hover>
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#241404',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 140,
                        }}
                      >
                        {eng.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        size="small"
                        label={displayRole}
                        title={displayRole}
                        sx={{
                          maxWidth: 140,
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          bgcolor: isCoordinator ? 'rgba(212, 163, 78, 0.16)' : '#E0F2FE',
                          color: isCoordinator ? '#85581A' : '#0369A1',
                          border: '1px solid',
                          borderColor: isCoordinator ? 'rgba(212, 163, 78, 0.35)' : '#BAE6FD',
                          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', px: 0.75 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center', fontWeight: 700 }}>{eng.assigned}</TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center', fontWeight: 700, color: '#4338ca' }}>
                      {eng.inProgress}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                      <Chip
                        size="small"
                        label={eng.totalActive}
                        sx={{
                          fontWeight: 800,
                          minWidth: 28,
                          bgcolor: eng.totalActive > 3 ? '#fef2f2' : '#f0fdfa',
                          color: eng.totalActive > 3 ? '#b91c1c' : '#0f766e',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center', color: '#047857', fontWeight: 700 }}>
                      {eng.resolved}
                    </TableCell>
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
        sx={{
          borderTop: '1px solid #E2D3BE',
          mt: 'auto',
          px: 2.5,
          pb: 1,
          width: '100%',
          boxSizing: 'border-box',
          '& .MuiTablePagination-toolbar': {
            px: 0,
            minHeight: 48,
            flexWrap: 'wrap',
            gap: 0.5,
          },
          '& .MuiTablePagination-spacer': { flex: '1 1 auto' },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#583714',
            m: 0,
          },
          '& .MuiTablePagination-actions': { ml: 1, mr: 0 },
        }}
      />
    </Paper>
  );
}
