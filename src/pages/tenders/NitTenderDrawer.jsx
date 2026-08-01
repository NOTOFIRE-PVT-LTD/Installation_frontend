import { useEffect } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import { LOA_TYPES } from '../../utils/constants';

const emptyItem = () => ({
  itemName: '',
  amount: '',
  quantity: '',
});

const emptyLoaItem = () => ({
  itemName: '',
  amount: '',
  loaType: LOA_TYPES.NOTOFIRE,
});

const LOA_TYPE_OPTIONS = Object.values(LOA_TYPES).map((v) => ({ value: v, label: v }));

const schema = yup.object({
  tenderName: yup.string().trim().required('Tender Name is required'),
  nitNumber: yup.string().trim().required('NIT Number is required'),
  nitDate: yup.string().nullable(),
  items: yup.array().of(
    yup.object({
      itemName: yup.string().trim(),
      amount: yup.number().typeError('Must be a number').min(0).nullable(),
      quantity: yup.number().typeError('Must be a number').min(0).nullable(),
    })
  ),
  loaNumber: yup.string().trim().nullable(),
  loaDate: yup.string().nullable(),
  loaValue: yup.number().typeError('Must be a number').min(0).nullable(),
  loaWorkCompletion: yup.string().nullable(),
  loaDivisionName: yup.string().trim().nullable(),
  contractorName: yup.string().trim().nullable(),
  loaItems: yup.array().of(
    yup.object({
      itemName: yup.string().trim(),
      amount: yup.number().typeError('Must be a number').min(0).nullable(),
      loaType: yup.string().oneOf(Object.values(LOA_TYPES)),
    })
  ),
});

function toDateInput(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function mapTenderToForm(tender) {
  if (!tender) {
    return {
      tenderName: '',
      nitNumber: '',
      nitDate: null,
      items: [emptyItem()],
      loaNumber: '',
      loaDate: null,
      loaValue: '',
      loaWorkCompletion: null,
      loaDivisionName: '',
      contractorName: '',
      loaItems: [emptyLoaItem()],
    };
  }

  return {
    tenderName: tender.tenderName || '',
    nitNumber: tender.nitNumber || '',
    nitDate: toDateInput(tender.nitDate),
    items:
      tender.items?.length > 0
        ? tender.items.map((item) => ({
            itemName: item.itemName || '',
            amount: item.amount ?? '',
            quantity: item.quantity ?? '',
          }))
        : [emptyItem()],
    loaNumber: tender.loaNumber || '',
    loaDate: toDateInput(tender.loaDate),
    loaValue: tender.loaValue ?? '',
    loaWorkCompletion: toDateInput(tender.loaWorkCompletion),
    loaDivisionName: tender.loaDivisionName || '',
    contractorName: tender.contractorName || '',
    loaItems:
      tender.loaItems?.length > 0
        ? tender.loaItems.map((item) => ({
            itemName: item.itemName || '',
            amount: item.amount ?? '',
            loaType: item.loaType || LOA_TYPES.NOTOFIRE,
          }))
        : [emptyLoaItem()],
  };
}

function buildPayload(values) {
  return {
    tenderName: values.tenderName.trim(),
    nitNumber: values.nitNumber.trim(),
    nitDate: values.nitDate || null,
    items: (values.items || [])
      .filter((item) => String(item.itemName || '').trim())
      .map((item) => ({
        itemName: String(item.itemName).trim(),
        amount: Number(item.amount) || 0,
        quantity: Number(item.quantity) || 0,
      })),
    loaNumber: String(values.loaNumber || '').trim(),
    loaDate: values.loaDate || null,
    loaValue: Number(values.loaValue) || 0,
    loaWorkCompletion: values.loaWorkCompletion || null,
    loaDivisionName: String(values.loaDivisionName || '').trim(),
    contractorName: String(values.contractorName || '').trim(),
    loaItems: (values.loaItems || [])
      .filter((item) => String(item.itemName || '').trim())
      .map((item) => ({
        itemName: String(item.itemName).trim(),
        amount: Number(item.amount) || 0,
        loaType: item.loaType || LOA_TYPES.NOTOFIRE,
      })),
  };
}

export default function NitTenderDrawer({ open, mode = 'create', tender, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapTenderToForm(null),
  });

  const itemsArray = useFieldArray({ control: methods.control, name: 'items' });
  const loaItemsArray = useFieldArray({ control: methods.control, name: 'loaItems' });

  useEffect(() => {
    if (!open) return;
    methods.reset(mapTenderToForm(tender));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tender]);

  const titleMap = { create: 'Add Tender', edit: 'Edit Tender', view: 'Tender Details' };

  const handleSubmit = (values) => {
    onSubmit(buildPayload(values));
  };

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
            <Stack component="form" id="nit-tender-form" spacing={2.5} onSubmit={methods.handleSubmit(handleSubmit)}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <RHFTextField name="tenderName" label="Tender Name" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="nitNumber" label="NIT Number" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="nitDate" label="NIT Date" disabled={readOnly} />
                </Grid>
              </Grid>

              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Items
                </Typography>
                {!readOnly && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => itemsArray.append(emptyItem())}>
                    Add Item
                  </Button>
                )}
              </Stack>
              <Stack spacing={1.5}>
                {itemsArray.fields.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No items added.
                  </Typography>
                )}
                {itemsArray.fields.map((field, index) => (
                  <Box key={field.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={1.25} alignItems="flex-start">
                      <Grid item xs={12} sm={5}>
                        <RHFTextField name={`items.${index}.itemName`} label="Item Name" disabled={readOnly} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <RHFTextField name={`items.${index}.amount`} label="Amount" type="number" disabled={readOnly} />
                      </Grid>
                      <Grid item xs={4} sm={3}>
                        <RHFTextField name={`items.${index}.quantity`} label="Quantity" type="number" disabled={readOnly} />
                      </Grid>
                      {!readOnly && (
                        <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => itemsArray.remove(index)} aria-label="Remove item">
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Stack>

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
                LOA Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="loaNumber" label="LOA Number" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="loaDate" label="LOA Date" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="loaValue" label="LOA Value" type="number" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="loaDivisionName" label="LOA Division / Name" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="contractorName" label="Contractor Name" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="loaWorkCompletion" label="LOA Work Completion" disabled={readOnly} />
                </Grid>
              </Grid>

              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  LOA Items
                </Typography>
                {!readOnly && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => loaItemsArray.append(emptyLoaItem())}>
                    Add LOA Item
                  </Button>
                )}
              </Stack>
              <Stack spacing={1.5}>
                {loaItemsArray.fields.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No LOA items added.
                  </Typography>
                )}
                {loaItemsArray.fields.map((field, index) => (
                  <Box key={field.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={1.25} alignItems="flex-start">
                      <Grid item xs={12} sm={5}>
                        <RHFTextField name={`loaItems.${index}.itemName`} label="Item Name" disabled={readOnly} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <RHFTextField name={`loaItems.${index}.amount`} label="Amount" type="number" disabled={readOnly} />
                      </Grid>
                      <Grid item xs={10} sm={3}>
                        <RHFSelect
                          name={`loaItems.${index}.loaType`}
                          label="LOA Type"
                          options={LOA_TYPE_OPTIONS}
                          disabled={readOnly}
                        />
                      </Grid>
                      {!readOnly && (
                        <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => loaItemsArray.remove(index)} aria-label="Remove LOA item">
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="nit-tender-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
