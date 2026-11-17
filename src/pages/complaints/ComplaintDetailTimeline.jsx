import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { formatDateTime } from '../../utils/formatters';

export default function ComplaintDetailTimeline({ activityLogs = [] }) {
  if (!activityLogs.length) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryEduOutlinedIcon sx={{ color: '#8C5E28', fontSize: 20 }} /> Activity Timeline ({activityLogs.length})
      </Typography>
      <Stack spacing={2} sx={{ pl: 1 }}>
        {activityLogs.map((log, idx) => (
          <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(212, 163, 78, 0.2)', color: '#85581A', fontSize: '0.75rem', fontWeight: 800 }}>
              {log.action ? log.action.charAt(0) : 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#241404' }}>
                {log.action} <span style={{ fontWeight: 400, color: '#7C6752' }}>by {log.actorName || 'System'}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#583714', display: 'block' }}>
                {log.description}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A37836', display: 'block', mt: 0.25 }}>
                {formatDateTime(log.timestamp)}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

