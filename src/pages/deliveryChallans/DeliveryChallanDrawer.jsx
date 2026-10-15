import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import { UnitAutocomplete } from '../../components/common/FormFields/RHFUnitSelect';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { deliveryChallanApi } from '../../api/deliveryChallanApi';
import { apiErrorMessage, money } from '../quotations/quotationUtils';
import { amountInWords } from '../quotations/quotationPdf';
import { downloadDeliveryChallanPdf } from './deliveryChallanPdf';
import { dcTotal, emptyDcForm, emptyDcItem, formToDcPayload } from './dcUtils';

const MAX_ATTACHMENTS = 10;

const itemSchema = yup.object({
  name: yup.string().trim().required('Item name is required'),
  qty: yup.number().typeError('Qty is required').moreThan(0, 'Qty must be > 0').required('Qty is required'),
  rate: yup.number().typeError('Rate is required').min(0, 'Rate cannot be negative').required('Rate is required'),
});

const schema = yup.object({
  companyRef: yup.string().required('Select a seller company'),
  recipientName: yup.string().trim().required('Recipient name is required'),
  items: yup.array().of(itemSchema).min(1, 'Add at least one item'),
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

/** Right-side create / edit form for a Delivery Challan. `dc` = existing challan when editing. */
export default function DeliveryChallanDrawer({ open, dc, initialValues, companies, parties, onClose, onSaved }) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(dc?._id);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [keptAttachments, setKeptAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const fileInputRef = useRef(null);

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: emptyDcForm() });
  const { control, handleSubmit, reset, setValue, formState } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  

  useEffect(() => {
    if (!open) return;
  
    const values = initialValues || emptyDcForm();
  
    const savedCompanyRef =
      values.companyRef ||
      values.company?.ref?._id ||
      values.company?.ref ||
      dc?.company?.ref?._id ||
      dc?.company?.ref ||
      '';
  
    const savedCompanyName =
      values.company?.name ||
      dc?.company?.name ||
      '';
  
    const savedCompanyCode =
      values.company?.code ||
      dc?.company?.code ||
      '';
  
    const matchedCompany = companies.find((company) => {
      if (savedCompanyRef && company._id === String(savedCompanyRef)) {
        return true;
      }
  
      if (
        savedCompanyName &&
        company.name?.trim().toLowerCase() ===
          savedCompanyName.trim().toLowerCase()
      ) {
        return true;
      }
  
      if (
        savedCompanyCode &&
        company.code?.trim().toLowerCase() ===
          savedCompanyCode.trim().toLowerCase()
      ) {
        return true;
      }
  
      return false;
    });
  
    console.log('Saved company:', {
      savedCompanyRef,
      savedCompanyName,
      savedCompanyCode,
      matchedCompany,
      companies,
    });
  
    reset({
      ...values,
      companyRef: matchedCompany?._id || savedCompanyRef || '',
    });
  
    setSuggestions([]);
    setKeptAttachments(dc?.attachments || []);
    setNewFiles([]);
  }, [open, initialValues, dc, reset, companies]);
  


  const [companyRef, dcDate, items] = useWatch({ control, name: ['companyRef', 'dcDate', 'items'] });
  const total = useMemo(() => dcTotal(items || []), [items]);
  const words = useMemo(() => (total > 0 ? amountInWords(total) : ''), [total]);

  useEffect(() => {
    if (!open || isEdit || !companyRef) {
      setSuggestions([]);
      return undefined;
    }
    let active = true;
    deliveryChallanApi
      .nextNumber({ company: companyRef, date: dcDate || undefined })
      .then((res) => {
        if (active) setSuggestions(res.data?.data?.suggestions || []);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, [open, isEdit, companyRef, dcDate]);

  const applyRecipient = (party) => {
    setValue('recipientRef', party._id);
    setValue('recipientName', party.name, { shouldValidate: true });
    if (party.address) setValue('recipientAddress', party.address);
  };

  const handleFilesPicked = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    const room = MAX_ATTACHMENTS - keptAttachments.length - newFiles.length;
    if (picked.length > room) {
      dispatch(showSnackbar({ message: `You can attach up to ${MAX_ATTACHMENTS} files`, severity: 'warning' }));
    }
    setNewFiles((prev) => [...prev, ...picked.slice(0, Math.max(room, 0))]);
  };

  const save = async (values, download) => {
    setSaving(true);
    try {
      const payload = formToDcPayload(
        values,
        words,
        keptAttachments.map((file) => file._id)
      );
      const { data } = isEdit
        ? await deliveryChallanApi.update(dc._id, payload, newFiles)
        : await deliveryChallanApi.create(payload, newFiles);
      const saved = data.data;
      if (download) downloadDeliveryChallanPdf(saved);
      dispatch(showSnackbar({ message: `Delivery Challan ${saved.dcNumber} ${isEdit ? 'updated' : 'created'}` }));
      onSaved?.(saved);
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to save Delivery Challan'), severity: 'error' }));
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
              background: 'linear-gradient(180deg, #ecfeff 0%, #ffffff 72%)',
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
                    bgcolor: '#cffafe',
                    color: '#0e7490',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocalShippingIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                    {isEdit ? `Edit ${dc.dcNumber}` : 'Create Delivery Challan'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mt: 0.25 }}>
                    {isEdit ? 'Update the details below' : 'Fill details below to create a new Delivery Challan'}
                  </Typography>
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
                  <Grid item xs={12} sm={4}>
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
                          onChange={(event) => field.onChange(event.target.value)}
                          onBlur={field.onBlur}
                          error={Boolean(error)}
                          helperText={error?.message || (companies.length === 0 ? 'Add a company under Quotations → Companies' : '')}
                          sx={compactInput}
                        >
                          {companies.map((company) => (
                            <MenuItem key={company._id} value={company._id}>
                              {company.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="dcNumber"
                      label="DC Number"
                      placeholder={suggestions[0]?.dcNumber || 'Auto-generated on save'}
                      InputLabelProps={{ shrink: true }}
                    />
                    {!isEdit && suggestions.length > 1 && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.5 }}>
                        {suggestions.map((s) => (
                          <Chip
                            key={s.series}
                            size="small"
                            variant="outlined"
                            label={s.dcNumber}
                            onClick={() => setValue('dcNumber', s.dcNumber)}
                            sx={{ fontSize: '0.6875rem' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="dcDate" label="Date" type="date" InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="receiverName" label="Receiver Name / Visitor Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="receiverNumber" label="Receiver Number / Visitor Number" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="recipientName"
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
                            setValue('recipientRef', '');
                          }}
                          onChange={(_event, value) => {
                            if (value && typeof value === 'object') applyRecipient(value);
                          }}
                          renderOption={(props, opt) => (
                            <li {...props} key={opt._id}>
                              <Box>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.name}</Typography>
                                {opt.address && (
                                  <Typography color="text.secondary" noWrap sx={{ fontSize: '0.6875rem', maxWidth: 380 }}>
                                    {opt.address}
                                  </Typography>
                                )}
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="To (Recipient Name) *"
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
                    <RHFTextField name="placeOfSupply" label="Place of Supply" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="recipientAddress" label="Recipient Address (ADD)" multiline minRows={3} />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="deliveryAddress" label="Delivery Address (optional)" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Section>

              <Section
                title="Items"
                action={
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => append(emptyDcItem())}>
                    Add Item
                  </Button>
                }
              >
                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Table size="small" sx={{ '& td, & th': { px: 0.75, fontSize: '0.75rem' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, width: 44 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Name of Item</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 120 }}>HSN Code</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 80 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>UOM</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>Rate</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }} align="right">
                          Value
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
                          const value = (Number(current.qty) || 0) * (Number(current.rate) || 0);
                          return (
                            <TableRow key={row.id} sx={{ verticalAlign: 'top' }}>
                              <TableCell sx={{ pt: 1.5 }}>{index + 1}</TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.name`} placeholder="Name of item" multiline maxRows={3} />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.hsnCode`} placeholder="HSN" />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.qty`} type="number" inputProps={{ min: 0, step: 'any' }} />
                              </TableCell>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.uom`}
                                  control={control}
                                  render={({ field }) => (
                                    <UnitAutocomplete
                                      value={field.value}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      label=""
                                      placeholder="UOM"
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <RHFTextField name={`items.${index}.rate`} type="number" inputProps={{ min: 0, step: 'any' }} />
                              </TableCell>
                              <TableCell align="right" sx={{ pt: 1.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {money(value)}
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
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell colSpan={6} align="right" sx={{ fontWeight: 700 }}>
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {money(total)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <TextField
                  label="Amount In Words (auto)"
                  value={words}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2, ...compactInput }}
                />
              </Section>

              <Section title="Dispatch & Service Details">
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="rateOfTax" label="Rate of Tax" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="taxAmount" label="Tax Amount" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="modeOfDispatch" label="Mode of Dispatch" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="vehicleTransporter" label="Vehicle / Transporter" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="expectedDuration" label="Expected Duration" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="originalInvoiceRef" label="Original Invoice Ref" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="panelNo" label="Panel No" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="complaintNo" label="Complaint No" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="fault" label="Fault / Purpose" multiline minRows={2} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="requestedBy" label="Requested By" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="approvedBy" label="Approved By" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="notes" label="Notes" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Section>

              <Section
                title="Attachments"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={keptAttachments.length + newFiles.length >= MAX_ATTACHMENTS}
                  >
                    Add Files
                  </Button>
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFilesPicked}
                />
                {keptAttachments.length + newFiles.length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    No attachments. Images or PDFs, up to {MAX_ATTACHMENTS} files.
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    {keptAttachments.map((file) => (
                      <Stack key={file._id} direction="row" alignItems="center" spacing={1}>
                        <AttachFileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Link href={file.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.8125rem', flex: 1 }} noWrap>
                          {file.name || 'Attachment'}
                        </Link>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Remove attachment"
                          onClick={() => setKeptAttachments((prev) => prev.filter((f) => f._id !== file._id))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                    {newFiles.map((file, index) => (
                      <Stack key={`${file.name}-${index}`} direction="row" alignItems="center" spacing={1}>
                        <AttachFileIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography noWrap sx={{ fontSize: '0.8125rem', flex: 1 }}>
                          {file.name}
                        </Typography>
                        <Chip size="small" label="New" color="primary" variant="outlined" />
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Remove file"
                          onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
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
              Close
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
