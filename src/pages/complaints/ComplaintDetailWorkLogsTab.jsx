import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import { formatDateTime } from '../../utils/formatters';

export default function ComplaintDetailWorkLogsTab({ workLogs = [], onAddLog }) {
  if (!workLogs.length) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No field investigation or repair logs recorded yet.
        </Typography>
        <Button variant="outlined" startIcon={<BuildCircleOutlinedIcon />} onClick={onAddLog} sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714' }}>
          Record First Work Log
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {workLogs.map((log, idx) => (
        <Paper key={idx} elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#241404">
              {log.engineerName || 'Field Engineer'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(log.loggedAt || log.workDate)}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', mb: 0.5 }}>
            Work Performed: {log.workPerformed}
          </Typography>
          {log.findings && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Findings:</strong> {log.findings}
            </Typography>
          )}
          {log.actionTaken && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Action Taken:</strong> {log.actionTaken}
            </Typography>
          )}
          {log.partsUsed && (
            <Typography variant="body2" color="text.secondary">
              <strong>Parts Used:</strong> {log.partsUsed}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
}

