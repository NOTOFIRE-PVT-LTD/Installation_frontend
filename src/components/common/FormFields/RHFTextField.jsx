import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';

export default function RHFTextField({ name, label, type = 'text', size = 'small', sx, ...rest }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          type={type}
          label={label}
          size={size}
          fullWidth
          error={Boolean(error)}
          helperText={error?.message}
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
