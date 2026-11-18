import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDate } from '../../utils/formatters';

// Luxury Gold & Bronze Shades for Dashboard Pie Charts
const THEME_SLICE_COLORS = {
  'Panel done': '#583714',                    // Luxury Brown (Dark Accent)
  'Panel work in progress': '#C99846',        // Mid Metallic Gold
  'Panel call put on': '#A37836',             // Warm Amber Bronze
  'Panel pending': '#FFE997',                 // Soft Gold (Light Highlight)
  'ASD done': '#7D511E',                      // Rich Bronze
  'ASD work in progress': '#D4A34E',          // Radiant Gold
  'ASD pending': '#FDF0C8',                   // Pale Champagne Gold
  'LHS done': '#3A230B',                      // Deep Chestnut Brown
  'LHS work in progress': '#B57F2F',          // Deep Gold
  'LHS pending': '#F5DE96',                   // Light Amber Gold
  'Stations completed': '#8C591D',            // Golden Bronze
  'Stations not completed': '#FBE7A1',        // Light Gold Accent
};

function getSliceColor(slice) {
  if (THEME_SLICE_COLORS[slice.name]) return THEME_SLICE_COLORS[slice.name];
  if (slice.status === 'done') return '#583714';
  if (slice.status === 'workInProgress') return '#C99846';
  if (slice.status === 'callPutOn') return '#A37836';
  if (slice.status === 'pending') return '#FFE997';
  if (slice.status === 'completed') return '#8C591D';
  if (slice.status === 'notCompleted') return '#FBE7A1';
  return '#A37836';
}

function statusChip(statusLabel, pct) {
  if (statusLabel === 'Completed' || pct >= 100) {
    return { label: 'Completed', color: '#583714', bg: '#FFE997', border: '#A37836' };
  }
  if (statusLabel === 'Overdue') {
    return { label: 'Overdue', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' };
  }
  if (pct > 0) {
    return { label: 'In Progress', color: '#583714', bg: '#FDF0C8', border: '#D4A34E' };
  }
  return { label: 'Not Started', color: '#7D511E', bg: '#FAF3E6', border: '#E2D3BE' };
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
  const rawSlices = material.slices || [];
  // Ensure every slice uses our luxury gold & bronze theme shades
  const slices = rawSlices.map((s) => ({
    ...s,
    color: getSliceColor(s),
  }));
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
        p: 1.75,
        height: '100%',
        border: '1px solid #E2D3BE',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        overflow: 'hidden',
        minWidth: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(88, 55, 20, 0.05)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: '#A37836',
          boxShadow: '0 8px 24px rgba(88, 55, 20, 0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            title={name}
            sx={{
              fontWeight: 800,
              fontSize: '0.8125rem',
              lineHeight: 1.35,
              color: '#583714',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name}
          </Typography>
          <Typography color="#7D511E" sx={{ fontSize: '0.6875rem', mt: 0.25 }} noWrap title={loaNo || undefined}>
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
            border: `1px solid ${chip.border}`,
            fontWeight: 700,
            height: 20,
            flexShrink: 0,
            fontSize: '0.65rem',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      </Stack>

      {/* Stations summary box in warm gold tint */}
      <Box
        sx={{
          mb: 1,
          px: 1.25,
          py: 0.85,
          borderRadius: '8px',
          bgcolor: 'rgba(255, 233, 151, 0.22)',
          border: '1px solid rgba(163, 120, 54, 0.35)',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#583714', mb: 0.35 }}>
          Stations ({stationTotal})
        </Typography>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LegendDot color="#8C591D" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#583714' }}>
              {stationsCompleted} completed
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LegendDot color="#D4A34E" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#583714' }}>
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
          <Typography color="#7D511E" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
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
                  stroke="#FFFDF8"
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
                  contentStyle={{
                    backgroundColor: '#FAF5ED',
                    borderColor: '#E2D3BE',
                    borderRadius: '8px',
                    color: '#583714',
                    fontWeight: 600,
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
                <Typography sx={{ fontSize: '0.625rem', lineHeight: 1.35, color: '#583714', fontWeight: 700 }}>
                  {slice.name}
                  <Box component="span" sx={{ color: '#7D511E', fontWeight: 600 }}>
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
            color="#7D511E"
            sx={{ fontSize: '0.625rem', lineHeight: 1.4 }}
          >
            <Box component="span" sx={{ fontWeight: 800, color: '#583714' }}>
              {row.category} ({row.total}):
            </Box>{' '}
            {row.parts.map((part) => `${part.count} ${part.status}`).join(' / ') || '0 pending'}
          </Typography>
        ))}
        <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1.4, fontWeight: 800, color: '#583714' }}>
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
          fontWeight: 700,
          borderRadius: '8px',
          borderColor: 'rgba(163, 120, 54, 0.45)',
          color: '#583714',
          bgcolor: 'rgba(255, 233, 151, 0.18)',
          py: 0.5,
          transition: 'all 0.2s',
          '&:hover': {
            background: 'linear-gradient(90deg, #FFE997 0%, #A37836 50%, #583714 100%)',
            color: '#FFFFFF',
            borderColor: '#583714',
            boxShadow: '0 4px 12px rgba(88, 55, 20, 0.25)',
          },
        }}
      >
        Open
      </Button>
    </Paper>
  );
}
