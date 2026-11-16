import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { visitPlanAdminFieldSx } from './visitPlanMuiSx';

export default function VisitPlanAdminSalespersonField({ salespeople, selectedSalesperson, onChange, compact }) {
  const boxSx = compact
    ? { p: 1.75, mb: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1.5px solid #D4A34E', boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)' }
    : { p: 2, mb: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1.5px solid #D4A34E', boxShadow: '0 4px 14px rgba(56, 32, 10, 0.05)' };

  return (
    <Box sx={boxSx}>
      <TextField
        select
        required
        fullWidth
        size="small"
        label="Assign to Salesperson *"
        value={selectedSalesperson}
        onChange={(e) => onChange(e.target.value)}
        helperText="Select the salesperson who will execute these customer visits"
        sx={visitPlanAdminFieldSx}
      >
        <MenuItem value="" disabled>
          <em>Select Salesperson</em>
        </MenuItem>
        {salespeople.map((sp) => (
          <MenuItem key={sp._id} value={sp._id}>
            {sp.name} ({sp.email || sp.mobileNumber})
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}