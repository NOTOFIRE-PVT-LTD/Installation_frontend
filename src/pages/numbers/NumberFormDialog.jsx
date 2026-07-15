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
  name: yup.string().required('Name is required'),
  number: yup.string().required('Number is required'),
  region: yup.string().required('Region is required'),
});

export default function NumberFormDialog({ open, mode = 'create', entry, category, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', number: '', region: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: entry?.name || '',
        number: entry?.number || '',
        region: entry?.region || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry]);

  const submit = (values) => {
    onSubmit(isEdit ? values : { ...values, category });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...methods}>
        <DialogTitle>{isEdit ? 'Edit Entry' : `Add ${category} Number`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <RHFTextField name="name" label="Name" autoFocus />
            <RHFTextField name="number" label="Number" />
            <RHFTextField name="region" label="Region" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={methods.handleSubmit(submit)} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
