import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { payflowApi } from '../../api/payflowApi';
import { ITEM_TYPE_OPTIONS, PAY_AGAINST_OPTIONS, PAYMENT_MODE_OPTIONS, PRIORITY_OPTIONS } from './payflowRequestConfig';

const num = (label) =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .typeError(`${label} must be a number`)
    .min(0, `${label} cannot be negative`);

const schema = yup.object({
  company: yup.string().required('Company is required'),
  branch: yup.string().required('Branch is required'),
  vendor: yup.string().required('Vendor is required'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string(),
  itemType: yup.string(),
  description: yup.string(),
  billNumber: yup.string(),
  billDate: yup.string(),
  totalOutstanding: num('Total outstanding'),
  amount: num('Amount').required('Amount is required'),
  payAgainst: yup.string(),
  bankName: yup.string(),
  paymentMode: yup.string(),
  priority: yup.string(),
  priceCheckName: yup.string(),
  priceCheckEmail: yup.string().email('Enter a valid email'),
});

const EMPTY = {
  company: '', branch: '', vendor: '', category: '', subcategory: '', itemType: '', description: '',
  billNumber: '', billDate: '', totalOutstanding: '', amount: '', payAgainst: '', bankName: '',
  paymentMode: '', priority: 'Medium', priceCheckName: '', priceCheckEmail: '',
};

const MASTERS = [
  ['vendors', 'vendor'],
  ['categories', 'category'],
  ['subcategories', 'subcategory'],
  ['companies', 'company'],
  ['branches', 'branch'],
];

export default function PayflowRequestFormDrawer({ open, submitting, onClose, onSubmit }) {
  const [options, setOptions] = useState({});
  const { control, handleSubmit, reset } = useForm({ resolver: yupResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(EMPTY);
    MASTERS.forEach(async ([resource, key]) => {
      try {
        const { data } = await payflowApi.list(resource, { pageSize: 100 });
        setOptions((prev) => ({ ...prev, [key]: data.data.map((d) => d.name) }));
      } catch {
        // master lists are a convenience; the field still accepts typed values
      }
    });
  }, [open, reset]);

  const text = (name, label, extra = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField {...field} label={label} size="small" fullWidth error={Boolean(error)} helperText={error?.message} {...extra} />
      )}
    />
  );

  const select = (name, label, items) =>
    text(name, label, {
      select: true,
      children: [<MenuItem key="none" value="">—</MenuItem>, ...items.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)],
    });

  const combo = (name, label) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          freeSolo
          options={options[name] || []}
          value={field.value}
          onChange={(_, v) => field.onChange(v || '')}
          onInputChange={(_, v) => field.onChange(v)}
          renderInput={(params) => <TextField {...params} label={label} size="small" error={Boolean(error)} helperText={error?.message} />}
        />
      )}
    />
  );

  const submit = handleSubmit((v) =>
    onSubmit({
      ...v,
      billDate: v.billDate || undefined,
      priceCheckBy: v.priceCheckName ? { name: v.priceCheckName, email: v.priceCheckEmail } : undefined,
    })
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, display: 'flex', flexDirection: 'column' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>
          New Payment Request
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Request Information</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            {combo('company', 'Company')}
            {combo('branch', 'Branch')}
          </Box>
          {combo('vendor', 'Vendor')}
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            {combo('category', 'Category')}
            {combo('subcategory', 'Subcategory')}
          </Box>
          {select('itemType', 'Item Type', ITEM_TYPE_OPTIONS)}
          {text('description', 'Item Description', { multiline: true, minRows: 2 })}

          <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 1 }}>Bill & Payment</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            {text('billNumber', 'Bill Number')}
            {text('billDate', 'Bill Date', { type: 'date', slotProps: { inputLabel: { shrink: true } } })}
            {text('totalOutstanding', 'Total Outstanding (₹)', { type: 'number' })}
            {text('amount', 'Payment Amount (₹)', { type: 'number' })}
            {select('payAgainst', 'Pay Against', PAY_AGAINST_OPTIONS)}
            {select('paymentMode', 'Payment Mode', PAYMENT_MODE_OPTIONS)}
            {text('bankName', 'Bank Name')}
            {select('priority', 'Priority', PRIORITY_OPTIONS)}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 1 }}>Price Check Guaranteed By</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            {text('priceCheckName', 'Name')}
            {text('priceCheckEmail', 'Email')}
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Create Request'}
        </Button>
      </Stack>
    </Drawer>
  );
}
