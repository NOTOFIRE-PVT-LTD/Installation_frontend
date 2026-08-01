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
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import { financialDocumentApi } from '../../api/financialDocumentApi';
import { formatDate } from '../../utils/formatters';

const schema = yup.object({
  tender: yup.string().required('Tender Name is required'),
  caDate: yup.string().required('CA Date is required'),
  caNumber: yup.string().trim().required('CA Number is required'),
});

function toDateInput(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function mapDocToForm(doc) {
  if (!doc) {
    return { tender: '', caDate: null, caNumber: '' };
  }
  return {
    tender: doc.tender?._id || doc.tender || '',
    caDate: toDateInput(doc.caDate),
    caNumber: doc.caNumber || '',
  };
}

function buildPayload(values) {
  return {
    tender: values.tender,
    caDate: values.caDate || null,
    caNumber: String(values.caNumber || '').trim(),
  };
}

export default function ContractAgreementDrawer({ open, mode = 'create', document, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const [bgOptions, setBgOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapDocToForm(null),
  });

  const selectedTenderId = useWatch({ control: methods.control, name: 'tender' });
  const selected = useMemo(
    () => bgOptions.find((row) => String(row.tender?._id || row.tender) === String(selectedTenderId)) || null,
    [bgOptions, selectedTenderId]
  );

  const tenderNameDisplay =
    selected?.tenderName || selected?.tender?.tenderName || document?.tenderName || '';

  useEffect(() => {
    if (!open) return;
    setLoadingOptions(true);
    financialDocumentApi
      .options()
      .then((res) => setBgOptions(res.data?.data || []))
      .catch(() => setBgOptions([]))
      .finally(() => setLoadingOptions(false));
    methods.reset(mapDocToForm(document));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document]);

  const titleMap = {
    create: 'Add Contract Agreement',
    edit: 'Edit Contract Agreement',
    view: 'Contract Agreement Details',
  };

  const tenderSelectOptions = bgOptions.map((row) => {
    const tenderId = row.tender?._id || row.tender;
    const name = row.tenderName || row.tender?.tenderName || 'Untitled Tender';
    return {
      value: tenderId,
      label: `${name}${row.bgNumber ? ` · BG ${row.bgNumber}` : ''}${row.loaNumber ? ` · LOA ${row.loaNumber}` : ''}`,
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
              id="contract-agreement-form"
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
                After BG Document
              </Typography>

              <RHFSelect
                name="tender"
                label="Tender Name"
                options={tenderSelectOptions}
                disabled={readOnly || loadingOptions}
                helperText={
                  loadingOptions
                    ? 'Loading BG tenders…'
                    : tenderSelectOptions.length === 0
                      ? 'No BG Document found. Create Financial Document (BG) first.'
                      : 'Only tenders with a BG Document are listed.'
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
                  <RHFDatePicker name="caDate" label="CA Date" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="caNumber" label="CA Number" disabled={readOnly} required />
                </Grid>
                {selected?.loaDate && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="LOA Date (from BG)"
                      value={formatDate(selected.loaDate)}
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
            <Button type="submit" form="contract-agreement-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
