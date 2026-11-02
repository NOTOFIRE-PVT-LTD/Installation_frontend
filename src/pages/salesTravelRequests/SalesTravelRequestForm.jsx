import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { salesTravelRequestApi } from '../../api/salesTravelRequestApi';
import { apiErrorMessage } from '../quotations/quotationUtils';
import {
  ACCEPTED_PROOF_TYPES,
  MAX_PROOF_SIZE_MB,
  TRAVEL_MODES,
  computeSalesTravelTotals,
  emptyItineraryRow,
  emptyPersonToMeet,
  emptySalesTravelForm,
  emptyTripExpenseRow,
  formToSalesTravelPayload,
  inr,
  requestToForm,
} from './salesTravelUtils';

const BLUE = '#0d6efd';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#f9fafb',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused': { bgcolor: '#fff' },
    '&.Mui-focused fieldset': { borderColor: BLUE },
  },
  '& .MuiFormHelperText-root': { mx: 0, fontSize: '0.72rem' },
};

const getError = (errors, name) => name.split('.').reduce((acc, key) => acc?.[key], errors);

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 0.75, color: '#1e293b' }}>
      {children}
      {required && <span style={{ color: '#dc2626' }}> *</span>}
    </Typography>
  );
}

function FormInput({
  name,
  label,
  required,
  placeholder,
  type = 'text',
  numeric = false,
  multiline = false,
  minRows = 3,
  icon = null,
}) {
  const { register, formState } = useFormContext();
  const { ref, ...rest } = register(
    name,
    required
      ? { validate: (v) => String(v ?? '').trim() !== '' || `${label} is required` }
      : undefined
  );
  const error = getError(formState.errors, name);

  return (
    <Box>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <TextField
        {...rest}
        inputRef={ref}
        fullWidth
        size="small"
        type={numeric ? 'number' : type}
        multiline={multiline}
        minRows={multiline ? minRows : undefined}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error?.message}
        inputProps={numeric ? { min: 0, step: 'any' } : undefined}
        InputProps={
          icon
            ? {
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={multiline ? { alignSelf: 'flex-start', mt: 1 } : undefined}
                  >
                    {icon}
                  </InputAdornment>
                ),
              }
            : undefined
        }
        sx={inputSx}
      />
    </Box>
  );
}

function SectionHeading({ title, buttonLabel, onAdd }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
      <Typography
        sx={{
          fontSize: '0.775rem',
          fontWeight: 600,
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>
      {buttonLabel && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon fontSize="small" />}
          onClick={onAdd}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: '#1e293b',
            borderColor: '#e2e8f0',
            bgcolor: '#fff',
            px: 1.5,
            py: 0.5,
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
          }}
        >
          {buttonLabel}
        </Button>
      )}
    </Stack>
  );
}

export default function SalesTravelRequestForm({
  request = null,
  defaultTravellerName = '',
  onClose,
  onSaved,
}) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(request?._id);
  const [saving, setSaving] = useState(false);
  const [filesByRowId, setFilesByRowId] = useState({});

  const methods = useForm({
    defaultValues: request ? requestToForm(request) : emptySalesTravelForm(defaultTravellerName),
  });
  const { control, register, handleSubmit, reset, setValue } = methods;

  const personsArray = useFieldArray({ control, name: 'personsToMeet' });
  const itineraryArray = useFieldArray({ control, name: 'travelItinerary' });
  const tripExpenseArray = useFieldArray({ control, name: 'tripExpenses' });

  const watchedValues = useWatch({ control });
  const totals = computeSalesTravelTotals(watchedValues);

  useEffect(() => {
    reset(request ? requestToForm(request) : emptySalesTravelForm(defaultTravellerName));
    setFilesByRowId({});
  }, [request, defaultTravellerName, reset]);

  const handleFileChange = (fieldId, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
      dispatch(
        showSnackbar({
          message: `File "${file.name}" exceeds ${MAX_PROOF_SIZE_MB} MB limit`,
          severity: 'error',
        })
      );
      return;
    }
    setFilesByRowId((prev) => ({ ...prev, [fieldId]: file }));
  };

  const handleRemoveFile = (fieldId, rowIndex) => {
    setFilesByRowId((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    setValue(`tripExpenses.${rowIndex}.existingProof`, null);
  };

  const onSubmit = async (values) => {
    // Validate day-wise trip expenses: if any row has amount > 0 or expenseDetail or date, require Date, Amount & Proof
    for (let i = 0; i < (values.tripExpenses || []).length; i += 1) {
      const row = values.tripExpenses[i];
      const fieldId = tripExpenseArray.fields[i]?.id;
      const pickedFile = fieldId ? filesByRowId[fieldId] : null;
      const hasExistingProof = Boolean(row?.existingProof?.url);
      const hasAnyExpenseInput =
        Boolean(row?.date) ||
        Number(row?.amount) > 0 ||
        Boolean(String(row?.expenseDetail || '').trim()) ||
        Boolean(pickedFile) ||
        hasExistingProof;

      if (hasAnyExpenseInput) {
        if (!row?.date) {
          dispatch(
            showSnackbar({
              message: `Trip Expense row #${i + 1}: Date is required`,
              severity: 'warning',
            })
          );
          return;
        }
        if (!(Number(row?.amount) > 0)) {
          dispatch(
            showSnackbar({
              message: `Trip Expense row #${i + 1}: Amount must be greater than 0`,
              severity: 'warning',
            })
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      const { payload, proofFiles } = formToSalesTravelPayload(
        values,
        tripExpenseArray.fields.map((f) => f.id),
        filesByRowId
      );
      if (isEdit) {
        await salesTravelRequestApi.update(request._id, payload, proofFiles);
      } else {
        await salesTravelRequestApi.create(payload, proofFiles);
      }
      dispatch(
        showSnackbar({
          message: isEdit ? 'Travel request updated successfully' : 'Travel request submitted successfully',
        })
      );
      onSaved?.();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: apiErrorMessage(err, 'Failed to submit travel request'),
          severity: 'error',
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => {
    dispatch(
      showSnackbar({
        message: 'Please fill in all required fields (City, Name of Person Travelling, and Person to Meet Name)',
        severity: 'warning',
      })
    );
  };

  const iconProps = { sx: { fontSize: 18, color: '#94a3b8' } };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        bgcolor: '#fff',
        p: { xs: 2, sm: 3.5 },
        mb: 3,
      }}
    >
      <FormProvider {...methods}>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              {isEdit ? 'Edit Travel Request' : 'New Travel Request'}
            </Typography>
            {onClose && (
              <IconButton size="small" onClick={onClose} disabled={saving} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Stack spacing={2.5}>
            {/* Row 1: Travel From & Travel To */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="travelFrom"
                  label="Travel From"
                  type="date"
                  icon={<CalendarTodayOutlinedIcon {...iconProps} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="travelTo"
                  label="Travel To"
                  type="date"
                  icon={<CalendarTodayOutlinedIcon {...iconProps} />}
                />
              </Grid>
            </Grid>

            {/* Row 2: City Travelling To & Name of Person (Travelling) */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="cityTravellingTo"
                  label="City Travelling To"
                  required
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  icon={<LocationOnOutlinedIcon {...iconProps} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="travellerName"
                  label="Name of Person (Travelling)"
                  required
                  placeholder="e.g., Rahul Sharma"
                  icon={<PersonOutlineIcon {...iconProps} />}
                />
              </Grid>
            </Grid>

            {/* Row 3: Agenda / Purpose of Travel */}
            <FormInput
              name="agenda"
              label="Agenda / Purpose of Travel"
              multiline
              minRows={3}
              placeholder="Describe the purpose and agenda of your travel..."
              icon={<DescriptionOutlinedIcon {...iconProps} />}
            />

            {/* Section 1: PERSON(S) TO MEET */}
            <SectionHeading
              title="PERSON(S) TO MEET"
              buttonLabel="Add Person"
              onAdd={() => personsArray.append(emptyPersonToMeet())}
            />

            <Stack spacing={2}>
              {personsArray.fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#fff',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.75 }}
                  >
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>
                      Person {index + 1}
                    </Typography>
                    {personsArray.fields.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => personsArray.remove(index)}
                        aria-label={`Remove Person ${index + 1}`}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>

                  <Stack spacing={2}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.name`}
                          label="Name"
                          required
                          placeholder="Full name"
                          icon={<PersonOutlineIcon {...iconProps} />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.designation`}
                          label="Designation"
                          placeholder="e.g., CEO, Manager"
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.company`}
                          label="Company"
                          placeholder="Company name"
                          icon={<BusinessOutlinedIcon {...iconProps} />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.city`}
                          label="City"
                          placeholder="e.g., Mumbai, Delhi"
                          icon={<LocationOnOutlinedIcon {...iconProps} />}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.contactNumber`}
                          label="Contact Number"
                          placeholder="+91 98765 43210"
                          icon={<LocalPhoneOutlinedIcon {...iconProps} />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.email`}
                          label="Email"
                          placeholder="person@email.com"
                          icon={<EmailOutlinedIcon {...iconProps} />}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          name={`personsToMeet.${index}.nextAction`}
                          label="Next Action"
                          placeholder="e.g., Follow up call"
                          icon={<ArrowForwardIcon {...iconProps} />}
                        />
                      </Grid>
                    </Grid>

                    <FormInput
                      name={`personsToMeet.${index}.purposeOfMeeting`}
                      label="Purpose of Meeting"
                      multiline
                      minRows={2.5}
                      placeholder="Describe the purpose of the meeting..."
                      icon={<DescriptionOutlinedIcon {...iconProps} />}
                    />

                    <FormInput
                      name={`personsToMeet.${index}.notesAboutPerson`}
                      label="Notes about Person"
                      multiline
                      minRows={2.5}
                      placeholder="Any notes about this person..."
                      icon={<DescriptionOutlinedIcon {...iconProps} />}
                    />

                    <FormInput
                      name={`personsToMeet.${index}.meetingOutcome`}
                      label="Meeting Outcome"
                      multiline
                      minRows={2.5}
                      placeholder="Describe the outcome of the meeting..."
                      icon={<DescriptionOutlinedIcon {...iconProps} />}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* Section 2: APPROXIMATE EXPENSE / TRAVEL ITINERARY */}
            <SectionHeading
              title="APPROXIMATE EXPENSE / TRAVEL ITINERARY"
              buttonLabel="Add Row"
              onAdd={() => itineraryArray.append(emptyItineraryRow())}
            />

            <Box
              sx={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#fff',
                overflowX: 'auto',
              }}
            >
              <Box sx={{ minWidth: 820 }}>
                {/* Header Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 1fr 130px 1fr 120px 1.4fr 32px',
                    gap: 1.5,
                    pb: 1.5,
                    alignItems: 'end',
                  }}
                >
                  {['Date', 'From', 'To', 'Mode of Travel', 'Availability', 'Cost (₹)', 'Train No./Flight No. & Time', ''].map(
                    (col) => (
                      <Typography
                        key={col}
                        sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}
                      >
                        {col}
                      </Typography>
                    )
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.5}>
                  {itineraryArray.fields.map((field, index) => {
                    const modeValue = watchedValues?.travelItinerary?.[index]?.modeOfTravel ?? '';
                    return (
                      <Box
                        key={field.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr 1fr 130px 1fr 120px 1.4fr 32px',
                          gap: 1.5,
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          {...register(`travelItinerary.${index}.date`)}
                          type="date"
                          size="small"
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`travelItinerary.${index}.from`)}
                          placeholder="City"
                          size="small"
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`travelItinerary.${index}.to`)}
                          placeholder="City"
                          size="small"
                          sx={inputSx}
                        />
                        <Select
                          size="small"
                          displayEmpty
                          value={modeValue}
                          onChange={(e) =>
                            setValue(`travelItinerary.${index}.modeOfTravel`, e.target.value)
                          }
                          sx={{
                            borderRadius: '10px',
                            bgcolor: '#f9fafb',
                            fontSize: '0.875rem',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                          }}
                        >
                          <MenuItem value="">
                            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              Select
                            </Typography>
                          </MenuItem>
                          {TRAVEL_MODES.map((mode) => (
                            <MenuItem key={mode} value={mode} sx={{ fontSize: '0.875rem' }}>
                              {mode}
                            </MenuItem>
                          ))}
                        </Select>
                        <TextField
                          {...register(`travelItinerary.${index}.availability`)}
                          placeholder="Available"
                          size="small"
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`travelItinerary.${index}.cost`)}
                          type="number"
                          placeholder="0"
                          size="small"
                          inputProps={{ min: 0, step: 'any' }}
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`travelItinerary.${index}.trainOrFlightDetails`)}
                          placeholder="e.g., Spicejet SG186 09..."
                          size="small"
                          sx={inputSx}
                        />
                        <Box>
                          {itineraryArray.fields.length > 1 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => itineraryArray.remove(index)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                <Divider sx={{ mt: 2, mb: 1.75 }} />

                <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ pl: 12 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Travel Cost Subtotal
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    {inr(totals.travelCostSubtotal)}
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* Section 3: TRIP EXPENSES (DAY-WISE) */}
            <SectionHeading
              title="TRIP EXPENSES (DAY-WISE)"
              buttonLabel="Add Expense Row"
              onAdd={() => tripExpenseArray.append(emptyTripExpenseRow())}
            />

            <Box
              sx={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#fff',
                overflowX: 'auto',
              }}
            >
              <Box sx={{ minWidth: 680 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '170px 1fr 1.2fr 1fr 32px',
                    gap: 2,
                    pb: 1.5,
                    alignItems: 'end',
                  }}
                >
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                    Date *
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                    Amount (₹) *
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                    Expense Detail
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                    Proof of Expense
                  </Typography>
                  <span />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.5}>
                  {tripExpenseArray.fields.map((field, index) => {
                    const pickedFile = filesByRowId[field.id];
                    const existingProof = watchedValues?.tripExpenses?.[index]?.existingProof;
                    return (
                      <Box
                        key={field.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '170px 1fr 1.2fr 1fr 32px',
                          gap: 2,
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          {...register(`tripExpenses.${index}.date`)}
                          type="date"
                          size="small"
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`tripExpenses.${index}.amount`)}
                          type="number"
                          placeholder="0"
                          size="small"
                          inputProps={{ min: 0, step: 'any' }}
                          sx={inputSx}
                        />
                        <TextField
                          {...register(`tripExpenses.${index}.expenseDetail`)}
                          placeholder="e.g., Hotel, Auto fare, Food"
                          size="small"
                          sx={inputSx}
                        />
                        <Box>
                          {pickedFile || existingProof?.url ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              {existingProof?.url && !pickedFile ? (
                                <Link
                                  href={existingProof.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {existingProof.name || 'View Proof'}
                                </Link>
                              ) : (
                                <Typography
                                  sx={{
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {pickedFile?.name}
                                </Typography>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(field.id, index)}
                                aria-label="Remove file"
                              >
                                <CloseIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Button
                              component="label"
                              size="small"
                              startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                color: BLUE,
                              }}
                            >
                              Choose file
                              <input
                                type="file"
                                hidden
                                accept={ACCEPTED_PROOF_TYPES}
                                onChange={(e) => handleFileChange(field.id, e)}
                              />
                            </Button>
                          )}
                        </Box>
                        <Box>
                          {tripExpenseArray.fields.length > 1 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => tripExpenseArray.remove(index)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                <Divider sx={{ mt: 2, mb: 1.75 }} />

                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={3} sx={{ pr: 18 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Day-wise Total
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    {inr(totals.dayWiseTotal)}
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 1.5 }}>
                  Optional · Image or PDF · Up to {MAX_PROOF_SIZE_MB} MB
                </Typography>
              </Box>
            </Box>

            {/* Grand Total */}
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                ₹ Grand Total: {inr(totals.grandTotal)}
              </Typography>
            </Stack>

            {/* Expected ROI */}
            <FormInput
              name="expectedRoi"
              label="Expected ROI"
              multiline
              minRows={3}
              placeholder="Describe the expected return on investment..."
              icon={<TrendingUpIcon {...iconProps} />}
            />

            {/* Bottom Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                disabled={saving}
                onClick={() => {
                  if (onClose) onClose();
                  else reset(emptySalesTravelForm(defaultTravellerName));
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#0f172a',
                  borderColor: '#e2e8f0',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: BLUE,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0b5ed7', boxShadow: 'none' },
                }}
              >
                {saving ? 'Submitting…' : isEdit ? 'Update Request' : 'Submit Request'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}

