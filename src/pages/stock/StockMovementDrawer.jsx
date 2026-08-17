import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchStockItemOptions } from '../../features/stockItems/stockItemsThunks';
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../utils/constants';

function buildSchema(type) {
  const base = {
    stockItem: yup.string().required('Stock item is required'),
    quantity: yup.number().typeError('Must be a number').moreThan(0, 'Quantity must be greater than 0').required(),
    movementDate: yup.string().nullable(),
    referenceNo: yup.string().trim().nullable(),
    remarks: yup.string().trim().nullable(),
  };
  if (type === STOCK_MOVEMENT_TYPES.SUPPLIER_IN) {
    base.supplierName = yup.string().trim().required('Supplier name is required');
    base.amount = yup.number().typeError('Must be a number').min(0, 'Amount must be 0 or greater').required('Amount is required');
  }
  if (type === STOCK_MOVEMENT_TYPES.ISSUE_OUT || type === STOCK_MOVEMENT_TYPES.RETURN_IN) {
    base.issuedTo = yup.string().trim().required('Person name is required');
  }
  return yup.object(base);
}

function defaultValues(movement) {
  if (!movement) {
    return {
      stockItem: '',
      quantity: '',
      amount: '',
      movementDate: new Date().toISOString().slice(0, 10),
      supplierName: '',
      issuedTo: '',
      referenceNo: '',
      remarks: '',
    };
  }
  return {
    stockItem: movement.stockItem?._id || movement.stockItem || '',
    quantity: movement.quantity ?? '',
    amount: movement.amount ?? '',
    movementDate: movement.movementDate ? String(movement.movementDate).slice(0, 10) : '',
    supplierName: movement.supplierName || '',
    issuedTo: movement.issuedTo || '',
    referenceNo: movement.referenceNo || '',
    remarks: movement.remarks || '',
  };
}

const TITLE = {
  [STOCK_MOVEMENT_TYPES.SUPPLIER_IN]: 'Receive from Supplier',
  [STOCK_MOVEMENT_TYPES.ISSUE_OUT]: 'Issue to Person',
  [STOCK_MOVEMENT_TYPES.UTILIZE]: 'Utilize / Consume',
  [STOCK_MOVEMENT_TYPES.RETURN_IN]: 'Return to Warehouse',
};

export default function StockMovementDrawer({ open, type, movement, onClose, onSubmit, submitting }) {
  const dispatch = useAppDispatch();
  const { options: itemOptions } = useAppSelector((state) => state.stockItems);
  const isEdit = Boolean(movement);

  const methods = useForm({
    resolver: yupResolver(buildSchema(type)),
    defaultValues: defaultValues(null),
  });

  useEffect(() => {
    if (!open) return;
    dispatch(fetchStockItemOptions());
    methods.reset(defaultValues(movement));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, movement]);

  const needsPerson =
    type === STOCK_MOVEMENT_TYPES.ISSUE_OUT || type === STOCK_MOVEMENT_TYPES.RETURN_IN;

  const personLabel =
    type === STOCK_MOVEMENT_TYPES.RETURN_IN ? 'Returned By (Person)' : 'Person';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 520 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? `Edit ${TITLE[type] || 'Stock Movement'}` : TITLE[type] || 'Stock Movement'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {STOCK_MOVEMENT_LABELS[type]}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack
              component="form"
              id="stock-movement-form"
              spacing={2}
              onSubmit={methods.handleSubmit((values) =>
                onSubmit({
                  type,
                  stockItem: values.stockItem,
                  quantity: Number(values.quantity),
                  amount: type === STOCK_MOVEMENT_TYPES.SUPPLIER_IN ? Number(values.amount) : undefined,
                  movementDate: values.movementDate || null,
                  supplierName: String(values.supplierName || '').trim(),
                  issuedTo: String(values.issuedTo || '').trim(),
                  referenceNo: String(values.referenceNo || '').trim(),
                  remarks: String(values.remarks || '').trim(),
                })
              )}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <RHFSelect
                    name="stockItem"
                    label="Stock Item"
                    searchable
                    searchPlaceholder="Search stock item"
                    options={(itemOptions || []).map((item) => {
                      const path = [item.categoryName, item.componentName, item.subComponentName]
                        .filter(Boolean)
                        .join(' / ');
                      return {
                        value: item._id,
                        label: path || item.name,
                      };
                    })}
                    helperText={
                      (itemOptions || []).length === 0 ? 'Add a stock item in the Items tab first.' : ' '
                    }
                  />
                </Grid>
                {type === STOCK_MOVEMENT_TYPES.SUPPLIER_IN && (
                  <>
                    <Grid item xs={12}>
                      <RHFTextField name="supplierName" label="Supplier Name" required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="amount" label="Amount" type="number" required />
                    </Grid>
                  </>
                )}
                {needsPerson && (
                  <Grid item xs={12}>
                    <RHFTextField name="issuedTo" label={personLabel} required />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="quantity" label="Quantity" type="number" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="movementDate" label="Date" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="referenceNo" label="Reference / Challan No." />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="remarks" label="Remarks" multiline minRows={2} />
                </Grid>
              </Grid>
            </Stack>
          </FormProvider>
        </Box>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="stock-movement-form" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
