import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import { UnitAutocomplete } from '../../components/common/FormFields/RHFUnitSelect';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import { apiErrorMessage } from './quotationUtils';

const EMPTY = { description: '', modelNo: '', price: 0, category: '', unit: 'Nos', approvals: '' };

function FileField({ label, accept, file, existing, removed, onPick, onRemove }) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Button variant="outlined" size="small" component="label">
          Choose file
          <input hidden type="file" accept={accept} onChange={(event) => onPick(event.target.files?.[0] || null)} />
        </Button>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 260 }}>
          {file ? file.name : existing && !removed ? existing.originalName || 'Current file' : 'No file chosen'}
        </Typography>
        {existing?.url && !removed && !file && (
          <>
            <Link href={existing.url} target="_blank" rel="noopener" variant="body2">
              View
            </Link>
            <Button size="small" color="error" onClick={onRemove}>
              Remove
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default function QuotationProductDialog({ open, product, onClose, onSaved }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [datasheet, setDatasheet] = useState(null);
  const [picture, setPicture] = useState(null);
  const [removeDatasheet, setRemoveDatasheet] = useState(false);
  const [removePicture, setRemovePicture] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY, ...(product || {}) });
    setDatasheet(null);
    setPicture(null);
    setRemoveDatasheet(false);
    setRemovePicture(false);
    quotationApi
      .productCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, [open, product]);

  const set = (name) => (event) => setValues((prev) => ({ ...prev, [name]: event.target.value }));

  const handleSave = async () => {
    if (!String(values.modelNo || '').trim() && !String(values.description || '').trim()) {
      dispatch(showSnackbar({ message: 'Enter a model number or description', severity: 'warning' }));
      return;
    }
    if (Number(values.price) < 0) {
      dispatch(showSnackbar({ message: 'Price cannot be negative', severity: 'warning' }));
      return;
    }
    const formData = new FormData();
    ['description', 'modelNo', 'category', 'unit', 'approvals'].forEach((key) =>
      formData.append(key, String(values[key] ?? '').trim())
    );
    formData.append('price', String(Number(values.price) || 0));
    if (datasheet) formData.append('productDatasheet', datasheet);
    if (picture) formData.append('productPicture', picture);
    if (removeDatasheet) formData.append('removeDatasheet', 'true');
    if (removePicture) formData.append('removePicture', 'true');

    setSaving(true);
    try {
      const { data } = product?._id
        ? await quotationApi.updateProduct(product._id, formData)
        : await quotationApi.createProduct(formData);
      dispatch(showSnackbar({ message: product?._id ? 'Product updated' : 'Product added' }));
      onSaved?.(data.data);
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to save product'), severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>
        {product?._id ? 'Edit Product' : 'Add New Product'}
        <Typography variant="body2" color="text.secondary">
          Enter product details to add to database
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.75} sx={{ pt: 1 }}>
          <TextField label="Description" value={values.description} onChange={set('description')} multiline minRows={3} size="small" fullWidth autoFocus />
          <TextField label="Model Number" value={values.modelNo} onChange={set('modelNo')} size="small" fullWidth />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Price (₹)"
              type="number"
              value={values.price}
              onChange={set('price')}
              size="small"
              fullWidth
              inputProps={{ min: 0, step: '0.01' }}
            />
            <UnitAutocomplete
              value={values.unit}
              onChange={(unit) => setValues((prev) => ({ ...prev, unit }))}
              sx={{ minWidth: 140 }}
            />
          </Stack>
          <Autocomplete
            freeSolo
            options={categories}
            value={values.category || ''}
            onChange={(_event, next) => setValues((prev) => ({ ...prev, category: next || '' }))}
            onInputChange={(_event, next, reason) => {
              if (reason === 'input') setValues((prev) => ({ ...prev, category: next }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Category" placeholder="Select or type a new category" size="small" />
            )}
          />
          <TextField
            label="Approvals"
            value={values.approvals}
            onChange={set('approvals')}
            placeholder="e.g. ISO 9001, CE, FCC"
            size="small"
            fullWidth
          />
          <FileField
            label="Datasheet"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            file={datasheet}
            existing={product?.datasheet}
            removed={removeDatasheet}
            onPick={(file) => {
              setDatasheet(file);
              setRemoveDatasheet(false);
            }}
            onRemove={() => setRemoveDatasheet(true)}
          />
          <FileField
            label="Product Picture"
            accept="image/jpeg,image/png,image/webp"
            file={picture}
            existing={product?.picture}
            removed={removePicture}
            onPick={(file) => {
              setPicture(file);
              setRemovePicture(false);
            }}
            onRemove={() => setRemovePicture(true)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ flex: 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="outlined" onClick={onClose} disabled={saving} sx={{ flex: 1 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
