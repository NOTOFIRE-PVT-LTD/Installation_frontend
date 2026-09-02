import { useCallback, useEffect, useRef, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCameraOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { itemMasterApi } from '../../api/itemMasterApi';
import { CATALOG_FIELDS, OTHER, newNameField } from './itemMasterFields';
import { ITEM_MASTER_CATALOG_KINDS } from '../../utils/constants';

const numeric = (message) =>
  yup
    .number()
    .transform((value, original) => (String(original ?? '').trim() === '' ? null : value))
    .nullable()
    .typeError(message);

const schema = yup.object({
  itemNameSelect: yup.string().nullable(),
  newItemName: yup.string().nullable(),
  personAsked: yup.string().nullable(),
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
    itemNameSelect: '',
    newItemName: '',
    personAsked: '',
    itemName: '',
    itemDescription: '',
    quantity: '',
    price: '',
  };
}

function itemNameText(item) {
  if (!item?.itemName) return '';
  if (typeof item.itemName === 'string') return item.itemName.trim();
  return String(item.itemName.name || '').trim();
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
    itemNameSelect: '',
    newItemName: '',
    personAsked: item.personAsked || '',
    itemName: itemNameText(item),
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

function CatalogSelect({ field, options, readOnly, adding, onAdd, onRemove }) {
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
        onRemoveOption={readOnly ? undefined : onRemove}
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
          ...options.map((opt) => ({ value: opt._id, label: opt.name, removable: true })),
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

function ImagePicker({ label, value, onChange, readOnly }) {
  const cameraRef = useRef(null);

  const pick = (event) => {
    const file = event.target.files?.[0];
    if (file) onChange({ file, url: URL.createObjectURL(file), name: file.name });
    event.target.value = '';
  };

  return (
    <Box>
      <FieldLabel>{label}</FieldLabel>
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
            alt={value.name || label}
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
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCameraIcon />}
            onClick={() => cameraRef.current?.click()}
          >
            Take Photo
          </Button>
        )
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
    </Box>
  );
}

function ItemNameField({ nameOptions, readOnly, mode, adding, onAddName }) {
  const itemNameSelect = useWatch({ name: 'itemNameSelect' });

  if (mode !== 'create') {
    return (
      <Stack>
        <FieldLabel required>Item Name</FieldLabel>
        <RHFTextField name="itemName" size="small" placeholder="e.g. Cordless Drill" disabled={readOnly} />
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <FieldLabel required>Item Name</FieldLabel>
      <RHFSelect
        name="itemNameSelect"
        size="small"
        disabled={readOnly}
        searchable={nameOptions.length > 8}
        searchPlaceholder="Search item names"
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            if (!selected) return <span style={{ color: '#9e9e9e' }}>Select existing item name…</span>;
            if (selected === OTHER) return 'Others (add new name)';
            return selected;
          },
        }}
        options={[
          { value: '', label: 'Select existing item name…' },
          ...nameOptions.map((name) => ({ value: name, label: name })),
          { value: OTHER, label: 'Others (add new name)' },
        ]}
      />
      {itemNameSelect === OTHER && (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <RHFTextField name="newItemName" size="small" label="New Item Name" />
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
            onClick={onAddName}
            disabled={adding}
          >
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </Stack>
      )}
      <RHFTextField name="itemName" size="small" placeholder="e.g. Cordless Drill" disabled={readOnly} />
      {itemNameSelect && itemNameSelect !== OTHER && (
        <Typography variant="caption" color="text.secondary">
          Details prefilled from the selected item. You can edit any field before saving.
        </Typography>
      )}
    </Stack>
  );
}

function CurrentLocationField({ location, loading, error, onRefresh, readOnly }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <MyLocationIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            Current Location
          </Typography>
        </Stack>
        {!readOnly && (
          <IconButton size="small" onClick={onRefresh} disabled={loading} title="Refresh location">
            {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        )}
      </Stack>
      {loading && location.latitude == null ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Acquiring GPS fix…
          </Typography>
        </Stack>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : location.latitude != null ? (
        <Stack spacing={0.75}>
          <Typography variant="body2">
            Lat: {location.latitude.toFixed(6)} · Lng: {location.longitude.toFixed(6)}
            {location.accuracy != null && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ±{location.accuracy} m
              </Typography>
            )}
          </Typography>
          {location.address && (
            <Typography variant="body2" color="text.secondary">
              {location.address}
            </Typography>
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Location unavailable. Enable location access in your browser/device settings.
        </Typography>
      )}
    </Box>
  );
}

export default function MasterItemDialog({ open, mode = 'create', item, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: emptyValues() });

  const [catalog, setCatalog] = useState({});
  const [adding, setAdding] = useState('');
  const [image, setImage] = useState(null);
  const [billPhoto, setBillPhoto] = useState(null);
  const [visitingCard, setVisitingCard] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null, address: '', accuracy: null });
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [existingItems, setExistingItems] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const prevItemNameRef = useRef('');

  const itemNameSelect = useWatch({ control: methods.control, name: 'itemNameSelect' });

  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy <= 50) navigator.geolocation.clearWatch(watchId);
        let address = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const json = await res.json();
          address = json.display_name || '';
        } catch {
          // reverse geocoding failed
        }
        setCurrentLocation({ latitude, longitude, address, accuracy: Math.round(accuracy) });
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please enable it in browser/device settings.'
            : 'Unable to retrieve location. Try refreshing.'
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    setTimeout(() => navigator.geolocation.clearWatch(watchId), 20000);
  }, []);

  const applyTemplate = useCallback(
    (template, selectedName) => {
      if (!template) return;
      const mapped = mapItemToForm(template);
      methods.reset({
        ...mapped,
        itemNameSelect: selectedName,
        itemName: selectedName,
      });
      const displayName = itemNameText(template);
      setImage(template.image?.url ? { url: template.image.url, name: displayName } : null);
      if (mode === 'create') {
        setBillPhoto(null);
        setVisitingCard(null);
        fetchCurrentLocation();
      } else {
        setBillPhoto(template.billPhoto?.url ? { url: template.billPhoto.url, name: 'Bill Photo' } : null);
        setVisitingCard(
          template.visitingCard?.url ? { url: template.visitingCard.url, name: 'Visiting Card' } : null
        );
        if (template.location?.latitude != null) {
          setCurrentLocation({
            latitude: template.location.latitude,
            longitude: template.location.longitude,
            address: template.location.address || '',
            accuracy: null,
          });
          setLocationLoading(false);
          setLocationError('');
        }
      }
    },
    [methods, mode, fetchCurrentLocation]
  );

  useEffect(() => {
    if (!open || mode !== 'create') return;
    if (itemNameSelect === prevItemNameRef.current) return;
    prevItemNameRef.current = itemNameSelect;
    if (!itemNameSelect || itemNameSelect === OTHER) return;
    methods.setValue('itemName', itemNameSelect, { shouldValidate: true });
    const template = existingItems.find((entry) => itemNameText(entry) === itemNameSelect);
    if (template) applyTemplate(template, itemNameSelect);
  }, [itemNameSelect, existingItems, open, mode, applyTemplate, methods]);

  useEffect(() => {
    if (!open) return;
    prevItemNameRef.current = '';
    methods.reset(mapItemToForm(item));
    setImage(item?.image?.url ? { url: item.image.url, name: itemNameText(item) } : null);
    setBillPhoto(item?.billPhoto?.url ? { url: item.billPhoto.url, name: 'Bill Photo' } : null);
    setVisitingCard(item?.visitingCard?.url ? { url: item.visitingCard.url, name: 'Visiting Card' } : null);
    if (item?.location?.latitude != null) {
      setCurrentLocation({
        latitude: item.location.latitude,
        longitude: item.location.longitude,
        address: item.location.address || '',
        accuracy: null,
      });
      setLocationLoading(false);
      setLocationError('');
    } else {
      fetchCurrentLocation();
    }
    Promise.all([
      ...CATALOG_FIELDS.map((field) =>
        itemMasterApi
          .listCatalog({ kind: field.name })
          .then((res) => [field.name, res.data?.data || []])
          .catch(() => [field.name, []])
      ),
      itemMasterApi
        .listCatalog({ kind: ITEM_MASTER_CATALOG_KINDS.ITEM_NAME })
        .then((res) => ['__itemNames__', res.data?.data || []])
        .catch(() => ['__itemNames__', []]),
      itemMasterApi
        .listItems({ pageSize: 500, isActive: 'true' })
        .then((res) => ['__items__', res.data?.data || []])
        .catch(() => ['__items__', []]),
    ]).then((entries) => {
      const map = Object.fromEntries(
        entries.filter(([key]) => key !== '__items__' && key !== '__itemNames__')
      );
      const loadedItems = entries.find(([key]) => key === '__items__')?.[1] || [];
      const catalogNames = entries.find(([key]) => key === '__itemNames__')?.[1] || [];
      const names = new Set();
      catalogNames.forEach((entry) => {
        if (entry?.name) names.add(entry.name);
      });
      loadedItems.forEach((entry) => {
        const name = itemNameText(entry);
        if (name) names.add(name);
      });
      setCatalog(map);
      setExistingItems(loadedItems);
      setNameOptions([...names].sort((a, b) => a.localeCompare(b)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const addItemName = async () => {
    const name = String(methods.getValues('newItemName') || '').trim();
    if (!name) {
      methods.setError('newItemName', { type: 'required', message: 'Enter a name first' });
      return;
    }
    setAdding('itemName');
    try {
      await itemMasterApi.createCatalog({ kind: ITEM_MASTER_CATALOG_KINDS.ITEM_NAME, name });
      setNameOptions((prev) => [...new Set([...prev, name])].sort((a, b) => a.localeCompare(b)));
      methods.setValue('itemNameSelect', name, { shouldValidate: true });
      methods.setValue('itemName', name, { shouldValidate: true });
      methods.setValue('newItemName', '');
      prevItemNameRef.current = name;
    } catch (err) {
      methods.setError('newItemName', {
        type: 'server',
        message: err.response?.data?.message || 'Failed to add',
      });
    } finally {
      setAdding('');
    }
  };

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

  const handleRemoveCatalog = async () => {
    if (!confirmRemove) return;
    const { field, option } = confirmRemove;
    setRemoving(true);
    try {
      await itemMasterApi.removeCatalog(option.value);
      setCatalog((prev) => ({
        ...prev,
        [field.name]: (prev[field.name] || []).filter((entry) => entry._id !== option.value),
      }));
      if (methods.getValues(field.name) === option.value) {
        methods.setValue(field.name, '', { shouldValidate: true });
      }
      setConfirmRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  const submit = (values) => {
    const formData = new FormData();
    formData.append('personAsked', String(values.personAsked ?? '').trim());
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
    if (billPhoto?.file) formData.append('billPhoto', billPhoto.file);
    if (visitingCard?.file) formData.append('visitingCard', visitingCard.file);
    if (currentLocation.latitude != null) {
      formData.append('location', JSON.stringify(currentLocation));
    }
    if (mode === 'edit' && item?.image?.url && !image) formData.append('removeImage', 'true');
    if (mode === 'edit' && item?.billPhoto?.url && !billPhoto) formData.append('removeBillPhoto', 'true');
    if (mode === 'edit' && item?.visitingCard?.url && !visitingCard) formData.append('removeVisitingCard', 'true');
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
      onRemove={(option) => setConfirmRemove({ field: field(name), option })}
    />
  );

  const titleMap = { create: 'New Master Item', edit: 'Edit Master Item', view: 'Master Item Details' };

  return (
    <>
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
                {renderCatalog('endUse')}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FieldLabel>Requested By</FieldLabel>
                <RHFTextField name="personAsked" size="small" placeholder="e.g. Ramesh Kumar" disabled={readOnly} />
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderCatalog('priceGuarantee')}
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderCatalog('itemCategory')}
              </Grid>
              <Grid item xs={12} sm={6}>
                <ItemNameField
                  nameOptions={nameOptions}
                  readOnly={readOnly}
                  mode={mode}
                  adding={adding === 'itemName'}
                  onAddName={addItemName}
                />
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
                <CurrentLocationField
                  location={currentLocation}
                  loading={locationLoading}
                  error={locationError}
                  onRefresh={fetchCurrentLocation}
                  readOnly={readOnly}
                />
              </Grid>

              <Grid item xs={12}>
                <ImagePicker label="Item Image" value={image} onChange={setImage} readOnly={readOnly} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ImagePicker label="Bill Photo" value={billPhoto} onChange={setBillPhoto} readOnly={readOnly} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ImagePicker label="Visiting Card" value={visitingCard} onChange={setVisitingCard} readOnly={readOnly} />
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
      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title={`Remove ${confirmRemove?.field?.label || 'option'}`}
        message={`Remove "${confirmRemove?.option?.label}" from ${confirmRemove?.field?.label}? It will also be cleared on items that used it.`}
        confirmLabel="Remove"
        confirmColor="error"
        loading={removing}
        onConfirm={handleRemoveCatalog}
        onClose={() => {
          if (!removing) setConfirmRemove(null);
        }}
      />
    </>
  );
}
