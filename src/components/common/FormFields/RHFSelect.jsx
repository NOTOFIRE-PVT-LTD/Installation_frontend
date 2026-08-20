import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function RHFSelect({
  name,
  label,
  options,
  helperText,
  searchable = false,
  searchPlaceholder = 'Search…',
  onRemoveOption,
  ...rest
}) {
  const { control } = useFormContext();
  const [query, setQuery] = useState('');
  const { SelectProps, ...textFieldProps } = rest;
  const term = query.trim().toLowerCase();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Keep the selected option mounted even while filtering, otherwise MUI
        // reports an out-of-range value and clears the displayed label.
        const visibleOptions =
          searchable && term
            ? options.filter(
                (opt) =>
                  String(opt.label ?? '').toLowerCase().includes(term) || opt.value === field.value
              )
            : options;

        return (
          <TextField
            {...field}
            {...textFieldProps}
            select
            {...(label ? { label } : {})}
            fullWidth
            error={Boolean(error)}
            helperText={error?.message || helperText}
            SelectProps={{
              ...SelectProps,
              ...(searchable || onRemoveOption
                ? {
                    onClose: (event) => {
                      setQuery('');
                      SelectProps?.onClose?.(event);
                    },
                    MenuProps: {
                      autoFocus: false,
                      PaperProps: { sx: { maxHeight: 340 } },
                      ...SelectProps?.MenuProps,
                    },
                  }
                : {}),
            }}
          >
            {searchable && (
              <ListSubheader sx={{ p: 1, bgcolor: 'background.paper' }}>
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    // Stop the Select's type-ahead from stealing focus while typing.
                    if (event.key !== 'Escape') event.stopPropagation();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </ListSubheader>
            )}
            {visibleOptions.map((opt) => (
              <MenuItem
                key={String(opt.value)}
                value={opt.value}
                sx={{
                  color: opt.value === '' ? 'text.secondary' : undefined,
                  ...(opt.removable ? { pr: 0.5 } : {}),
                }}
              >
                {opt.removable && onRemoveOption ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ width: '100%' }}
                  >
                    <span>{opt.label}</span>
                    <IconButton
                      size="small"
                      aria-label={`Remove ${opt.label}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onRemoveOption(opt);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  opt.label
                )}
              </MenuItem>
            ))}
            {searchable && visibleOptions.length === 0 && (
              <MenuItem disabled value="">
                No matches
              </MenuItem>
            )}
          </TextField>
        );
      }}
    />
  );
}
