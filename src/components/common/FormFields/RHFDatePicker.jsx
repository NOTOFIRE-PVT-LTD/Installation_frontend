import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DISPLAY_FORMAT = 'DD/MM/YYYY';

export default function RHFDatePicker({ name, label, size = 'small', ...rest }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...rest}
          label={label}
          format={DISPLAY_FORMAT}
          value={field.value ? dayjs(field.value) : null}
          onChange={(value) => field.onChange(value ? value.format('YYYY-MM-DD') : null)}
          slotProps={{
            textField: {
              fullWidth: true,
              size,
              placeholder: 'dd/mm/yyyy',
              error: Boolean(error),
              helperText: error?.message,
              sx: {
                '& .MuiInputBase-root': { fontSize: '0.8125rem' },
                '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
              },
            },
          }}
        />
      )}
    />
  );
}
