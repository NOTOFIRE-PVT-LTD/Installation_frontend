import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './complaintUtils';

export default function ComplaintDetailPageHeader({
  ticket,
  isAdmin,
  onAssignOpen,
  onStatusOpen,
  onWorkLogOpen,
  onResolveOpen,
  onReopenOpen,
  onQrOpen,
}) {
  const statusCfg = STATUS_CONFIG[ticket?.status] || STATUS_CONFIG.NEW;
  const prioCfg = PRIORITY_CONFIG[ticket?.priority] || PRIORITY_CONFIG.MEDIUM;
  const isResolved = ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(ticket?.status);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Button component={Link} to="/complaints" startIcon={<ArrowBackIcon />} size="small" sx={{ textTransform: 'none', color: '#583714', fontWeight: 600 }}>
          Back to Complaints
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#241404', fontFamily: 'monospace' }}>
              {ticket?.ticketNo}
            </Typography>
            <Chip size="small" label={statusCfg.label} sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, fontWeight: 700 }} />
            <Chip size="small" label={prioCfg.label} sx={{ bgcolor: prioCfg.bg, color: prioCfg.color, border: `1px solid ${prioCfg.border}`, fontWeight: 700 }} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {ticket?.customerName} • {ticket?.customerOrganization || ticket?.companyName || 'Industrial Client'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Tooltip title="View Customer QR"><IconButton size="small" onClick={onQrOpen} sx={{ color: '#583714', border: '1px solid #D4A34E' }}><QrCode2Icon /></IconButton></Tooltip>
          {isAdmin && (
            <Button size="small" variant="outlined" startIcon={<PersonAddAlt1Icon />} onClick={onAssignOpen} sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714' }}>
              {ticket?.assignedTo ? 'Reassign' : 'Assign'}
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />} onClick={onStatusOpen} sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714' }}>
            Status
          </Button>
          <Button size="small" variant="outlined" startIcon={<BuildCircleOutlinedIcon />} onClick={onWorkLogOpen} sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#D4A34E', color: '#583714' }}>
            Log Work
          </Button>
          {!isResolved ? (
            <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={onResolveOpen} sx={{ background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 100%)', color: '#3A230B', fontWeight: 800, textTransform: 'none' }}>
              Resolve
            </Button>
          ) : (
            <Button size="small" variant="outlined" color="warning" startIcon={<ReplayIcon />} onClick={onReopenOpen} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Reopen
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

