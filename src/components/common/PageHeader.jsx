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
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '1.125rem',
              lineHeight: 1.3,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'primary.main',
              display: 'inline-block',
              pb: 0.5,
              mb: 0.25,
            }}
          >
            {title}
          </Typography>
        ) : (
          <Box
            sx={{
              fontWeight: 500,
              fontSize: '1.125rem',
              lineHeight: 1.3,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'primary.main',
              display: 'inline-block',
              pb: 0.5,
              mb: 0.25,
            }}
          >
            {title}
          </Box>
        )}
        {subtitle && (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              mt: 0.5,
              color: 'text.secondary',
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
            minWidth: 0,
            // Keep action buttons on one row (Template / Excel / Refresh).
            '& .MuiStack-root': { width: '100%', flexWrap: 'nowrap !important' },
            '& .MuiButton-root': {
              flex: '1 1 0',
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
              whiteSpace: 'nowrap',
            },
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  );
}
