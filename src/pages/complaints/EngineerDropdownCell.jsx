import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function EngineerDropdownCell({ row, assignees, onSelectEngineer, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handlePick = (e, engId, engName) => {
    e.stopPropagation();
    handleClose();
    onSelectEngineer(row, engId, engName);
  };

  const currentEng = row.assignedTo;
  const isUnassigned = !currentEng || !currentEng._id;

  return (
    <Box sx={{ width: '100%' }}>
      <Button
        size="small"
        onClick={handleClick}
        disabled={disabled}
        endIcon={!disabled && <ArrowDropDownIcon sx={{ fontSize: 18, color: '#583714' }} />}
        sx={{
          textTransform: 'none',
          py: 0.5,
          px: 1.25,
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.75rem',
          width: '100%',
          justifyContent: 'space-between',
          bgcolor: isUnassigned ? '#FEF2F2' : 'rgba(212, 163, 78, 0.12)',
          color: isUnassigned ? '#DC2626' : '#583714',
          border: '1px solid',
          borderColor: isUnassigned ? '#FECACA' : '#E2D3BE',
          '&:hover': {
            bgcolor: isUnassigned ? '#FEE2E2' : 'rgba(212, 163, 78, 0.22)',
            borderColor: isUnassigned ? '#FCA5A5' : '#D4A34E',
          },
          '&.Mui-disabled': {
            bgcolor: 'transparent',
            borderColor: 'transparent',
            color: '#241404',
          },
        }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          {isUnassigned ? '⚠️ Unassigned' : currentEng.name}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            mt: 0.5,
            maxHeight: 320,
            width: 290,
            borderRadius: '12px',
            border: '1px solid #E2D3BE',
            boxShadow: '0 8px 24px rgba(36, 20, 4, 0.15)',
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF0DF 100%)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid #E2D3BE' }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#6E4D27', textTransform: 'uppercase' }}>
            Assign / Reassign Engineer
          </Typography>
        </Box>
        <MenuItem
          onClick={(e) => handlePick(e, '', 'Unassigned (Review Queue)')}
          selected={isUnassigned}
          sx={{ py: 1, color: '#DC2626', fontWeight: 700, fontSize: '0.8125rem', '&.Mui-selected': { bgcolor: 'rgba(220, 38, 38, 0.1)' } }}
        >
          ⚠️ Leave Unassigned (Review Queue)
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {assignees.map((eng) => {
          const isSelected = String(currentEng?._id) === String(eng._id || eng.id);
          return (
            <MenuItem
              key={String(eng._id || eng.id)}
              onClick={(e) => handlePick(e, String(eng._id || eng.id), eng.name)}
              selected={isSelected}
              sx={{ py: 0.75, fontSize: '0.8125rem', '&.Mui-selected': { bgcolor: 'rgba(212, 163, 78, 0.2)', fontWeight: 800 } }}
            >
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600, color: '#241404' }} noWrap>{eng.name}</Typography>
                <Typography variant="caption" sx={{ color: '#7C6752' }} noWrap display="block">{eng.jobRole || 'Field Engineer'}</Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

