import { useEffect, useState } from 'react';
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
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import { useAppDispatch } from '../../app/hooks';
import { previewBomProduction, confirmBomProduction } from '../../features/bom/bomThunks';
import { showSnackbar } from '../../features/ui/uiSlice';

const schema = yup.object({
  bom: yup.string().required('BOM is required'),
  productionQty: yup
    .number()
    .typeError('Must be a number')
    .moreThan(0, 'Production qty must be greater than 0')
    .required('Production qty is required'),
  person: yup.string().trim().required('Person name is required'),
  productionDate: yup.string().nullable(),
  referenceNo: yup.string().trim().nullable(),
  remarks: yup.string().trim().nullable(),
});

function defaultValues() {
  return {
    bom: '',
    productionQty: '',
    person: '',
    productionDate: new Date().toISOString().slice(0, 10),
    referenceNo: '',
    remarks: '',
  };
}

export default function UseBomDrawer({ open, bomOptions, onClose, onSuccess }) {
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (!open) return;
    methods.reset(defaultValues());
    setPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePreview = methods.handleSubmit(async (values) => {
    setPreviewing(true);
    try {
      const result = await dispatch(
        previewBomProduction({
          bom: values.bom,
          productionQty: Number(values.productionQty),
        })
      ).unwrap();
      setPreview(result);
      if (result.hasShortage) {
        dispatch(
          showSnackbar({
            message: 'Shortage detected — confirmation is blocked until stock is available',
            severity: 'warning',
          })
        );
      }
    } catch (err) {
      setPreview(null);
      dispatch(showSnackbar({ message: err || 'Failed to calculate requirements', severity: 'error' }));
    } finally {
      setPreviewing(false);
    }
  });

  const handleConfirm = methods.handleSubmit(async (values) => {
    if (!preview?.canConfirm) return;
    setConfirming(true);
    try {
      await dispatch(
        confirmBomProduction({
          bom: values.bom,
          productionQty: Number(values.productionQty),
          person: String(values.person || '').trim(),
          productionDate: values.productionDate || null,
          referenceNo: String(values.referenceNo || '').trim(),
          remarks: String(values.remarks || '').trim(),
        })
      ).unwrap();
      dispatch(showSnackbar({ message: 'BOM production confirmed — utilize records created' }));
      onSuccess?.();
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to confirm production', severity: 'error' }));
    } finally {
      setConfirming(false);
    }
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 760 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Use BOM / Create Production
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculates required qty and creates utilize movements on confirm.
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack spacing={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <RHFSelect
                    name="bom"
                    label="BOM"
                    options={[
                      { value: '', label: 'Select BOM' },
                      ...(bomOptions || []).map((bom) => ({
                        value: bom._id,
                        label: `${bom.name} (v${bom.version})`,
                      })),
                    ]}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="productionQty" label="Production Qty" type="number" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="person" label="Person" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="productionDate" label="Date" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="referenceNo" label="Reference" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="remarks" label="Remarks" />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" onClick={handlePreview} disabled={previewing}>
                  {previewing ? 'Calculating…' : 'Calculate / Preview'}
                </Button>
              </Stack>

              {preview && (
                <>
                  {preview.hasShortage ? (
                    <Alert severity="error">
                      Insufficient warehouse stock for one or more items. Confirmation is disabled.
                    </Alert>
                  ) : (
                    <Alert severity="success">Stock is sufficient. You can confirm production.</Alert>
                  )}

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Qty/PCS</TableCell>
                          <TableCell align="right">Production Qty</TableCell>
                          <TableCell align="right">Required</TableCell>
                          <TableCell align="right">Available</TableCell>
                          <TableCell align="right">Shortage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(preview.lines || []).map((line) => (
                          <TableRow
                            key={String(line.stockItem)}
                            sx={line.shortage > 0 ? { bgcolor: 'error.lighter', backgroundColor: '#fef2f2' } : undefined}
                          >
                            <TableCell>{line.itemName}</TableCell>
                            <TableCell align="right">{line.qtyPerPcs}</TableCell>
                            <TableCell align="right">{line.productionQty}</TableCell>
                            <TableCell align="right">
                              {line.requiredQty} {line.unit}
                            </TableCell>
                            <TableCell align="right">{line.availableQty}</TableCell>
                            <TableCell align="right" sx={{ color: line.shortage > 0 ? 'error.main' : 'inherit' }}>
                              {line.shortage}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Stack>
          </FormProvider>
        </Box>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!preview?.canConfirm || confirming}
          >
            {confirming ? 'Confirming…' : 'Confirm Production'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
