import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { UnitAutocomplete } from '../../components/common/FormFields/RHFUnitSelect';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { proformaInvoiceApi } from '../../api/proformaInvoiceApi';
import { apiErrorMessage, money } from '../quotations/quotationUtils';
import { downloadProformaInvoicePdf } from './proformaInvoicePdf';
import { PI_TEMPLATES, companyBank, computePiTotals, emptyItem, emptyPiForm, formToPayload } from './piUtils';

const itemSchema = yup.object({
  description: yup.string().trim().required('Description is required'),
  qty: yup.number().typeError('Qty is required').moreThan(0, 'Qty must be > 0').required('Qty is required'),
  rate: yup.number().typeError('Rate is required').min(0, 'Rate cannot be negative').required('Rate is required'),
});

const schema = yup.object({
  companyRef: yup.string().required('Select a seller company'),
  partyName: yup.string().trim().required('Party name is required'),
  items: yup.array().of(itemSchema).min(1, 'Add at least one item'),
  freight: yup.number().typeError('Enter a number').min(0, 'Cannot be negative'),
  gstRate: yup.number().typeError('Enter a number').min(0).max(100, 'Max 100%'),
});

const compactInput = {
  '& .MuiInputBase-root': { fontSize: '0.8125rem' },
  '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.6875rem', mx: 0 },
};

function Section({ title, action, children }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.75 }}>
      {(title || action) && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{title}</Typography>
          {action}
        </Stack>
      )}
      {children}
    </Box>
  );
}

function TotalRow({ label, value, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Typography sx={{ fontSize: strong ? '0.9rem' : '0.8125rem', fontWeight: strong ? 700 : 400 }}>{label}</Typography>
      <Typography sx={{ fontSize: strong ? '0.9rem' : '0.8125rem', fontWeight: strong ? 700 : 500 }}>{money(value)}</Typography>
    </Stack>
  );
}

/**
 * Right-side create / edit form for a Proforma Invoice.
 * `pi` = existing invoice to edit; `initialValues` = prefilled form for a new PI (e.g. from a quotation).
 */
export default function ProformaInvoiceDrawer({ open, pi, initialValues, companies, parties, onClose, onSaved }) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(pi?._id);
  const [saving, setSaving] = useState(false);
  const [suggestedNumber, setSuggestedNumber] = useState('');

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: emptyPiForm() });
  const { control, handleSubmit, reset, setValue, getValues, formState } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (!open) return;
    reset(initialValues || emptyPiForm());
    setSuggestedNumber('');
  }, [open, initialValues, reset]);

  const [companyRef, partyName, piDate, items, freight, gstRate, quotationNo] = useWatch({
    control,
    name: ['companyRef', 'partyName', 'piDate', 'items', 'freight', 'gstRate', 'quotationNo'],
  });
  const totals = useMemo(() => computePiTotals({ items: items || [], freight, gstRate }), [items, freight, gstRate]);

  const debouncedParty = useDebounce(partyName, 500);
  useEffect(() => {
    if (!open || isEdit || !companyRef) {
      setSuggestedNumber('');
      return undefined;
    }
    let active = true;
    proformaInvoiceApi
      .nextNumber({ company: companyRef, party: debouncedParty || '', date: piDate || undefined })
      .then((res) => {
        if (active) setSuggestedNumber(res.data?.data?.piNumber || '');
      })
      .catch(() => {
        if (active) setSuggestedNumber('');
      });
    return () => {
      active = false;
    };
  }, [open, isEdit, companyRef, debouncedParty, piDate]);

  const companyOptions = companies.map((c) => ({ value: c._id, label: c.name }));

  const handleCompanyChange = (id) => {
    setValue('companyRef', id, { shouldValidate: true });
    const company = companies.find((c) => c._id === id);
    if (!company) return;
    setValue('gstin', company.gstin || '');
    setValue('bank', companyBank(company));
    if (company.email) setValue('email', company.email);
  };

  const applyParty = (party) => {
    setValue('partyRef', party._id);
    setValue('partyName', party.name, { shouldValidate: true });
    setValue('partyGstin', party.gstin || '');
    if (party.address) setValue('deliveryAddress', party.address);
    if (party.contactPerson && !getValues('kindAttention')) setValue('kindAttention', party.contactPerson);
  };

  const save = async (values, download) => {
    setSaving(true);
    try {
      const payload = formToPayload(values);
      const { data } = isEdit
        ? await proformaInvoiceApi.update(pi._id, payload)
        : await proformaInvoiceApi.create(payload);
      const saved = data.data;
      if (download) downloadProformaInvoicePdf(saved);
      dispatch(showSnackbar({ message: `Proforma Invoice ${saved.piNumber} ${isEdit ? 'updated' : 'created'}` }));
      onSaved?.(saved);
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to save Proforma Invoice'), severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = (errors) => {
    const message = errors.items?.message || errors.items?.root?.message || 'Please fix the highlighted fields';
    dispatch(showSnackbar({ message, severity: 'warning' }));
  };

  const itemsError = formState.errors.items?.message || formState.errors.items?.root?.message;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => !saving && onClose()}
      PaperProps={{ sx: { borderRadius: 0, boxShadow: '-8px 0 32px rgba(31, 42, 68, 0.1)' } }}
    >
      <FormProvider {...methods}>
        <Box sx={{ width: { xs: '100vw', md: 940 }, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 1.25,
              background: 'linear-gradient(180deg, #eef2ff 0%, #ffffff 72%)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ReceiptLongIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                    {isEdit ? `Edit ${pi.piNumber}` : 'Create Proforma Invoice'}
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                      {isEdit ? 'Update the details below' : 'Fill details below to create a new Proforma Invoice'}
                    </Typography>
                    {quotationNo && <Chip size="small" label={`From ${quotationNo}`} color="primary" variant="outlined" />}
                  </Stack>
                </Box>
              </Stack>
              <IconButton size="small" onClick={onClose} disabled={saving} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
            <Stack spacing={2}>
              <Section>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyRef"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Seller Company *"
                          value={field.value || ''}
                          onChange={(event) => handleCompanyChange(event.target.value)}
                          onBlur={field.onBlur}
                          error={Boolean(error)}
                          helperText={error?.message || (companies.length === 0 ? 'Add a company under Quotations → Companies' : '')}
                          sx={compactInput}
                        >
                          {companyOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect name="template" label="Template" options={PI_TEMPLATES} size="small" sx={compactInput} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="piNumber"
                      label="PI Number"
                      placeholder={suggestedNumber || 'Auto-generated on save'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="piDate" label="Date" type="date" InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="gstin" label="GST" InputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="poNumber" label="PO Number" placeholder="Customer PO Number" InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </Section>

              <Section>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="partyName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={parties}
                          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name || '')}
                          inputValue={field.value || ''}
                          onInputChange={(_event, value, reason) => {
                            if (reason === 'reset') return;
                            field.onChange(value);
                            setValue('partyRef', '');
                          }}
                          onChange={(_event, value) => {
                            if (value && typeof value === 'object') applyParty(value);
                          }}
                          renderOption={(props, opt) => (
                            <li {...props} key={opt._id}>
                              <Box>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.name}</Typography>
                                {opt.gstin && (
                                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                                    GST: {opt.gstin}
                                  </Typography>
                                )}
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="To (Party Name) *"
                              placeholder="Type or pick a party"
                              onBlur={field.onBlur}
                              error={Boolean(error)}
                              helperText={error?.message}
                              sx={compactInput}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="partyGstin" label="Party GST" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="deliveryAddress" label="Delivery Address" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Section>

              <Section
                title="Items"
                action={
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => append(emptyItem())}>
                    Add Item
                  </Button>
                }
              >
                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Table size="small" sx={{ '& td, & th': { px: 0.75, fontSize: '0.75rem' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, width: 44 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 130 }}>Model No</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 80 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>Unit Rate</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }} align="right">
                          Amount
                        </TableCell>
                        <TableCell sx={{ width: 40 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3, color: itemsError ? 'error.main' : 'text.secondary' }}>
                            No items. Click &quot;Add Item&quot;.
                          </TableCell>
                        </TableRow>
                      ) : (
                        fields.map((row, index) => {
                          const current = items?.[index] || {};
                          const lineAmount = (Number(current.qty) || 0) * (Number(current.rate) || 0);
                          return (
                            <TableRow key={row.id} sx={{ verticalAlign: 'top' }}>
                              <TableCell sx={{ pt: 1.5 }}>{index + 1}</TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.description`} placeholder="Description" multiline maxRows={4} />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.modelNo`} placeholder="Model No" />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.qty`} type="number" inputProps={{ min: 0, step: 'any' }} />
                              </TableCell>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.unit`}
                                  control={control}
                                  render={({ field }) => (
                                    <UnitAutocomplete
                                      value={field.value}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      label=""
                                      placeholder="Unit"
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.rate`} type="number" inputProps={{ min: 0, step: 'any' }} />
                              </TableCell>
                              <TableCell align="right" sx={{ pt: 1.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {money(lineAmount)}
                              </TableCell>
                              <TableCell sx={{ pt: 0.75 }}>
                                <IconButton size="small" color="error" onClick={() => remove(index)} aria-label="Remove item">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={5}>
                    <Stack direction="row" spacing={1.5}>
                      <RHFTextField name="freight" label="Freight" type="number" inputProps={{ min: 0, step: 'any' }} />
                      <RHFTextField name="gstRate" label="GST %" type="number" inputProps={{ min: 0, max: 100, step: 'any' }} />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Box sx={{ bgcolor: 'grey.50', borderRadius: 1.5, px: 1.75, py: 1 }}>
                      <TotalRow label="Total (Excluding GST)" value={totals.totalExGst} />
                      <TotalRow label="Freight" value={totals.freight} />
                      <TotalRow label="Total Amount" value={totals.totalAmount} />
                      <TotalRow label={`GST ${Number(gstRate) || 0}%`} value={totals.gstAmount} />
                      <Divider sx={{ my: 0.5 }} />
                      <TotalRow label="Net Amount To Be Received" value={totals.netAmount} strong />
                    </Box>
                  </Grid>
                </Grid>
              </Section>

              <Section title="Terms & Conditions">
                <RHFTextField name="terms" multiline minRows={4} />
              </Section>

              <Section title="Bank Details">
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="bank.accountName" label="Account Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="bank.accountNo" label="A/C No." />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="bank.bankName" label="Bank Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="bank.ifsc" label="IFSC Code" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="bank.branch" label="Branch" />
                  </Grid>
                </Grid>
              </Section>

              <Section>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="preparedBy" label="Prepared By" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="checkedBy" label="Checked By" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="kindAttention" label="Kindly Attention" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="remarks" label="Any Remarks (If Any)" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Section>
            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}
          >
            <Button onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              disabled={saving}
              onClick={handleSubmit((values) => save(values, false), onInvalid)}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              disabled={saving}
              onClick={handleSubmit((values) => save(values, true), onInvalid)}
            >
              Save &amp; Download PDF
            </Button>
          </Stack>
        </Box>
      </FormProvider>
    </Drawer>
  );
}
