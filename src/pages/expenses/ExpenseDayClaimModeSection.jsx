import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { VISIT_EXPENSE_CLAIM_MODE } from '../../utils/constants';

export default function ExpenseDayClaimModeSection({ draft, isAdmin, claimMode, perVisitMode, onClaimModeChange }) {
  if (draft && !isAdmin) {
    return (
      <TextField
        select
        size="small"
        label="Claim type"
        value={claimMode}
        onChange={(e) => onClaimModeChange(e.target.value)}
        sx={{ mb: 2, minWidth: 260 }}
      >
        <MenuItem value={VISIT_EXPENSE_CLAIM_MODE.PER_VISIT}>Per visit</MenuItem>
        <MenuItem value={VISIT_EXPENSE_CLAIM_MODE.DAY_TOTAL}>Total for the day</MenuItem>
      </TextField>
    );
  }

  if (!draft) {
    return (
      <Typography sx={{ mb: 2 }} color="text.secondary">
        Claim type: {perVisitMode ? 'Per visit' : 'Total for the day'}
      </Typography>
    );
  }

  return null;
}