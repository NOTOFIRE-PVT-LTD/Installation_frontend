import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';

export default function DataTableColumnsMenu({
  columns,
  columnVisibilityModel,
  toggleColumn,
  columnsMenuAnchor,
  setColumnsMenuAnchor,
}) {
  return (
    <Menu
      anchorEl={columnsMenuAnchor}
      open={Boolean(columnsMenuAnchor)}
      onClose={() => setColumnsMenuAnchor(null)}
      slotProps={{
        paper: {
          sx: {
            borderRadius: (theme) => `${theme.shape?.borderRadius ?? 10}px`,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
            mt: 0.75,
            minWidth: 180,
          },
        },
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '999px',
              bgcolor: 'primary.light',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ViewColumnIcon sx={{ fontSize: 14 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Columns</Typography>
        </Stack>
      </Box>
      {columns
        .filter((col) => col.field !== '__actions')
        .map((col) => (
          <MenuItem
            key={col.field}
            onClick={() => toggleColumn(col.field)}
            dense
            sx={{ py: 0, minHeight: 28, gap: 0, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <Checkbox
              checked={columnVisibilityModel[col.field] !== false}
              size="small"
              sx={{
                p: 0.35,
                mr: 0.5,
                color: 'primary.main',
                '&.Mui-checked': { color: 'primary.main' },
                '& .MuiSvgIcon-root': { fontSize: 16 },
              }}
            />
            <ListItemText
              primary={col.headerName || col.field}
              sx={{ my: 0 }}
              primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2 }}
            />
          </MenuItem>
        ))}
    </Menu>
  );
}
