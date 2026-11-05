import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { STATUS_CONFIG } from './complaintUtils';

export default function ComplaintDetailHeader({ complaint, onClose, onCopy, copied }) {
  const statusCfg = STATUS_CONFIG[complaint?.status] || STATUS_CONFIG.NEW;
  return (
    <Box sx={{ p: 2, borderBottom: '1.5px solid #E2D3BE', bgcolor: '#FFFDF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#241404', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          {complaint?.ticketNo}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy Ticket ID'}>
          <IconButton size="small" onClick={onCopy} sx={{ color: '#85581A' }}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Chip
          size="small"
          label={statusCfg.label}
          sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, fontWeight: 700, fontSize: '0.75rem' }}
        />
      </Stack>
      {onClose && (
        <IconButton size="small" onClick={onClose} sx={{ color: '#583714' }}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
}
