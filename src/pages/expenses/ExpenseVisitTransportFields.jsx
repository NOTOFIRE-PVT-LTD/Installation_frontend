import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { TRANSPORT_MODE } from '../../utils/constants';

const MODES = Object.values(TRANSPORT_MODE);

export default function ExpenseVisitTransportFields({ row, draft, privateMode, onPatchItem }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField
        select
        size="small"
        label="Transport"
        value={row.transportMode}
        disabled={!draft}
        onChange={(e) => onPatchItem(row._id, 'transportMode', e.target.value)}
        sx={{ minWidth: 160 }}
      >
        {MODES.map((mode) => (
          <MenuItem key={mode} value={mode}>
            {mode}
          </MenuItem>
        ))}
      </TextField>
      {!privateMode && (
        <TextField
          size="small"
          type="number"
          label="Fare ₹"
          value={row.fare || ''}
          disabled={!draft}
          onChange={(e) => onPatchItem(row._id, 'fare', e.target.value)}
        />
      )}
      <Typography sx={{ fontWeight: 700, alignSelf: 'center' }}>
        ₹{Number(row.amount || 0).toLocaleString('en-IN')}
      </Typography>
    </Stack>
  );
}