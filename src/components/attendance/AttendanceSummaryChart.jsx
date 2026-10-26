import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatDuration, formatIstDate, formatIstTime } from '../../utils/attendanceFormat';

const RED = '#DC1F2E';
const YELLOW = '#E8B931';
const YELLOW_BG = '#FFF8E8';

function quotaPct(day, expectedMinutes) {
  return Math.min(100, Math.round(((Number(day.durationMin) || 0) / expectedMinutes) * 100));
}

function metQuota(day, expectedMinutes) {
  return (Number(day?.durationMin) || 0) >= expectedMinutes;
}

export default function AttendanceSummaryChart({
  days = [],
  expectedMinutes = 540,
  todayDate,
  canCorrect,
  onRequestCorrection,
}) {
  const quotaLabel = expectedMinutes === 510 ? '8:30 hours' : '9 hours';
  const todayDay = days.find((day) => day.date === todayDate) || days[0];
  const todayMet = metQuota(todayDay, expectedMinutes);
  const weekDays = days.filter((day) => day.date !== todayDate).slice(0, 6);
  const pct = todayDay ? quotaPct(todayDay, expectedMinutes) : 0;
  const pieData =
    pct === 0
      ? [{ name: 'Left', value: 1, color: '#FBECEE' }]
      : [
          { name: 'Done', value: pct, color: RED },
          { name: 'Left', value: Math.max(0, 100 - pct), color: '#FBECEE' },
        ].filter((s) => s.value > 0);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
      <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
        <Card
          sx={{
            border: '1px solid',
            borderColor: todayMet ? 'divider' : YELLOW,
            bgcolor: todayMet ? 'background.paper' : YELLOW_BG,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              p: 1.5,
              pb: '12px !important',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>Today</Typography>
            <Box sx={{ flex: 1, minHeight: 140, maxHeight: { xs: 180, md: 168 }, position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius="58%" outerRadius="82%" stroke="none">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Typography
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'primary.main',
                }}
              >
                {pct}%
              </Typography>
            </Box>
            <Box sx={{ mt: 0.5, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{todayDay ? formatIstDate(todayDay.date) : '—'}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                {formatDuration(todayDay?.durationMin)} of {quotaLabel}
              </Typography>
              <Typography sx={{ mt: 0.25, fontWeight: 700, color: 'primary.main', fontSize: '0.8125rem' }}>
                In {todayDay?.punchInAt ? formatIstTime(todayDay.punchInAt) : '—'} · Out{' '}
                {todayDay?.punchOutAt ? formatIstTime(todayDay.punchOutAt) : '—'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Last Week</Typography>
        <Grid container spacing={1.25} sx={{ flex: 1 }}>
          {weekDays.map((day) => {
            const complete = metQuota(day, expectedMinutes);
            const color = complete ? RED : YELLOW;
            return (
              <Grid item xs={12} sm={6} md={4} key={day.date} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid',
                    borderColor: color,
                    bgcolor: complete ? 'background.paper' : YELLOW_BG,
                  }}
                >
                  <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: complete ? 'primary.main' : '#B45309' }}>
                      {formatIstDate(day.date)}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 700, color: complete ? 'primary.main' : '#B45309' }}>
                      In {day.punchInAt ? formatIstTime(day.punchInAt) : '—'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: complete ? 'primary.main' : '#B45309' }}>
                      Out {day.punchOutAt ? formatIstTime(day.punchOutAt) : '—'}
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: '0.75rem', fontWeight: 700, color: complete ? 'primary.main' : '#B45309' }}>
                      {formatDuration(day.durationMin)}
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontSize: '0.7rem', color: 'text.secondary' }}>
                      {complete ? 'Shift complete' : `Short of ${quotaLabel}`}
                    </Typography>
                    {canCorrect?.(day) && (
                      <Button size="small" variant="outlined" fullWidth sx={{ mt: 0.75 }} onClick={() => onRequestCorrection(day)}>
                        Request correction
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {!weekDays.length && (
            <Grid item xs={12}>
              <Typography color="text.secondary">No previous attendance days.</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
