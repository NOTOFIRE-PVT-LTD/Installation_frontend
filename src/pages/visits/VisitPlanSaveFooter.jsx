import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { visitPlanSaveButtonSx } from './visitPlanMuiSx';

const cancelSx = {
  color: '#583714',
  fontWeight: 700,
  px: 2.5,
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.2)' },
};

export default function VisitPlanSaveFooter({ submitting, visitCount, onCancel, onSave, footerMt }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent="flex-end"
      sx={{ mt: footerMt, pt: 2, borderTop: '1px solid rgba(212, 163, 78, 0.3)' }}
    >
      <Button onClick={onCancel} disabled={submitting} sx={cancelSx}>
        Cancel
      </Button>
      <Button variant="contained" onClick={onSave} disabled={submitting} sx={visitPlanSaveButtonSx}>
        {submitting ? 'Saving Plan…' : `Save Visit Plan (${visitCount})`}
      </Button>
    </Stack>
  );
}