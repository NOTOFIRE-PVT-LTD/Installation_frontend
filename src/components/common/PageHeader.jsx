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
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{title}</Typography>
        ) : (
          <Box sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{title}</Box>
        )}
        {subtitle && (
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.15 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
          {actions}
        </Box>
      )}
    </Stack>
  );
}
