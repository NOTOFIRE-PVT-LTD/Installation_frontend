import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Stack
      direction="column"
      alignItems="stretch"
      spacing={1.25}
      sx={{ mb: 2 }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
        {typeof title === 'string' ? (
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'primary.main' }}>
            {title}
          </Typography>
        ) : (
          <Box sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'primary.main' }}>{title}</Box>
        )}
        {subtitle && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              mt: 0.15,
              color: 'primary.dark',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box
          sx={{
            flexShrink: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            '& .MuiButton-root': { flex: '0 0 auto', minWidth: 0, whiteSpace: 'nowrap' },
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  );
}
