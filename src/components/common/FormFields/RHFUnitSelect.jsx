import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export const BASE_UNITS = ['Nos', 'Metres'];
const CUSTOM_UNITS_KEY = 'notofire.customUnits';
const filter = createFilterOptions();

function readCustomUnits() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_UNITS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === 'string' && u.trim()) : [];
  } catch {
    return [];
  }
}

function saveCustomUnit(unit) {
  const existing = readCustomUnits();
  const all = [...BASE_UNITS, ...existing];
  if (all.some((u) => u.toLowerCase() === unit.toLowerCase())) return;
  localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify([...existing, unit]));
}

function uniqueUnits(units) {
  const seen = new Set();
  return units.filter((unit) => {
    const key = unit.toLowerCase();
    if (!unit || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Unit picker (Nos, Metres + custom units typed by the user) usable outside react-hook-form. */
export function UnitAutocomplete({
  value,
  onChange,
  onBlur,
  label = 'Unit',
  size = 'small',
  disabled,
  error,
  helperText,
  inputRef,
  placeholder = 'Select or type to add',
  sx,
  ...rest
}) {
  const [, refresh] = useState(0);
  const current = String(value || '').trim();
  const options = uniqueUnits([...BASE_UNITS, ...readCustomUnits(), current]).map((unit) => ({
    value: unit,
    label: unit,
  }));
  const selected = current ? options.find((opt) => opt.value === current) : null;

  const commit = (raw) => {
    const unit = String(raw || '').trim();
    if (!unit) return;
    const match = options.find((opt) => opt.value.toLowerCase() === unit.toLowerCase());
    if (match) {
      if (match.value !== current) onChange(match.value);
      return;
    }
    saveCustomUnit(unit);
    onChange(unit);
    refresh((n) => n + 1);
  };

  return (
    <Autocomplete
      {...rest}
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      disableClearable
      disabled={disabled}
      size={size}
      options={options}
      value={selected}
      onOpen={() => refresh((n) => n + 1)}
      onBlur={onBlur}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        const input = params.inputValue.trim();
        if (input && !opts.some((opt) => opt.value.toLowerCase() === input.toLowerCase())) {
          filtered.push({ value: input, label: `Add "${input}"`, isNew: true });
        }
        return filtered;
      }}
      onChange={(_event, next) => {
        if (typeof next === 'string') commit(next);
        else if (next) commit(next.value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          sx={{
            '& .MuiInputBase-root': { fontSize: '0.8125rem' },
            '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
            '& .MuiFormHelperText-root': { fontSize: '0.6875rem', mx: 0 },
            ...sx,
          }}
        />
      )}
    />
  );
}

export default function RHFUnitSelect({ name, label = 'Unit', size = 'small', disabled, sx }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UnitAutocomplete
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          label={label}
          size={size}
          disabled={disabled}
          error={Boolean(error)}
          helperText={error?.message}
          sx={sx}
        />
      )}
    />
  );
}
