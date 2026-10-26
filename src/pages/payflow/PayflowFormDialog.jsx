import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

function buildSchema(fields) {
  const shape = {};
  fields.forEach((f) => {
    let rule = yup.string().trim();
    if (f.required) rule = rule.required(`${f.label} is required`);
    if (f.pattern) rule = rule.matches(f.pattern, { message: f.patternMessage, excludeEmptyString: true });
    shape[f.name] = rule;
  });
  return yup.object(shape);
}

export default function PayflowFormDialog({ open, mode = 'create', tab, entry, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const fields = tab.fields;
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const emptyValues = useMemo(() => Object.fromEntries(fields.map((f) => [f.name, ''])), [fields]);

  const { control, handleSubmit, reset } = useForm({ resolver: yupResolver(schema), defaultValues: emptyValues });

  useEffect(() => {
    if (open) {
      reset(Object.fromEntries(fields.map((f) => [f.name, entry?.[f.name] || ''])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry, tab.resource]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>
          {isEdit ? `Edit ${tab.singular}` : `Add ${tab.singular}`}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          {tab.singular} Information
        </Typography>
        <Stack spacing={2.5}>
          {fields.map((f, index) => (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(f.uppercase ? e.target.value.toUpperCase() : e.target.value)}
                  label={f.label}
                  placeholder={f.placeholder}
                  size="small"
                  fullWidth
                  autoFocus={index === 0}
                  slotProps={{ htmlInput: f.maxLength ? { maxLength: f.maxLength } : undefined }}
                  error={Boolean(error)}
                  helperText={error?.message || f.helper}
                />
              )}
            />
          ))}
        </Stack>
      </Box>
      <Divider />
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : `Add ${tab.singular}`}
        </Button>
      </Stack>
    </Drawer>
  );
}
