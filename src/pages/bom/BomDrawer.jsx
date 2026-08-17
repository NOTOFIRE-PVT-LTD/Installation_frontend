import { useEffect } from 'react';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
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
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchStockItemOptions } from '../../features/stockItems/stockItemsThunks';

const componentSchema = yup.object({
  stockItem: yup.string().required('Item is required'),
  qtyPerPcs: yup
    .number()
    .typeError('Must be a number')
    .moreThan(0, 'Qty for 1 PCS must be greater than 0')
    .required('Qty for 1 PCS is required'),
});

const schema = yup.object({
  name: yup.string().trim().required('BOM name is required'),
  finishedItem: yup.string().nullable(),
  version: yup.string().trim().required('Version is required'),
  effectiveDate: yup.string().nullable(),
  remarks: yup.string().trim().nullable(),
  isActive: yup.string().oneOf(['true', 'false']).required(),
  components: yup.array().of(componentSchema).min(1, 'Add at least one component'),
});

function emptyComponent() {
  return {
    stockItem: '',
    qtyPerPcs: '',
  };
}

function mapBomToForm(bom) {
  if (!bom) {
    return {
      name: '',
      finishedItem: '',
      version: '1.0',
      effectiveDate: new Date().toISOString().slice(0, 10),
      remarks: '',
      isActive: 'true',
      components: [emptyComponent()],
    };
  }
  return {
    name: bom.name || '',
    finishedItem: bom.finishedItem?._id || bom.finishedItem || '',
    version: bom.version || '1.0',
    effectiveDate: bom.effectiveDate ? String(bom.effectiveDate).slice(0, 10) : '',
    remarks: bom.remarks || '',
    isActive: bom.isActive !== false ? 'true' : 'false',
    components:
      bom.components?.length > 0
        ? bom.components.map((c) => ({
            stockItem: c.stockItem?._id || c.stockItem || '',
            qtyPerPcs: c.qtyPerPcs ?? '',
          }))
        : [emptyComponent()],
  };
}

function itemLabel(item) {
  return (
    [item.categoryName, item.componentName, item.subComponentName || item.name].filter(Boolean).join(' / ') ||
    item.name
  );
}

export default function BomDrawer({ open, mode = 'create', bom, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const dispatch = useAppDispatch();
  const { options: itemOptions } = useAppSelector((state) => state.stockItems);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapBomToForm(null),
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'components',
  });

  useEffect(() => {
    if (!open) return;
    dispatch(fetchStockItemOptions());
    methods.reset(mapBomToForm(bom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bom, mode]);

  const titleMap = { create: 'Create BOM', edit: 'Edit BOM', view: 'View BOM' };
  const itemOpts = (itemOptions || []).map((item) => ({
    value: item._id,
    label: itemLabel(item),
  }));

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 720 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              id="bom-form"
              spacing={2.25}
              onSubmit={methods.handleSubmit((values) =>
                onSubmit({
                  name: String(values.name || '').trim(),
                  finishedItem: values.finishedItem || null,
                  version: String(values.version || '1.0').trim(),
                  effectiveDate: values.effectiveDate || null,
                  remarks: String(values.remarks || '').trim(),
                  isActive: values.isActive === true || values.isActive === 'true',
                  components: (values.components || [])
                    .filter((c) => c.stockItem)
                    .map((c) => ({
                      stockItem: c.stockItem,
                      qtyPerPcs: Number(c.qtyPerPcs),
                    })),
                })
              )}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="name" label="BOM Name" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFSelect
                    name="finishedItem"
                    label="Finished Item"
                    disabled={readOnly}
                    searchable
                    searchPlaceholder="Search item"
                    options={[{ value: '', label: 'Select finished item' }, ...itemOpts]}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <RHFTextField name="version" label="Version" disabled={readOnly} required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <RHFDatePicker name="effectiveDate" label="Effective Date" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <RHFSelect
                    name="isActive"
                    label="Status"
                    disabled={readOnly}
                    options={[
                      { value: 'true', label: 'Active' },
                      { value: 'false', label: 'Inactive' },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <RHFTextField name="remarks" label="Remarks" disabled={readOnly} multiline minRows={2} />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Components (Qty for 1 PCS)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    BOM recipe only — does not change warehouse stock.
                  </Typography>
                </Box>
                {!readOnly && (
                  <Button startIcon={<AddIcon />} onClick={() => append(emptyComponent())}>
                    Add Component
                  </Button>
                )}
              </Stack>

              <Stack spacing={1.5}>
                {fields.map((field, index) => (
                  <Paper key={field.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Grid container spacing={1.25} alignItems="flex-start">
                      <Grid item xs={12} sm={readOnly ? 7 : 6}>
                        <RHFSelect
                          name={`components.${index}.stockItem`}
                          label="Item"
                          disabled={readOnly}
                          searchable
                          searchPlaceholder="Search item"
                          options={[{ value: '', label: 'Select item' }, ...itemOpts]}
                        />
                      </Grid>
                      <Grid item xs={readOnly ? 12 : 10} sm={5}>
                        <RHFTextField
                          name={`components.${index}.qtyPerPcs`}
                          label="Qty Required for 1 PCS"
                          type="number"
                          disabled={readOnly}
                          required
                        />
                      </Grid>
                      {!readOnly && (
                        <Grid item xs={2} sm={1}>
                          <IconButton
                            color="error"
                            disabled={fields.length <= 1}
                            onClick={() => remove(index)}
                            sx={{ mt: 1 }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </FormProvider>
        </Box>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="bom-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save BOM'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
