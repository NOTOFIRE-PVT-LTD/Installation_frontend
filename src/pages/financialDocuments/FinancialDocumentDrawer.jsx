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
import { nitTenderApi } from '../../api/nitTenderApi';
import { LOA_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const PARTY_OPTIONS = Object.values(LOA_TYPES).map((v) => ({ value: v, label: v }));

const schema = yup.object({
  tender: yup.string().required('LOA tender is required'),
  bgNumber: yup.string().trim().required('BG Number is required'),
  partyName: yup.string().oneOf(Object.values(LOA_TYPES)).required('Party Name is required'),
  bgAmount: yup.number().typeError('Must be a number').min(0).required('BG Amount is required'),
  bgDispatch: yup.string().nullable(),
  bgSubmission: yup.string().nullable(),
  bgVerify: yup.string().nullable(),
});

function toDateInput(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function addDaysIso(dateValue, days) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function mapDocToForm(doc) {
  if (!doc) {
    return {
      tender: '',
      bgNumber: '',
      partyName: LOA_TYPES.NOTOFIRE,
      bgAmount: '',
      bgDispatch: null,
      bgSubmission: null,
      bgVerify: null,
    };
  }

  return {
    tender: doc.tender?._id || doc.tender || '',
    bgNumber: doc.bgNumber || '',
    partyName: doc.partyName || LOA_TYPES.NOTOFIRE,
    bgAmount: doc.bgAmount ?? '',
    bgDispatch: toDateInput(doc.bgDispatch),
    bgSubmission: toDateInput(doc.bgSubmission),
    bgVerify: toDateInput(doc.bgVerify),
  };
}

function buildPayload(values) {
  return {
    tender: values.tender,
    bgNumber: String(values.bgNumber || '').trim(),
    partyName: values.partyName,
    bgAmount: Number(values.bgAmount) || 0,
    bgDispatch: values.bgDispatch || null,
    bgSubmission: values.bgSubmission || null,
    bgVerify: values.bgVerify || null,
  };
}

export default function FinancialDocumentDrawer({ open, mode = 'create', document, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const [tenderOptions, setTenderOptions] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapDocToForm(null),
  });

  const selectedTenderId = useWatch({ control: methods.control, name: 'tender' });

  const selectedTender = useMemo(
    () => tenderOptions.find((t) => String(t._id) === String(selectedTenderId)) || null,
    [tenderOptions, selectedTenderId]
  );

  const loaDateDisplay = selectedTender?.loaDate || document?.loaDate || null;
  const loaNumberDisplay = selectedTender?.loaNumber || document?.loaNumber || '';
  const tenderNameDisplay = selectedTender?.tenderName || document?.tenderName || '';
  const bgDeadline21 = selectedTender?.loaDate
    ? addDaysIso(selectedTender.loaDate, 21)
    : toDateInput(document?.bgDeadline21);
  const bgDeadline60 = selectedTender?.loaDate
    ? addDaysIso(selectedTender.loaDate, 60)
    : toDateInput(document?.bgDeadline60);

  useEffect(() => {
    if (!open) return;
    setLoadingTenders(true);
    nitTenderApi
      .options()
      .then((res) => setTenderOptions(res.data?.data || []))
      .catch(() => setTenderOptions([]))
      .finally(() => setLoadingTenders(false));
    methods.reset(mapDocToForm(document));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document]);

  const titleMap = {
    create: 'Add Financial Document',
    edit: 'Edit Financial Document',
    view: 'Financial Document Details',
  };

  const tenderSelectOptions = tenderOptions.map((t) => ({
    value: t._id,
    label: `${t.tenderName || 'Untitled Tender'}${t.loaNumber ? ` · LOA ${t.loaNumber}` : ''}${
      t.loaDate ? ` · ${formatDate(t.loaDate)}` : ' · No LOA Date'
    }`,
  }));

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 560, md: 640 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              id="financial-document-form"
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
                Select LOA
              </Typography>
              <RHFSelect
                name="tender"
                label="LOA from Tender Name"
                options={tenderSelectOptions}
                disabled={readOnly || loadingTenders}
                helperText={
                  loadingTenders
                    ? 'Loading tenders…'
                    : tenderSelectOptions.length === 0
                      ? 'No tenders with LOA Number found. Add one under Tender first.'
                      : 'Choose by Tender Name. BG deadlines use LOA Date (+21 / +60 days).'
                }
              />

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tender Name"
                    value={tenderNameDisplay || '-'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="LOA Number" value={loaNumberDisplay || '-'} fullWidth InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="LOA Date"
                    value={loaDateDisplay ? formatDate(loaDateDisplay) : '-'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="BG Deadline (21 Days)"
                    value={bgDeadline21 ? formatDate(bgDeadline21) : '-'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="BG Deadline (60 Days)"
                    value={bgDeadline60 ? formatDate(bgDeadline60) : '-'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              {!loaDateDisplay && selectedTenderId && (
                <Typography variant="body2" color="error">
                  Selected tender has no LOA Date. Set LOA Date in Tender first.
                </Typography>
              )}

              <Divider />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                BG Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="bgNumber" label="BG Number" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFSelect name="partyName" label="Party Name" options={PARTY_OPTIONS} disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="bgAmount" label="BG Amount" type="number" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="bgDispatch" label="BG Dispatch" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="bgSubmission" label="BG Submission" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="bgVerify" label="BG Verify" disabled={readOnly} />
                </Grid>
              </Grid>
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="financial-document-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
