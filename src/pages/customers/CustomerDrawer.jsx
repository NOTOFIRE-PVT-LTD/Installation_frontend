import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RHFTextField from '../../components/common/FormFields/RHFTextField';

const schema = yup.object({
  companyName: yup.string().required('Company name is required'),
  contactPerson: yup.string(),
  phone: yup.string(),
  email: yup.string().email('Invalid email'),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  pincode: yup.string(),
  gstin: yup.string(),
  locationLat: yup.string(),
  locationLng: yup.string(),
  overrideReason: yup.string(),
});

const EMPTY = {
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  locationLat: '',
  locationLng: '',
  overrideReason: '',
};

export default function CustomerDrawer({
  open,
  mode = 'create',
  customer,
  matches,
  onClose,
  onSubmit,
  submitting,
  readOnly,
}) {
  const isEdit = mode === 'edit';
  const [confirmDuplicates, setConfirmDuplicates] = useState(false);
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      setConfirmDuplicates(false);
      methods.reset({
        companyName: customer?.companyName || '',
        contactPerson: customer?.contactPerson || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
        city: customer?.city || '',
        state: customer?.state || '',
        pincode: customer?.pincode || '',
        gstin: customer?.gstin || '',
        locationLat: customer?.locationLat ?? '',
        locationLng: customer?.locationLng ?? '',
        overrideReason: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer]);

  const submit = (values) => {
    onSubmit({
      ...values,
      confirmDuplicates,
    });
  };

  return (
    <Drawer open={open} onClose={onClose} anchor="right" PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <FormProvider {...methods}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {readOnly ? 'Customer' : isEdit ? 'Edit customer' : 'New customer'}
          </Typography>
          <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
            <RHFTextField name="companyName" label="Company name" disabled={readOnly} autoFocus />
            <RHFTextField name="contactPerson" label="Contact person" disabled={readOnly} />
            <RHFTextField name="phone" label="Phone" disabled={readOnly} />
            <RHFTextField name="email" label="Email" disabled={readOnly} />
            <RHFTextField name="address" label="Address" disabled={readOnly} />
            <RHFTextField name="city" label="City" disabled={readOnly} />
            <RHFTextField name="state" label="State" disabled={readOnly} />
            <RHFTextField name="pincode" label="Pincode" disabled={readOnly} />
            <RHFTextField name="gstin" label="GSTIN (optional)" disabled={readOnly} />
            <RHFTextField name="locationLat" label="Latitude" disabled={readOnly} />
            <RHFTextField name="locationLng" label="Longitude" disabled={readOnly} />
            {matches?.length ? (
              <>
                <Alert severity="warning">
                  Possible duplicate: {matches.map((m) => `${m.matchType}: ${m.companyName}`).join('; ')}
                </Alert>
                <RHFTextField name="overrideReason" label="Override reason" />
                <FormControlLabel
                  control={
                    <Checkbox checked={confirmDuplicates} onChange={(e) => setConfirmDuplicates(e.target.checked)} />
                  }
                  label="Confirm save despite duplicate"
                />
              </>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
            {!readOnly && (
              <Button variant="contained" onClick={methods.handleSubmit(submit)} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Drawer>
  );
}
