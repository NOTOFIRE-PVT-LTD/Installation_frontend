import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import { useDailyVisitsSummary } from './useDailyVisitsSummary';
import { isDateToday } from './dailyVisitsSummaryHelpers';
import DailyVisitsSummaryEmpty from './DailyVisitsSummaryEmpty';
import DailyVisitsPhotoPreviewDialog from './DailyVisitsPhotoPreviewDialog';
import DailyVisitsDateRow from './DailyVisitsDateRow';

export default function DailyVisitsSummary({ onPlanVisit }) {
  const {
    navigate,
    data,
    loading,
    openDates,
    previewPhoto,
    setPreviewPhoto,
    handlePlanVisit,
    toggleDate,
  } = useDailyVisitsSummary(onPlanVisit);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!data.length) {
    return (
      <DailyVisitsSummaryEmpty onPlanVisit={handlePlanVisit} onToday={() => navigate('/visits/today')} />
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          overflow: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table aria-label="daily visits table">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ width: 44, p: 1 }} />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Visits Summary</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Total Travel</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Expense Claim</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <DailyVisitsDateRow
                key={row.date}
                row={row}
                isOpen={openDates.has(row.date)}
                isToday={isDateToday(row.date)}
                onToggle={() => toggleDate(row.date)}
                onPhotoClick={(url, caption) => setPreviewPhoto({ url, caption })}
                onNavigate={navigate}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DailyVisitsPhotoPreviewDialog previewPhoto={previewPhoto} onClose={() => setPreviewPhoto(null)} />
    </>
  );
}