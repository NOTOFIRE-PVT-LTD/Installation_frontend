import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function ExpenseDayDraftActions({ busy, onSave, onSubmit }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
      <Button variant="outlined" disabled={busy} onClick={onSave}>
        Save
      </Button>
      <Button variant="contained" disabled={busy} onClick={onSubmit}>
        Submit expense
      </Button>
    </Stack>
  );
}