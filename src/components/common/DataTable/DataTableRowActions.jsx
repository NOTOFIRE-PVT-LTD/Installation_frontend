import { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function DataTableRowActions({ row, actions }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const visibleActions = actions.filter((a) => !a.show || a.show(row));
  if (visibleActions.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          borderRadius: '999px',
          color: 'text.secondary',
          '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
              minWidth: 180,
              mt: 0.5,
            },
          },
        }}
      >
        {visibleActions.map((action) => (
          <MenuItem
            key={action.label}
            dense
            onClick={() => {
              setAnchorEl(null);
              action.onClick(row);
            }}
            sx={{
              fontSize: '0.75rem',
              py: 0.85,
              color: action.danger ? 'error.main' : 'text.primary',
            }}
          >
            {action.icon ? (
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{action.icon}</ListItemIcon>
            ) : null}
            <ListItemText
              primary={action.label}
              primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
