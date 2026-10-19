import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/CalculateOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlightIcon from '@mui/icons-material/FlightTakeoffOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import RadioUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import WorkIcon from '@mui/icons-material/WorkOutline';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { atlantaPaymentApi } from '../../api/atlantaPaymentApi';
import { apiErrorMessage } from '../quotations/quotationUtils';
import {
  EXPENSE_FIELDS,
  TADA_RATE_PER_DAY,
  computeTotals,
  emptyForm,
  emptyInvoiceEntry,
  emptyPayment,
  emptyTravelExpense,
  entryTotalExpense,
  formToPayload,
  inr,
  paymentToForm,
  percentOfBasic,
} from './atlantaUtils';

const RED = '#dc2626';
const RED_GRADIENT = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
const TINT_BG = '#fdeaea';
const TINT_BORDER = '#f6c6c6';
const SOFT_BG = '#fbfbfb';

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: '0.875rem' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: RED },
  '& .MuiFormHelperText-root': { mx: 0, fontSize: '0.6875rem' },
};

const getError = (errors, name) => name.split('.').reduce((acc, key) => acc?.[key], errors);

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 0.6, color: 'text.primary' }}>
      {children}
      {required && <span style={{ color: RED }}> *</span>}
    </Typography>
  );
}

/** Label-above input wired to react-hook-form via `register`. */
function Field({ name, label, required, helper, type = 'text', numeric, multiline, placeholder }) {
  const { register, formState } = useFormContext();
  const { ref, ...rest } = register(name, required ? { validate: (v) => String(v ?? '').trim() !== '' || `${label} is required` } : undefined);
  const error = getError(formState.errors, name);
  return (
    <Box>
      <FieldLabel required={required}>{label}</FieldLabel>
      <TextField
        {...rest}
        inputRef={ref}
        fullWidth
        size="small"
        type={numeric ? 'number' : type}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error?.message || helper || ' '}
        inputProps={numeric ? { min: 0, step: 'any' } : undefined}
        FormHelperTextProps={{ sx: { minHeight: 0, lineHeight: 1.2, mt: 0.4 } }}
        sx={inputSx}
      />
    </Box>
  );
}

function SectionCard({ icon, title, subtitle, action, children }) {
  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: '16px', border: '1px solid #ececec', boxShadow: '0 4px 18px rgba(31, 42, 68, 0.07)', p: { xs: 2, sm: 3 } }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: RED_GRADIENT,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {(subtitle || action) && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            {subtitle}
          </Typography>
          {action}
        </Stack>
      )}
      {children}
    </Paper>
  );
}

function AddButton({ children, onClick }) {
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ borderRadius: '10px', color: 'text.primary', borderColor: '#d9d9d9', textTransform: 'none', fontWeight: 500, '&:hover': { borderColor: RED, bgcolor: TINT_BG } }}
    >
      {children}
    </Button>
  );
}

function RowCard({ title, onRemove, children, header }) {
  return (
    <Box sx={{ border: '1px solid #ececec', bgcolor: SOFT_BG, borderRadius: '12px', p: 2, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        {header || (
          <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {title}
          </Typography>
        )}
        {onRemove && (
          <IconButton size="small" onClick={onRemove} aria-label={`Remove ${title}`} sx={{ color: RED }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      {children}
    </Box>
  );
}

function TotalBar({ label, value, tone = 'red' }) {
  const green = tone === 'green';
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: green ? '#bfe5cc' : TINT_BORDER,
        bgcolor: green ? '#e7f6ec' : TINT_BG,
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: green ? '#16a34a' : RED }}>{value}</Typography>
    </Stack>
  );
}

function InvoiceEntry({ index, field, values, collapsed, onToggle, onRemove, canRemove }) {
  const entry = values.invoiceEntries?.[index] || {};
  const basic = entry.basicAmount;
  const totalExpense = entryTotalExpense(entry);
  const expensePct = percentOfBasic(totalExpense, basic);

  return (
    <RowCard
      title={`Entry #${index + 1}`}
      onRemove={canRemove ? onRemove : undefined}
      header={
        <Button
          size="small"
          onClick={() => onToggle(field.id)}
          startIcon={collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 500, ml: -1 }}
        >
          Entry #{index + 1}
          {collapsed && totalExpense > 0 && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: '0.75rem' }}>
              {entry.invoiceNoDate || 'No invoice no.'} · Expense {inr(totalExpense)}
            </Typography>
          )}
        </Button>
      }
    >
      <Collapse in={!collapsed}>
        <Typography sx={{ color: RED, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.4, mb: 1 }}>INVOICE DETAILS</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Field name={`invoiceEntries.${index}.invoiceNoDate`} label="Invoice No. & Date" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Field name={`invoiceEntries.${index}.basicAmount`} label="Basic Amount (₹)" numeric />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Field name={`invoiceEntries.${index}.quantity`} label="Quantity" numeric />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Field name={`invoiceEntries.${index}.totalAmount`} label="Total Amount (₹)" numeric />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ color: RED, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.4, mb: 1 }}>TOTAL EXPENSE DETAILS</Typography>
        <Grid container spacing={2}>
          {EXPENSE_FIELDS.map((item) => {
            const pct = percentOfBasic(entry[item.name], basic);
            return (
              <Grid item xs={12} sm={6} md={3} key={item.name}>
                <Field
                  name={`invoiceEntries.${index}.${item.name}`}
                  label={item.label}
                  numeric
                  placeholder="Enter amount"
                  helper={pct ? `${pct}% of Basic` : undefined}
                />
              </Grid>
            );
          })}
          <Grid item xs={12} sm={6} md={3}>
            <Field name={`invoiceEntries.${index}.miscRecipientName`} label="Miscellaneous Recipient Name" placeholder="Enter recipient name" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: TINT_BG, border: `1px solid ${TINT_BORDER}` }}>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Invoice Total
              </Typography>
              <Typography sx={{ color: RED, fontWeight: 700, fontSize: '1.125rem' }}>{inr(entry.totalAmount)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: TINT_BG, border: `1px solid ${TINT_BORDER}` }}>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Expense
              </Typography>
              <Typography sx={{ color: RED, fontWeight: 700, fontSize: '1.125rem' }}>{inr(totalExpense)}</Typography>
              {expensePct && (
                <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                  {expensePct}% of Basic
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </RowCard>
  );
}

function TravelExpenseRow({ index, field, values, files, setFiles, onRemove }) {
  const { setValue } = useFormContext();
  const row = values.travelExpenses?.[index] || {};
  const file = files[field.id];
  const done = Boolean(row.transactionDone);

  const pickFile = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (picked) setFiles((prev) => ({ ...prev, [field.id]: picked }));
  };

  const clearProof = () => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[field.id];
      return next;
    });
    setValue(`travelExpenses.${index}.keepProof`, null, { shouldDirty: true });
  };

  return (
    <RowCard title={`Expense #${index + 1}`} onRemove={onRemove}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Field name={`travelExpenses.${index}.date`} label="Date" type="date" />
        </Grid>
        <Grid item xs={12} sm={8} md={6}>
          <Field name={`travelExpenses.${index}.detail`} label="Daily Expense Detail" multiline />
        </Grid>
        <Grid item xs={12} md={3}>
          <Field name={`travelExpenses.${index}.amount`} label="Amount (₹)" numeric />
        </Grid>
        <Grid item xs={12} sm={7}>
          <FieldLabel>Proof (Photo/PDF)</FieldLabel>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ border: '1px solid #c4c4c4', bgcolor: '#fff', borderRadius: '10px', p: 0.75 }}>
            <Button
              component="label"
              size="small"
              variant="contained"
              disableElevation
              sx={{ bgcolor: RED, '&:hover': { bgcolor: '#b91c1c' }, textTransform: 'none', borderRadius: '6px', flexShrink: 0 }}
            >
              Choose file
              <input hidden type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickFile} />
            </Button>
            {file ? (
              <Typography noWrap sx={{ fontSize: '0.8125rem', flex: 1 }}>
                {file.name}
              </Typography>
            ) : row.keepProof ? (
              <Link href={row.keepProof.url} target="_blank" rel="noopener noreferrer" noWrap sx={{ fontSize: '0.8125rem', flex: 1 }}>
                {row.keepProof.name || 'Saved proof'}
              </Link>
            ) : (
              <Typography color="text.secondary" sx={{ fontSize: '0.8125rem', flex: 1 }}>
                No file chosen
              </Typography>
            )}
            {(file || row.keepProof) && (
              <IconButton size="small" onClick={clearProof} aria-label="Remove proof">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={5}>
          <FieldLabel>Transaction Done</FieldLabel>
          <Button
            onClick={() => setValue(`travelExpenses.${index}.transactionDone`, !done, { shouldDirty: true })}
            startIcon={done ? <CheckCircleIcon sx={{ color: '#16a34a' }} /> : <RadioUncheckedIcon sx={{ color: RED }} />}
            sx={{ textTransform: 'none', color: done ? '#16a34a' : 'text.secondary', fontWeight: 500, px: 0.5 }}
          >
            Mark as completed
          </Button>
        </Grid>
      </Grid>
    </RowCard>
  );
}

/** Right-side create / edit form for an Atlanta payment entry. `payment` = existing entry when editing. */
export default function AtlantaPaymentDrawer({ open, payment, onClose, onSaved }) {
  const isEdit = Boolean(payment?._id);
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({});
  const [collapsed, setCollapsed] = useState({});

  const methods = useForm({ defaultValues: emptyForm() });
  const { control, handleSubmit, reset } = methods;
  const invoiceArray = useFieldArray({ control, name: 'invoiceEntries' });
  const travelArray = useFieldArray({ control, name: 'travelExpenses' });
  const paymentArray = useFieldArray({ control, name: 'paymentsReceived' });

  const values = useWatch({ control });
  const totals = useMemo(() => computeTotals(values), [values]);

  useEffect(() => {
    if (!open) return;
    reset(payment ? paymentToForm(payment) : emptyForm());
    setFiles({});
    setCollapsed({});
  }, [open, payment, reset]);

  const toggleEntry = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = async (formValues) => {
    setSaving(true);
    try {
      const { payload, proofFiles } = formToPayload(
        formValues,
        travelArray.fields.map((row) => row.id),
        files
      );
      if (isEdit) await atlantaPaymentApi.update(payment._id, payload, proofFiles);
      else await atlantaPaymentApi.create(payload, proofFiles);
      dispatch(showSnackbar({ message: `Payment entry ${isEdit ? 'updated' : 'created'}` }));
      onSaved?.();
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to save payment entry'), severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => dispatch(showSnackbar({ message: 'Please fill the required fields', severity: 'warning' }));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => !saving && onClose()}
      PaperProps={{ sx: { borderRadius: 0, boxShadow: '-8px 0 32px rgba(31, 42, 68, 0.1)', bgcolor: '#f7f7f8' } }}
    >
      <FormProvider {...methods}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          sx={{ width: { xs: '100vw', md: 940 }, maxWidth: '100vw', display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Box sx={{ px: 3, py: 2, bgcolor: '#fff', borderBottom: '1px solid #ececec' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box>
                <Typography component="h1" sx={{ fontWeight: 800, fontSize: '1.375rem', lineHeight: 1.25 }}>
                  {isEdit ? 'Edit Payment Entry' : 'New Payment Entry'}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.8125rem', mt: 0.5 }}>
                  {isEdit ? 'Update the details below to save changes to this payment record' : 'Fill in the details below to create a new payment record'}
                </Typography>
              </Box>
              <IconButton onClick={onClose} disabled={saving} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
            <Stack spacing={3}>
              <SectionCard icon={<DescriptionIcon fontSize="small" />} title="Record Information">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="fileName" label="File Name / Record Name" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="consigneeName" label="Consignee Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="crnDate" label="CRN Date" type="date" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="paymentDate" label="Payment Date" type="date" />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard icon={<PersonIcon fontSize="small" />} title="Employee Details">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="employeeName" label="Employee Name" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="designation" label="Designation" />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard icon={<FlightIcon fontSize="small" />} title="Hotel Expense">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Field name="travelStartAt" label="Travelling Start Date & Time" type="datetime-local" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Field name="reachedAt" label="Reached Destination Date & Time" type="datetime-local" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Field name="exitAt" label="Exit Destination Date & Time" type="datetime-local" />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 1, p: 2, borderRadius: '12px', bgcolor: TINT_BG, border: `1px solid ${TINT_BORDER}` }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <CalculateIcon sx={{ color: RED, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>TADA Calculation</Typography>
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #ececec' }}>
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.75}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            Travel Days
                          </Typography>
                        </Stack>
                        <Typography sx={{ color: RED, fontWeight: 800, fontSize: '1.5rem' }}>{totals.days}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #ececec' }}>
                        <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                          Rate per Day
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem' }}>{inr(TADA_RATE_PER_DAY)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', background: RED_GRADIENT, color: '#fff', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.3)' }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Total TADA</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem' }}>{inr(totals.totalTada)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', textAlign: 'center', mt: 1.25 }}>
                    * TADA is automatically calculated based on travel duration
                  </Typography>
                </Box>
              </SectionCard>

              <SectionCard
                icon={<WorkIcon fontSize="small" />}
                title="Invoice & Total Expense Details"
                subtitle="Add invoice with associated expense details"
                action={<AddButton onClick={() => invoiceArray.append(emptyInvoiceEntry())}>Add Entry</AddButton>}
              >
                {invoiceArray.fields.map((field, index) => (
                  <InvoiceEntry
                    key={field.id}
                    index={index}
                    field={field}
                    values={values}
                    collapsed={Boolean(collapsed[field.id])}
                    onToggle={toggleEntry}
                    onRemove={() => invoiceArray.remove(index)}
                    canRemove={invoiceArray.fields.length > 1}
                  />
                ))}
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderRadius: '12px', border: '1px solid #ececec', bgcolor: SOFT_BG }}>
                      <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                        Total Basic Amount
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{inr(totals.totalBasic)}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderRadius: '12px', border: '1px solid #ececec', bgcolor: SOFT_BG }}>
                      <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                        Total Invoice Amount
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{inr(totals.totalInvoice)}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TotalBar label="Total Expense" value={inr(totals.totalExpense)} />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard
                icon={<ReceiptIcon fontSize="small" />}
                title="Expense Add On During Travelling"
                subtitle="Track daily expenses during travel with proof uploads"
              >
                {travelArray.fields.map((field, index) => (
                  <TravelExpenseRow
                    key={field.id}
                    index={index}
                    field={field}
                    values={values}
                    files={files}
                    setFiles={setFiles}
                    onRemove={() => travelArray.remove(index)}
                  />
                ))}
                <Box sx={{ mb: 2 }}>
                  <AddButton onClick={() => travelArray.append(emptyTravelExpense())}>Add Expense</AddButton>
                </Box>
                <TotalBar label="Total Travel Expenses" value={inr(totals.totalTravel)} />
              </SectionCard>

              <SectionCard
                icon={<CreditCardIcon fontSize="small" />}
                title="Payment Received Details"
                subtitle="Record payment received details"
                action={<AddButton onClick={() => paymentArray.append(emptyPayment())}>Add Payment</AddButton>}
              >
                {paymentArray.fields.map((field, index) => (
                  <RowCard key={field.id} title={`Payment #${index + 1}`} onRemove={() => paymentArray.remove(index)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Field name={`paymentsReceived.${index}.paymentDate`} label="Payment Date" type="date" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Field name={`paymentsReceived.${index}.amount`} label="Amount (₹)" numeric />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Field name={`paymentsReceived.${index}.deductAmount`} label="Deduct Amount (₹)" numeric placeholder="Enter deduction" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Field name={`paymentsReceived.${index}.details`} label="Details" placeholder="Enter details" />
                      </Grid>
                    </Grid>
                  </RowCard>
                ))}
                <TotalBar label="Total Received Amount" value={inr(totals.totalReceived)} tone="green" />
              </SectionCard>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 2.5, py: 2, borderRadius: '14px', border: '1px solid #f3b3b3', bgcolor: '#fbd9d9' }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#ef4444' }}>
                  <CreditCardIcon />
                  <Typography sx={{ fontWeight: 700 }}>Amount to Give</Typography>
                </Stack>
                <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '1.5rem' }}>{inr(totals.amountToGive)}</Typography>
              </Stack>

            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1.5}
            sx={{ px: 3, py: 1.5, bgcolor: '#fff', borderTop: '1px solid #ececec' }}
          >
            <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={<SendIcon />}
              sx={{
                background: RED_GRADIENT,
                borderRadius: '10px',
                px: 3,
                py: 1.1,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)' },
              }}
            >
              {saving ? 'Saving…' : isEdit ? 'Update Payment Entry' : 'Submit Payment Entry'}
            </Button>
          </Stack>
        </Box>
      </FormProvider>
    </Drawer>
  );
}
