import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCameraOutlined';
import CollectionsIcon from '@mui/icons-material/CollectionsOutlined';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { itemMasterApi } from '../../api/itemMasterApi';
import { CATALOG_FIELDS, OTHER, newNameField } from './itemMasterFields';

const numeric = (message) =>
  yup
    .number()
    .transform((value, original) => (String(original ?? '').trim() === '' ? null : value))
    .nullable()
    .typeError(message);

const schema = yup.object({
  endUse: yup.string().nullable(),
  personAsked: yup.string().nullable(),
  priceGuarantee: yup.string().nullable(),
  itemCategory: yup.string().required('Item category is required'),
  newItemCategory: yup.string().when('itemCategory', {
    is: OTHER,
    then: (s) => s.trim().required('Enter a new item category'),
    otherwise: (s) => s.nullable(),
  }),
  itemName: yup.string().trim().required('Item name is required'),
  itemDescription: yup.string().nullable(),
  quantity: numeric('Quantity must be a number').min(0, 'Cannot be negative'),
  price: numeric('Price must be a number').min(0, 'Cannot be negative'),
});

function emptyValues() {
  const catalog = CATALOG_FIELDS.reduce((acc, field) => {
    acc[field.name] = '';
    acc[newNameField(field.name)] = '';
    return acc;
  }, {});
  return {
    ...catalog,
    endUse: '',
    personAsked: '',
    priceGuarantee: '',
    itemName: '',
    itemDescription: '',
    quantity: '',
    price: '',
  };
}

function mapItemToForm(item) {
  if (!item) return emptyValues();
  const catalog = CATALOG_FIELDS.reduce((acc, field) => {
    const value = item[field.name];
    acc[field.name] = value?._id || value || '';
    acc[newNameField(field.name)] = '';
    return acc;
  }, {});
  return {
    ...emptyValues(),
    ...catalog,
    endUse: item.endUse || '',
    personAsked: item.personAsked || '',
    priceGuarantee: item.priceGuarantee || '',
    itemName: item.itemName || '',
    itemDescription: item.itemDescription || '',
    quantity: item.quantity ?? '',
    price: item.price ?? '',
  };
}

function FieldLabel({ children, required }) {
  return (
    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
      {children}
      {required && (
        <Typography component="span" color="error.main">
          {' '}
          *
        </Typography>
      )}
    </Typography>
  );
}

function CatalogSelect({ field, options, readOnly, adding, onAdd }) {
  const value = useWatch({ name: field.name });
  const otherName = newNameField(field.name);

  return (
    <Stack>
      <FieldLabel required={field.required}>{field.label}</FieldLabel>
      <RHFSelect
        name={field.name}
        size="small"
        disabled={readOnly}
        searchable={options.length > 8}
        searchPlaceholder={`Search ${field.label.toLowerCase()}`}
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            if (!selected) return <span style={{ color: '#9e9e9e' }}>{field.placeholder}</span>;
            if (selected === OTHER) return 'Others';
            return options.find((opt) => opt._id === selected)?.name || field.placeholder;
          },
        }}
        options={[
          { value: '', label: field.placeholder },
          ...options.map((opt) => ({ value: opt._id, label: opt.name })),
          { value: OTHER, label: 'Others (add new)' },
        ]}
      />
      {value === OTHER && !readOnly && (
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <RHFTextField name={otherName} size="small" label={`New ${field.label}`} />
          </Box>
          <Button variant="outlined" size="small" sx={{ mt: 0.5, whiteSpace: 'nowrap' }} onClick={onAdd} disabled={adding}>
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function TotalAmountField() {
  const quantity = useWatch({ name: 'quantity' });
  const price = useWatch({ name: 'price' });
  const total = (Number(quantity) || 0) * (Number(price) || 0);

  return (
    <Stack>
      <FieldLabel>Total Amount</FieldLabel>
      <TextField
        size="small"
        fullWidth
        value={total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        InputProps={{
          readOnly: true,
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
        }}
        helperText="Quantity × Price"
        sx={{
          '& .MuiInputBase-root': { fontSize: '0.8125rem', bgcolor: 'action.hover', fontWeight: 600 },
          '& .MuiFormHelperText-root': { fontSize: '0.6875rem', mx: 0 },
        }}
      />
    </Stack>
  );
}

function ImagePicker({ value, onChange, readOnly }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const pick = (event) => {
    const file = event.target.files?.[0];
    if (file) onChange({ file, url: URL.createObjectURL(file), name: file.name });
    event.target.value = '';
  };

  return (
    <Box>
      <FieldLabel>Item Image</FieldLabel>
      {value?.url ? (
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            component="img"
            src={value.url}
            alt={value.name || 'Item'}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!readOnly && (
            <IconButton
              size="small"
              onClick={() => onChange(null)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        !readOnly && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => cameraRef.current?.click()}
              sx={{ flex: 1 }}
            >
              Take Photo
            </Button>
            <Button
              variant="outlined"
              startIcon={<CollectionsIcon />}
              onClick={() => galleryRef.current?.click()}
              sx={{ flex: 1 }}
            >
              Choose from Gallery
            </Button>
          </Stack>
        )
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
    </Box>
  );
}

export default function MasterItemDialog({ open, mode = 'create', item, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: emptyValues() });

  const [catalog, setCatalog] = useState({});
  const [adding, setAdding] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!open) return;
    methods.reset(mapItemToForm(item));
    setImage(item?.image?.url ? { url: item.image.url, name: item.itemName } : null);
    Promise.all(
      CATALOG_FIELDS.map((field) =>
        itemMasterApi
          .listCatalog({ kind: field.name })
          .then((res) => [field.name, res.data?.data || []])
          .catch(() => [field.name, []])
      )
    ).then((entries) => setCatalog(Object.fromEntries(entries)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const addCatalogEntry = async (field) => {
    const nameField = newNameField(field.name);
    const name = String(methods.getValues(nameField) || '').trim();
    if (!name) {
      methods.setError(nameField, { type: 'required', message: 'Enter a name first' });
      return;
    }
    setAdding(field.name);
    try {
      const { data } = await itemMasterApi.createCatalog({ kind: field.name, name });
      const created = data.data;
      setCatalog((prev) => {
        const list = prev[field.name] || [];
        if (list.some((entry) => entry._id === created._id)) return prev;
        return { ...prev, [field.name]: [...list, created].sort((a, b) => a.name.localeCompare(b.name)) };
      });
      methods.setValue(field.name, created._id, { shouldValidate: true });
      methods.setValue(nameField, '');
    } catch (err) {
      methods.setError(nameField, {
        type: 'server',
        message: err.response?.data?.message || 'Failed to add',
      });
    } finally {
      setAdding('');
    }
  };

  const submit = (values) => {
    const formData = new FormData();
    formData.append('endUse', String(values.endUse ?? '').trim());
    formData.append('personAsked', String(values.personAsked ?? '').trim());
    formData.append('priceGuarantee', String(values.priceGuarantee ?? '').trim());
    formData.append('itemName', String(values.itemName ?? '').trim());
    formData.append('itemDescription', String(values.itemDescription ?? '').trim());
    formData.append('quantity', values.quantity === null || values.quantity === undefined ? '' : String(values.quantity));
    formData.append('price', values.price === null || values.price === undefined ? '' : String(values.price));
    CATALOG_FIELDS.forEach((field) => {
      formData.append(field.name, values[field.name] || '');
      if (values[field.name] === OTHER) {
        formData.append(newNameField(field.name), String(values[newNameField(field.name)] || '').trim());
      }
    });
    if (image?.file) formData.append('itemImage', image.file);
    if (mode === 'edit' && item?.image?.url && !image) formData.append('removeImage', 'true');
    onSubmit(formData);
  };

  const field = (name) => CATALOG_FIELDS.find((entry) => entry.name === name);

  const renderCatalog = (name) => (
    <CatalogSelect
      field={field(name)}
      options={catalog[name] || []}
      readOnly={readOnly}
      adding={adding === name}
      onAdd={() => addCatalogEntry(field(name))}
    />
  );

  const titleMap = { create: 'New Master Item', edit: 'Edit Master Item', view: 'Master Item Details' };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {titleMap[mode]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New items require approval from the Item Master admin.
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close" size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <FormProvider {...methods}>
          <Box component="form" id="master-item-form" onSubmit={methods.handleSubmit(submit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FieldLabel>End Use In Item or location</FieldLabel>
                <RHFTextField
                  name="endUse"
                  size="small"
                  placeholder="Where or in which item is this used?"
                  disabled={readOnly}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FieldLabel>Name of Person asked</FieldLabel>
                <RHFTextField name="personAsked" size="small" placeholder="e.g. Ramesh Kumar" disabled={readOnly} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel>Price Guarantee</FieldLabel>
                <RHFTextField name="priceGuarantee" size="small" placeholder="e.g. 1 year" disabled={readOnly} />
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderCatalog('itemCategory')}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Item Name</FieldLabel>
                <RHFTextField name="itemName" size="small" placeholder="e.g. Cordless Drill" disabled={readOnly} />
              </Grid>

              <Grid item xs={12}>
                <FieldLabel>Item Description</FieldLabel>
                <RHFTextField
                  name="itemDescription"
                  size="small"
                  multiline
                  minRows={3}
                  placeholder="Describe this item"
                  disabled={readOnly}
                />
              </Grid>

              <Grid item xs={12}>
                <ImagePicker value={image} onChange={setImage} readOnly={readOnly} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FieldLabel>Quantity</FieldLabel>
                <RHFTextField name="quantity" size="small" placeholder="0" disabled={readOnly} />
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderCatalog('qtyType')}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FieldLabel>Price</FieldLabel>
                <RHFTextField name="price" size="small" placeholder="0.00" disabled={readOnly} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TotalAmountField />
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderCatalog('payment')}
              </Grid>
            </Grid>
          </Box>
        </FormProvider>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
        {!readOnly && (
          <Button type="submit" form="master-item-form" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Item'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
