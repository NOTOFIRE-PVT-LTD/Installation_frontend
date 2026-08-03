import { Controller, useFormContext } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

// A single independent boolean checkbox with a label, matching the original form's
// "Details of documents enclosed" checklist style (each item ticked independently).
export default function CheckboxBooleanField({ name, label, disabled }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          onClick={() => !disabled && field.onChange(!field.value)}
          sx={{ cursor: disabled ? 'default' : 'pointer', width: 'fit-content' }}
        >
          {field.value ? (
            <CheckBoxIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" color={disabled ? 'disabled' : 'action'} />
          )}
          <Typography variant="body2">{label}</Typography>
        </Stack>
      )}
    />
  );
}
