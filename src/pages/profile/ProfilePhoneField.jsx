import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useFormContext } from 'react-hook-form';
import RHFTextField from '../../components/common/FormFields/RHFTextField';

/** Add / edit / clear mobile for WhatsApp OTP login. */
export default function ProfilePhoneField() {
  const { watch, setValue } = useFormContext();
  const mobile = String(watch('mobileNumber') || '');

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <RHFTextField
        name="mobileNumber"
        label="Mobile number"
        placeholder="10-digit mobile number"
        inputMode="numeric"
        autoComplete="tel-national"
        sx={{ flex: 1 }}
      />
      {mobile ? (
        <Tooltip title="Delete number">
          <IconButton
            type="button"
            color="error"
            aria-label="Delete mobile number"
            onClick={() =>
              setValue('mobileNumber', '', { shouldDirty: true, shouldValidate: true })
            }
            sx={{ mt: 0.5, flexShrink: 0 }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}
