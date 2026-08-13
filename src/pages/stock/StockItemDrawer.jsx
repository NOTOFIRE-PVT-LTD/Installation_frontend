import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { stockApi } from '../../api/stockApi';
import { STOCK_CATALOG_KINDS, STOCK_ITEM_TYPES, STOCK_OTHER_VALUE } from '../../utils/constants';

const OTHER = STOCK_OTHER_VALUE;

const schema = yup.object({
  category: yup.string().required('Component category is required'),
  newCategory: yup.string().when('category', {
    is: OTHER,
    then: (s) => s.trim().required('Enter a new category'),
    otherwise: (s) => s.nullable(),
  }),
  component: yup.string().required('Component name is required'),
  newComponent: yup.string().when('component', {
    is: OTHER,
    then: (s) => s.trim().required('Enter a new component'),
    otherwise: (s) => s.nullable(),
  }),
  subComponent: yup.string().required('Sub component name is required'),
  newSubComponent: yup.string().when('subComponent', {
    is: OTHER,
    then: (s) => s.trim().required('Enter a new sub component'),
    otherwise: (s) => s.nullable(),
  }),
  itemType: yup.string().oneOf(STOCK_ITEM_TYPES).required('Type is required'),
});

function mapItemToForm(item) {
  if (!item) {
    return {
      category: '',
      newCategory: '',
      component: '',
      newComponent: '',
      subComponent: '',
      newSubComponent: '',
      itemType: STOCK_ITEM_TYPES[0],
    };
  }
  return {
    category: item.category?._id || item.category || '',
    newCategory: '',
    component: item.component?._id || item.component || '',
    newComponent: '',
    subComponent: item.subComponent?._id || item.subComponent || '',
    newSubComponent: '',
    itemType: STOCK_ITEM_TYPES.includes(item.itemType) ? item.itemType : STOCK_ITEM_TYPES[0],
  };
}

function upsertOption(list, created) {
  if (list.some((item) => item._id === created._id)) return list;
  return [...list, created];
}

function CatalogField({
  name,
  otherName,
  label,
  placeholder,
  options,
  disabled,
  readOnly,
  onAdd,
  adding,
}) {
  const value = useWatch({ name });
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      <RHFSelect
        name={name}
        size="small"
        disabled={disabled || readOnly}
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            if (!selected) return <span style={{ color: '#9e9e9e' }}>{placeholder}</span>;
            const match = (options || []).find((opt) => opt._id === selected);
            if (selected === OTHER) return 'Others';
            return match?.name || placeholder;
          },
        }}
        options={[
          { value: '', label: placeholder },
          ...(options || []).map((opt) => ({ value: opt._id, label: opt.name })),
          { value: OTHER, label: 'Others' },
        ]}
      />
      {value === OTHER && !readOnly && (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <RHFTextField name={otherName} label={`New ${label}`} />
          </Box>
          <Button variant="outlined" sx={{ mt: 0.5, whiteSpace: 'nowrap' }} onClick={onAdd} disabled={adding}>
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

export default function StockItemDrawer({ open, mode = 'create', item, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapItemToForm(null),
  });

  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState([]);
  const [subComponents, setSubComponents] = useState([]);
  const [adding, setAdding] = useState('');
  const prevComponent = useRef('');

  const component = useWatch({ control: methods.control, name: 'component' });

  useEffect(() => {
    if (!open) return;
    const form = mapItemToForm(item);
    prevComponent.current = form.component;
    methods.reset(form);
    stockApi
      .listCatalog({ kind: STOCK_CATALOG_KINDS.CATEGORY })
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
    stockApi
      .listCatalog({ kind: STOCK_CATALOG_KINDS.COMPONENT })
      .then((res) => setComponents(res.data?.data || []))
      .catch(() => setComponents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    if (prevComponent.current !== component) {
      prevComponent.current = component;
      methods.setValue('subComponent', '');
      methods.setValue('newSubComponent', '');
    }
    if (!component || component === OTHER) {
      setSubComponents([]);
      return;
    }
    stockApi
      .listCatalog({ kind: STOCK_CATALOG_KINDS.SUB_COMPONENT, parent: component })
      .then((res) => setSubComponents(res.data?.data || []))
      .catch(() => setSubComponents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, component]);

  const addCatalog = async (kind, nameField, selectField, parent, onCreated) => {
    const name = String(methods.getValues(nameField) || '').trim();
    if (!name) {
      methods.setError(nameField, { type: 'required', message: 'Enter a name first' });
      return;
    }
    setAdding(kind);
    try {
      const { data } = await stockApi.createCatalog({ kind, name, parent: parent || undefined });
      const created = data.data;
      onCreated(created);
      methods.setValue(selectField, created._id, { shouldValidate: true });
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

  const titleMap = { create: 'Add New Stock Item', edit: 'Edit Stock Item', view: 'Stock Item Details' };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 520 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {titleMap[mode]}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack
              component="form"
              id="stock-item-form"
              spacing={2.25}
              onSubmit={methods.handleSubmit((values) => {
                const formData = new FormData();
                formData.append('category', values.category);
                formData.append('component', values.component);
                formData.append('subComponent', values.subComponent);
                if (values.category === OTHER) formData.append('newCategory', String(values.newCategory || '').trim());
                if (values.component === OTHER) formData.append('newComponent', String(values.newComponent || '').trim());
                if (values.subComponent === OTHER) {
                  formData.append('newSubComponent', String(values.newSubComponent || '').trim());
                }
                formData.append('itemType', values.itemType);
                onSubmit(formData);
              })}
            >
              <CatalogField
                name="category"
                otherName="newCategory"
                label="Component Category"
                placeholder="Select category"
                options={categories}
                readOnly={readOnly}
                adding={adding === STOCK_CATALOG_KINDS.CATEGORY}
                onAdd={() =>
                  addCatalog(STOCK_CATALOG_KINDS.CATEGORY, 'newCategory', 'category', null, (created) => {
                    setCategories((prev) => upsertOption(prev, created));
                  })
                }
              />

              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <CatalogField
                    name="component"
                    otherName="newComponent"
                    label="Component Name"
                    placeholder="Select component"
                    options={components}
                    readOnly={readOnly}
                    adding={adding === STOCK_CATALOG_KINDS.COMPONENT}
                    onAdd={() =>
                      addCatalog(STOCK_CATALOG_KINDS.COMPONENT, 'newComponent', 'component', null, (created) => {
                        setComponents((prev) => upsertOption(prev, created));
                      })
                    }
                  />
                  <CatalogField
                    name="subComponent"
                    otherName="newSubComponent"
                    label="Sub Component Name"
                    placeholder={component && component !== OTHER ? 'Select sub component' : 'Select a component first'}
                    options={subComponents}
                    disabled={!component || component === OTHER}
                    readOnly={readOnly}
                    adding={adding === STOCK_CATALOG_KINDS.SUB_COMPONENT}
                    onAdd={() =>
                      addCatalog(
                        STOCK_CATALOG_KINDS.SUB_COMPONENT,
                        'newSubComponent',
                        'subComponent',
                        component,
                        (created) => {
                          setSubComponents((prev) => upsertOption(prev, created));
                        }
                      )
                    }
                  />
                </Stack>
              </Box>

              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Stack spacing={0.75}>
                    <Typography variant="body2" fontWeight={600}>
                      Type
                    </Typography>
                    <RHFSelect
                      name="itemType"
                      size="small"
                      disabled={readOnly}
                      options={STOCK_ITEM_TYPES.map((type) => ({ value: type, label: type }))}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </FormProvider>
        </Box>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="stock-item-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
