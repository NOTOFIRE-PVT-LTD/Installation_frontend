import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { computeBalanceAmount, formatInr, isAdvancePayment } from './payflowRequestConfig';

const LABEL_SX = { '& .MuiInputLabel-root': { fontWeight: 600 } };
const MONEY_GRID_SX = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } };

export function FormTextField({ control, name, label, extra = {} }) {
  const { helperText: extraHelper, slotProps: extraSlots, ...restExtra } = extra;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          size="small"
          fullWidth
          error={Boolean(error)}
          helperText={error?.message || extraHelper}
          sx={LABEL_SX}
          slotProps={{ inputLabel: { shrink: true }, ...extraSlots }}
          {...restExtra}
        />
      )}
    />
  );
}

export function FormSelectField({ control, name, label, items, required = false, emptyLabel }) {
  const options = items.map((i) => (typeof i === 'string' ? { value: i, label: i } : i));
  return (
    <FormTextField
      control={control}
      name={name}
      label={label}
      extra={{
        select: true,
        required,
        slotProps: { inputLabel: { shrink: true }, select: { displayEmpty: true } },
        children: [
          <MenuItem key="__empty" value="" sx={{ color: 'text.disabled' }}>
            {emptyLabel || `Select ${label.toLowerCase()}`}
          </MenuItem>,
          ...options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          )),
        ],
      }}
    />
  );
}

export function FormComboField({ control, name, label, options, placeholder, required = true }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          options={options || []}
          value={field.value || null}
          onChange={(_, v) => field.onChange(v || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required={required}
              placeholder={placeholder}
              size="small"
              error={Boolean(error)}
              helperText={error?.message}
              sx={LABEL_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
      )}
    />
  );
}

export function VendorAutocompleteField({ control, vendorOptions, onVendorInput }) {
  return (
    <Controller
      name="vendor"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          freeSolo
          options={vendorOptions.map((v) => v.name)}
          inputValue={field.value}
          onInputChange={(_, v) => onVendorInput(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vendor Name"
              required
              placeholder="Type to search vendors..."
              size="small"
              error={Boolean(error)}
              helperText={error?.message || 'Type to search vendors or add new one'}
              sx={LABEL_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
      )}
    />
  );
}

function balanceHelperText(balance, advance) {
  if (balance < 0 && advance) return 'Advance credit (Total Outstanding − Payment)';
  if (balance < 0) return 'Exceeds Total Outstanding Amount';
  return 'Remaining balance (Total Outstanding − Payment)';
}

export function AmountFlowSection({ control, totalOutstanding, amount, payAgainst }) {
  const hasInputs = totalOutstanding !== '' || amount !== '';
  const balance = computeBalanceAmount(totalOutstanding, amount);
  const advance = isAdvancePayment(payAgainst);
  const exceedsNonAdvance = !advance && balance < 0 && hasInputs;

  return (
    <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Amount Summary (Total Outstanding → Payment → Balance)
      </Typography>
      <Box sx={MONEY_GRID_SX}>
        <FormTextField
          control={control}
          name="totalOutstanding"
          label="Total Outstanding Amount (₹)"
          extra={{
            type: 'number',
            required: true,
            placeholder: '0',
            helperText: advance ? 'Enter 0 if Advance with no prior outstanding' : undefined,
            slotProps: { inputLabel: { shrink: true }, htmlInput: { min: 0, step: 'any' } },
          }}
        />
        <FormTextField
          control={control}
          name="amount"
          label="Payment Amount (₹)"
          extra={{
            type: 'number',
            required: true,
            placeholder: 'Enter amount',
            slotProps: { inputLabel: { shrink: true }, htmlInput: { min: 0, step: 'any' } },
          }}
        />
        <TextField
          label="Balance Amount (₹)"
          size="small"
          fullWidth
          value={hasInputs ? formatInr(balance) : '₹0'}
          disabled
          error={exceedsNonAdvance}
          helperText={balanceHelperText(balance, advance)}
          sx={LABEL_SX}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
    </Box>
  );
}
