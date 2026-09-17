import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDate } from '../../utils/formatters';

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

function LegendDot({ color }) {
  return (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: color,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

export default function ProjectMaterialPieCard({ project, onOpen }) {
  const material = project?.material || {};
  const slices = material.slices || [];
  const summaries = material.summaries || [];
  const name = project.projectName || 'Untitled project';
  const loaNo = project.loaNo || project.panelSerialNo || '';
  const chip = statusChip(project.statusLabel, project.completion || 0);
  const stationsCompleted = material.stationsCompleted ?? project.commissioned ?? 0;
  const stationsNotCompleted =
    material.stationsNotCompleted ?? Math.max(0, (project.stationCount || 0) - (project.commissioned || 0));
  const stationTotal = material.stationTotal ?? project.stationCount ?? stationsCompleted + stationsNotCompleted;
  const materialSummaries = summaries.filter((row) => row.category !== 'Stations');

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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            title={name}
            sx={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.25 }} noWrap title={loaNo || undefined}>
            {[
              loaNo ? (loaNo.startsWith('LOA') ? loaNo : `LOA ${loaNo}`) : null,
              project.railwayZone,
              project.targetDate ? `Target ${formatDate(project.targetDate)}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'No LOA yet'}
          </Typography>
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

      <Box
        sx={{
          mb: 1,
          px: 1,
          py: 0.85,
          borderRadius: '8px',
          bgcolor: '#f0fdfa',
          border: '1px solid',
          borderColor: '#99f6e4',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0f766e', mb: 0.35 }}>
          Stations ({stationTotal})
        </Typography>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LegendDot color="#0f766e" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
              {stationsCompleted} completed
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LegendDot color="#f59e0b" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
              {stationsNotCompleted} not completed
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {slices.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
            Add stations or Panel / ASD / LHS quantities on this project to see the chart.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', height: 170, flexShrink: 0 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="78%"
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {slices.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, tipName, item) => {
                    const unit = String(tipName).startsWith('Stations') ? 'stations' : 'units';
                    return [`${value} ${unit} (${item.payload.percent}%)`, tipName];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.5,
              mb: 1,
            }}
          >
            {slices.map((slice) => (
              <Stack key={slice.name} direction="row" spacing={0.6} alignItems="flex-start" sx={{ minWidth: 0 }}>
                <LegendDot color={slice.color} />
                <Typography sx={{ fontSize: '0.625rem', lineHeight: 1.35, color: 'text.primary', fontWeight: 600 }}>
                  {slice.name}
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {' '}
                    · {slice.value} ({slice.percent}%)
                  </Box>
                </Typography>
              </Stack>
            ))}
          </Box>
        </>
      )}

      <Stack spacing={0.2} sx={{ mb: 1 }}>
        {materialSummaries.map((row) => (
          <Typography
            key={row.category}
            color="text.secondary"
            sx={{ fontSize: '0.625rem', lineHeight: 1.4 }}
          >
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {row.category} ({row.total}):
            </Box>{' '}
            {row.parts.map((part) => `${part.count} ${part.status}`).join(' / ') || '0 pending'}
          </Typography>
        ))}
        <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1.4, fontWeight: 700, color: '#0f766e' }}>
          Stations ({stationTotal}): {stationsCompleted} completed / {stationsNotCompleted} not completed
        </Typography>
      </Stack>

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
