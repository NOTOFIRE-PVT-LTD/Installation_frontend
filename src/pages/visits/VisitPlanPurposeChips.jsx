import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { COMMON_PURPOSES } from './visitPlanHelpers';

function purposeChipSx(isSel) {
  return {
    fontSize: '0.6875rem',
    fontWeight: isSel ? 700 : 600,
    borderRadius: '999px',
    background: isSel
      ? 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)'
      : 'rgba(255, 233, 151, 0.15)',
    color: isSel ? '#3A230B' : '#583714',
    border: isSel ? '1px solid #A37836' : '1px solid rgba(212, 163, 78, 0.4)',
    boxShadow: isSel ? '0 1px 4px rgba(88, 55, 20, 0.15)' : 'none',
    '&:hover': { bgcolor: isSel ? undefined : 'rgba(255, 233, 151, 0.35)' },
  };
}

export default function VisitPlanPurposeChips({ purpose, onSelect }) {
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {COMMON_PURPOSES.map((p) => (
        <Chip
          key={p}
          size="small"
          label={p}
          clickable
          onClick={() => onSelect(p)}
          sx={purposeChipSx(purpose === p)}
        />
      ))}
    </Stack>
  );
}