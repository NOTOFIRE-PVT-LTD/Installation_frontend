import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../utils/formatters';
import { projectProgress } from '../../utils/projectFlow';

function resolveProgress(project) {
  if (typeof project?.completion === 'number' && typeof project?.commissioned === 'number') {
    return {
      pct: project.completion,
      commissioned: project.commissioned,
      total: project.stationCount ?? project.stations?.length ?? 0,
    };
  }
  return projectProgress(project);
}

function statusChip(statusLabel, pct) {
  if (statusLabel === 'Completed' || pct >= 100) {
    return { label: 'Completed', color: '#241404', bg: 'rgba(212, 163, 78, 0.28)', border: '1px solid rgba(212, 163, 78, 0.5)' };
  }
  if (statusLabel === 'Overdue') {
    return { label: 'Overdue', color: '#8A2C18', bg: '#FDEEE9', border: '1px solid #F5C6BC' };
  }
  if (pct > 0) {
    return { label: 'In Progress', color: '#543310', bg: 'rgba(229, 184, 92, 0.22)', border: '1px solid rgba(212, 163, 78, 0.4)' };
  }
  return { label: 'Not Started', color: '#7D511E', bg: 'rgba(125, 81, 30, 0.08)', border: '1px solid rgba(125, 81, 30, 0.22)' };
}

export default function ProjectProgressCard({ project, onOpen, onDelete }) {
  const { pct, commissioned, total } = resolveProgress(project);
  const name = project.projectName || 'Untitled project';
  const loaNo = project.loaNo || project.panelSerialNo || '';
  const startDate = project.installationStartDate || project.loaDate;
  const targetDate = project.targetDate;
  const chip = statusChip(project.statusLabel, pct);
  const barColor = pct >= 100 ? '#23b26d' : pct > 0 ? 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 35%, #C99846 70%, #7D511E 100%)' : '#E2D3BE';

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen?.(project)}
      sx={{
        p: 1.75,
        height: '100%',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        border: '1px solid rgba(212, 163, 78, 0.35)',
        boxShadow: '0 4px 14px rgba(32, 18, 4, 0.05)',
        overflow: 'hidden',
        minWidth: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: '#C99846',
          boxShadow: '0 8px 24px rgba(32, 18, 4, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            bgcolor: 'rgba(229, 184, 92, 0.22)',
            color: '#543310',
            border: '1px solid rgba(212, 163, 78, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Chip
            size="small"
            label={chip.label}
            sx={{
              bgcolor: chip.bg,
              color: chip.color,
              border: chip.border || 'none',
              fontWeight: 600,
              height: 20,
              flexShrink: 0,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
          {onDelete && (
            <IconButton
              size="small"
              aria-label="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              sx={{ color: 'error.main', width: 28, height: 28 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <Typography
        title={name}
        sx={{
          fontWeight: 700,
          fontSize: '0.8125rem',
          lineHeight: 1.35,
          mb: 0.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.2em',
        }}
      >
        {name}
      </Typography>

      <Stack spacing={0.35} sx={{ mb: 1.25, flex: 1 }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }} noWrap title={loaNo || undefined}>
          {loaNo ? (loaNo.startsWith('LOA') ? loaNo : `LOA ${loaNo}`) : 'No LOA yet'}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }} noWrap>
          {[project.railwayZone, startDate ? formatDate(startDate) : null].filter(Boolean).join(' · ') || '—'}
        </Typography>
        {targetDate && (
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
            Target {formatDate(targetDate)}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: 'text.secondary' }}>Work done</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700 }}>
          {pct}% · {commissioned}/{total || 0} stations
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5,
          borderRadius: 999,
          bgcolor: '#eef2f7',
          mb: 1.25,
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: barColor,
          },
        }}
      />

      <Button
        size="small"
        fullWidth
        variant="outlined"
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.(project);
        }}
        sx={{
          mt: 'auto',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: 999,
          borderColor: 'rgba(212, 163, 78, 0.45)',
          color: '#241404 !important',
          background: 'linear-gradient(90deg, rgba(250, 226, 180, 0.5) 0%, rgba(229, 184, 92, 0.35) 100%)',
          py: 0.6,
          transition: 'all 0.25s ease',
          '&:hover': {
            background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) !important',
            color: '#241404 !important',
            borderColor: '#C99846',
            boxShadow: '0 4px 12px rgba(32, 18, 4, 0.2)',
          },
        }}
      >
        Open
      </Button>
    </Paper>
  );
}
