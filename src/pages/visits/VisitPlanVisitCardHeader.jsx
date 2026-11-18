import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function VisitPlanVisitCardHeader({ index, item, scope, visitsCount, pageLayout, onRemove }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: pageLayout ? 2 : 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={`Visit ${index + 1}`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.75rem',
            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
            color: '#3A230B',
            borderRadius: '8px',
            border: '1px solid rgba(163, 120, 54, 0.3)',
          }}
        />
        {scope === 'week' ? (
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#6E4D27' }}>
            {item.date}
          </Typography>
        ) : null}
      </Stack>
      {visitsCount > 1 ? (
        <IconButton size="small" onClick={onRemove} title="Remove visit" sx={{ color: '#b91c1c', bgcolor: '#fee2e2' }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      ) : null}
    </Stack>
  );
}