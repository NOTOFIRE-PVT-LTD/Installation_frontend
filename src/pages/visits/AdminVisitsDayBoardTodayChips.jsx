import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AdminVisitsDayBoardTodayChips({ onVisitToday }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6E4D27', mb: 0.75 }}>
        Salespeople on visit today
      </Typography>
      {onVisitToday.length ? (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {onVisitToday.map((name) => (
            <Chip
              key={name}
              label={name}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: 'rgba(229, 184, 92, 0.35)',
                color: '#241404',
                border: '1px solid rgba(212, 163, 78, 0.55)',
              }}
            />
          ))}
        </Stack>
      ) : (
        <Typography sx={{ fontSize: '0.8125rem', color: '#8A5D18' }}>
          No salespeople have visits scheduled for today in this range.
        </Typography>
      )}
    </Box>
  );
}