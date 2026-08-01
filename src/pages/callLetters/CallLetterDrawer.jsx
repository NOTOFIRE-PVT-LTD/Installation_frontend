import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { contractAgreementApi } from '../../api/contractAgreementApi';
import { formatDate } from '../../utils/formatters';

const schema = yup.object({
  tender: yup.string().required('Tender Name is required'),
  zone: yup.string().trim().required('Zone is required'),
  callLetter: yup.string().trim().required('Call Letter is required'),
});

function mapDocToForm(doc) {
  if (!doc) {
    return { tender: '', zone: '', callLetter: '' };
  }
  return {
    tender: doc.tender?._id || doc.tender || '',
    zone: doc.zone || '',
    callLetter: doc.callLetter || '',
  };
}

function buildPayload(values) {
  return {
    tender: values.tender,
    zone: String(values.zone || '').trim(),
    callLetter: String(values.callLetter || '').trim(),
  };
}

export default function CallLetterDrawer({ open, mode = 'create', document, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const [caOptions, setCaOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapDocToForm(null),
  });

  const selectedTenderId = useWatch({ control: methods.control, name: 'tender' });
  const selected = useMemo(
    () => caOptions.find((row) => String(row.tender?._id || row.tender) === String(selectedTenderId)) || null,
    [caOptions, selectedTenderId]
  );

  const tenderNameDisplay =
    selected?.tenderName || selected?.tender?.tenderName || document?.tenderName || '';

  useEffect(() => {
    if (!open) return;
    setLoadingOptions(true);
    contractAgreementApi
      .options()
      .then((res) => setCaOptions(res.data?.data || []))
      .catch(() => setCaOptions([]))
      .finally(() => setLoadingOptions(false));
    methods.reset(mapDocToForm(document));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document]);

  const titleMap = {
    create: 'Request Call Letter',
    edit: 'Edit Call Letter',
    view: 'Call Letter Details',
  };

  const tenderSelectOptions = caOptions.map((row) => {
    const tenderId = row.tender?._id || row.tender;
    const name = row.tenderName || row.tender?.tenderName || 'Untitled Tender';
    return {
      value: tenderId,
      label: `${name}${row.caNumber ? ` · CA ${row.caNumber}` : ''}${
        row.caDate ? ` · ${formatDate(row.caDate)}` : ''
      }`,
    };
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 520, md: 580 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {titleMap[mode]}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack
              component="form"
              id="call-letter-form"
              spacing={2.5}
              onSubmit={methods.handleSubmit((values) => onSubmit(buildPayload(values)))}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                After Contract Agreement
              </Typography>

              <RHFSelect
                name="tender"
                label="Tender Name"
                options={tenderSelectOptions}
                disabled={readOnly || loadingOptions}
                helperText={
                  loadingOptions
                    ? 'Loading contract agreements…'
                    : tenderSelectOptions.length === 0
                      ? 'No Contract Agreement found. Create Contract Agreement first.'
                      : 'Only tenders with a Contract Agreement are listed.'
                }
              />

              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Selected Tender"
                    value={tenderNameDisplay || '-'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="zone" label="Zone" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="callLetter" label="Call Letter" disabled={readOnly} required />
                </Grid>
                {selected?.caNumber && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CA Number (linked)"
                      value={selected.caNumber}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="call-letter-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
