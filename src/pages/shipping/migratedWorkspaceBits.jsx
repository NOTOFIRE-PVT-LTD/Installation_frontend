import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export function MetricCard({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: '1px solid #E2D3BE',
        bgcolor: '#FFFDF8',
        minWidth: 0,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.primary', mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
        {value ?? 0}
      </Typography>
    </Paper>
  );
}

export function withGridIds(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r, i) => {
    const row = r && typeof r === 'object' && !Array.isArray(r) ? r : {};
    const pgId = row.id || row._pgId || null;
    return { ...row, pgId, id: row.mongoId || pgId || `r-${i}` };
  });
}
