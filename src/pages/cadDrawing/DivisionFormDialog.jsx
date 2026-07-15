import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import RHFTextField from '../../components/common/FormFields/RHFTextField';

const schema = yup.object({
  name: yup.string().required('Division name is required'),
  zone: yup.string().required('Zone is required'),
});

export default function DivisionFormDialog({ open, mode = 'create', division, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: { name: '', zone: '' } });

  useEffect(() => {
    if (open) {
      methods.reset({ name: division?.name || '', zone: division?.zone || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, division]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...methods}>
        <DialogTitle>{isEdit ? 'Edit Division' : 'Add Division'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <RHFTextField name="name" label="Division Name" autoFocus />
            <RHFTextField name="zone" label="Zone" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={methods.handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}