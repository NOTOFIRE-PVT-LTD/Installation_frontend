import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import StatusBadge from '../../components/common/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProjectOptions } from '../../features/projects/projectsThunks';
import { PAYMENT_METHOD } from '../../utils/constants';

const METHOD_OPTIONS = [
  { value: PAYMENT_METHOD.INSTALLER, label: 'Installer' },
  { value: PAYMENT_METHOD.CONTRACTOR, label: 'Contractor' },
];

const schema = yup.object({
  project: yup.string().required('Project is required'),
  method: yup.string().required('Payment method is required'),
  amount: yup.number().typeError('Must be a number').min(0).required('Amount is required'),
  remarks: yup.string().notRequired(),
});

export default function PaymentDrawer({ open, mode = 'create', payment, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const readOnly = mode === 'view';
  const dispatch = useAppDispatch();
  const { options: projectOptions } = useAppSelector((state) => state.projects);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { project: '', method: '', amount: '', remarks: '' },
  });

  useEffect(() => {
    if (!open) return;
    dispatch(fetchProjectOptions());
    methods.reset({
      project: payment?.project?._id || '',
      method: payment?.method || '',
      amount: payment?.amount ?? '',
      remarks: payment?.remarks || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payment]);

  const submit = (values) => {
    if (mode === 'create') {
      onSubmit({ project: values.project, method: values.method, amount: values.amount, remarks: values.remarks });
    } else {
      onSubmit({ amount: values.amount, method: values.method, remarks: values.remarks });
    }
  };

  const titleMap = { create: 'Add Payment', edit: 'Edit Payment', view: 'Payment Details' };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 460 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {titleMap[mode]}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <FormProvider {...methods}>
            <Stack component="form" id="payment-form" spacing={2.5} onSubmit={methods.handleSubmit(submit)}>
              {mode !== 'create' && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusBadge status={payment?.status} />
                </Stack>
              )}
              <RHFSelect
                name="project"
                label="Project"
                options={projectOptions.map((p) => ({ value: p._id, label: p.projectName }))}
                disabled={mode !== 'create'}
              />
              <RHFSelect name="method" label="Payment Method" options={METHOD_OPTIONS} disabled={readOnly} />
              <RHFTextField name="amount" label="Amount" type="number" disabled={readOnly} />
              <RHFTextField name="remarks" label="Remarks" multiline minRows={2} disabled={readOnly} />
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5 }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="payment-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
