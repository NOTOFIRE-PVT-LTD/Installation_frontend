import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { VISIT_TYPE } from '../../utils/constants';

const TYPE_OPTIONS = [
  { value: VISIT_TYPE.HOURLY, label: 'Hourly visit' },
  { value: VISIT_TYPE.TOUR, label: 'Tour / date-wise visit' },
];

const schema = yup.object({
  salesperson: yup.string(),
  customer: yup.string().required('Customer is required'),
  visitType: yup.string().required('Visit type is required'),
  visitDate: yup.string().required('Date is required'),
  visitDateTo: yup.string().when('visitType', {
    is: VISIT_TYPE.TOUR,
    then: (s) => s.required('To date is required'),
    otherwise: (s) => s.notRequired(),
  }),
  plannedTime: yup.string().when('visitType', {
    is: VISIT_TYPE.HOURLY,
    then: (s) => s.required('Start time is required'),
    otherwise: (s) => s.notRequired(),
  }),
  endTime: yup.string().when('visitType', {
    is: VISIT_TYPE.HOURLY,
    then: (s) => s.required('End time is required'),
    otherwise: (s) => s.notRequired(),
  }),
  purpose: yup.string().required('Purpose is required'),
  notes: yup.string(),
});

export default function VisitFormDrawer({
  open,
  onClose,
  onSubmit,
  submitting,
  salespersonOptions = [],
  customerOptions = [],
  showSalesperson = true,
  inline = false,
}) {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      salesperson: '',
      customer: '',
      visitType: VISIT_TYPE.HOURLY,
      visitDate: '',
      visitDateTo: '',
      plannedTime: '09:30',
      endTime: '10:30',
      purpose: '',
      notes: '',
    },
  });
  const [ready, setReady] = useState(false);
  const visitType = methods.watch('visitType');
  const startTime = methods.watch('plannedTime');
  const endTime = methods.watch('endTime');
  const hourlyMinutes = (() => {
    if (visitType !== VISIT_TYPE.HOURLY || !startTime || !endTime) return null;
    const [sh, sm] = String(startTime).split(':').map(Number);
    const [eh, em] = String(endTime).split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
    return eh * 60 + em - (sh * 60 + sm);
  })();

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    methods.reset({
      salesperson: salespersonOptions[0]?.value || '',
      customer: '',
      visitType: VISIT_TYPE.HOURLY,
      visitDate: today,
      visitDateTo: today,
      plannedTime: '09:30',
      endTime: '10:30',
      purpose: '',
      notes: '',
    });
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, salespersonOptions, customerOptions]);

  const form = (
    <FormProvider {...methods}>
      <Box sx={{ p: inline ? 0 : 3, display: 'flex', flexDirection: 'column', height: inline ? 'auto' : '100%' }}>
        {!inline && (
          <Typography variant="h6" sx={{ mb: 1 }}>
            Create Visit
          </Typography>
        )}
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'visible', pt: inline ? 0 : 1.5, px: 0.25 }}>
          {showSalesperson && <RHFSelect name="salesperson" label="Salesperson" options={salespersonOptions} />}
          <RHFSelect name="visitType" label="Visit type" options={TYPE_OPTIONS} />
          <RHFSelect name="customer" label="Customer" options={customerOptions} />
          {visitType === VISIT_TYPE.TOUR ? (
            <>
              <RHFTextField name="visitDate" label="From date" type="date" InputLabelProps={{ shrink: true }} />
              <RHFTextField name="visitDateTo" label="To date" type="date" InputLabelProps={{ shrink: true }} />
            </>
          ) : (
            <>
              <RHFTextField name="visitDate" label="Visit date" type="date" InputLabelProps={{ shrink: true }} />
              <RHFTextField name="plannedTime" label="Start time" type="time" InputLabelProps={{ shrink: true }} />
              <RHFTextField name="endTime" label="End time" type="time" InputLabelProps={{ shrink: true }} />
              {hourlyMinutes != null && (
                <Typography color={hourlyMinutes > 0 ? 'text.secondary' : 'error'} sx={{ fontSize: '0.8125rem' }}>
                  Duration: {hourlyMinutes > 0 ? `${Math.floor(hourlyMinutes / 60)}h ${hourlyMinutes % 60}m` : 'End time must be after start'}
                </Typography>
              )}
            </>
          )}
          <RHFTextField name="purpose" label="Purpose" />
          <RHFTextField name="notes" label="Notes" multiline minRows={2} />
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={submitting || !ready || (visitType === VISIT_TYPE.HOURLY && !(hourlyMinutes > 0))}
            onClick={methods.handleSubmit((values) =>
              onSubmit({
                ...values,
                plannedTime: String(values.plannedTime).slice(0, 5),
                endTime: values.endTime ? String(values.endTime).slice(0, 5) : '',
              })
            )}
          >
            {submitting ? 'Saving…' : 'Create Visit'}
          </Button>
        </Stack>
      </Box>
    </FormProvider>
  );

  if (inline) return form;
  return (
    <Drawer open={open} onClose={onClose} anchor="right" PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      {form}
    </Drawer>
  );
}
