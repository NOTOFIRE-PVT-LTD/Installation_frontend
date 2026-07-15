import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
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
    return { label: 'Completed', color: '#15803d', bg: '#dcfce7' };
  }
  if (statusLabel === 'Overdue') {
    return { label: 'Overdue', color: '#b91c1c', bg: '#fee2e2' };
  }
  if (pct > 0) {
    return { label: 'In Progress', color: '#1d4ed8', bg: '#dbeafe' };
  }
  return { label: 'Not Started', color: '#6b7280', bg: '#f3f4f6' };
}

export default function ProjectProgressCard({ project, onOpen }) {
  const { pct, commissioned, total } = resolveProgress(project);
  const name = project.projectName || 'Untitled project';
  const loaNo = project.loaNo || project.panelSerialNo || '';
  const startDate = project.installationStartDate || project.loaDate;
  const targetDate = project.targetDate;
  const chip = statusChip(project.statusLabel, pct);
  const barColor = pct >= 100 ? '#23b26d' : pct > 0 ? '#2f6fed' : '#d1d5db';

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen?.(project)}
      sx={{
        p: 1.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        bgcolor: '#fff',
        overflow: 'hidden',
        minWidth: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        '&:hover': {
          borderColor: '#99f6e4',
          boxShadow: '0 8px 22px rgba(15, 118, 110, 0.1)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: '#e6fffb',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </Box>
        <Chip
          size="small"
          label={chip.label}
          sx={{
            bgcolor: chip.bg,
            color: chip.color,
            border: 'none',
            fontWeight: 600,
            height: 20,
            flexShrink: 0,
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
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
          fontWeight: 600,
          borderRadius: '8px',
          borderColor: '#99f6e4',
          color: '#0f766e',
          bgcolor: '#f0fdfa',
          py: 0.5,
          '&:hover': { bgcolor: '#ccfbf1', borderColor: '#5eead4' },
        }}
      >
        Open
      </Button>
    </Paper>
  );
}
