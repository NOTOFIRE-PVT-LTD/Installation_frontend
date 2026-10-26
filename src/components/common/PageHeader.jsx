import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ sm: 'center' }}
      spacing={1.25}
      sx={{ mb: 2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {typeof title === 'string' ? (
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'primary.main' }}>
            {title}
          </Typography>
        ) : (
          <Box sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'primary.main' }}>{title}</Box>
        )}
        {subtitle && (
          <Typography sx={{ fontSize: '0.75rem', mt: 0.15, color: 'primary.dark' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: 1.25,
            '& .MuiButton-root': { flex: { xs: 1, sm: '0 0 auto' }, minWidth: 0, whiteSpace: 'nowrap' },
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  );
}
