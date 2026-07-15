import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// `statuses` is an array (same length as `steps`) of 'done' | 'current' | 'pending'.
export default function StageStepper({ steps, statuses }) {
  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap rowGap={1.5}>
      {steps.map((label, i) => (
        <Stack direction="row" alignItems="center" key={label}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                bgcolor:
                  statuses[i] === 'done' ? 'success.main' : statuses[i] === 'current' ? 'warning.main' : 'grey.400',
              }}
            >
              {statuses[i] === 'done' ? '✓' : i + 1}
            </Box>
            <Typography
              variant="caption"
              color={statuses[i] === 'pending' ? 'text.secondary' : 'text.primary'}
              sx={{ whiteSpace: 'nowrap', fontWeight: statuses[i] === 'current' ? 700 : 500 }}
            >
              {label}
            </Typography>
          </Stack>
          {i < steps.length - 1 && (
            <Box sx={{ width: 24, height: 2, bgcolor: statuses[i] === 'done' ? 'success.main' : 'grey.300', mx: 1 }} />
          )}
        </Stack>
      ))}
    </Stack>
  );
}
