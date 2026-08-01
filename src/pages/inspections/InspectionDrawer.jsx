import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
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
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import MixedFileDropzone from '../../components/common/FileUpload/MixedFileDropzone';
import StatusBadge from '../../components/common/StatusBadge';
import { nitTenderApi } from '../../api/nitTenderApi';
import { INSPECTION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = Object.values(INSPECTION_STATUS).map((v) => ({ value: v, label: v }));

const DOC_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

const emptyChecklistItem = () => ({
  itemName: '',
  status: INSPECTION_STATUS.PENDING,
  remark: '',
});

const INSPECTION_CHARGE_BORN_BY = Object.freeze({
  RAILWAY: 'Railway',
  CONTRACTOR: 'Contractor',
});

const schema = yup.object({
  tender: yup.string().required('LOA is required'),
  inspectionDate: yup.string().required('Inspection date is required'),
  firmCallNo: yup.string().trim().required('Firm Call No. is required'),
  rdsoCallNo: yup.string().trim().required('RDSO Call No. is required'),
  inspectorName: yup.string().trim().required('Inspector name is required'),
  fireAlarmQty: yup.number().typeError('Must be a number').min(0).required('Quantity of fire Alarm is required'),
  controlPanelQty: yup
    .number()
    .typeError('Must be a number')
    .min(0)
    .required('Quantity of Control Panel is required'),
  dmNo: yup.string().trim().required('DM No. is required'),
  doc: yup.string().trim().required('DOC is required'),
  consignee: yup.string().trim().required('Consignee is required'),
  orderingAuthority: yup.string().trim().required('Ordering Authority is required'),
  inspectionChargeBornBy: yup
    .string()
    .oneOf([INSPECTION_CHARGE_BORN_BY.RAILWAY, INSPECTION_CHARGE_BORN_BY.CONTRACTOR])
    .required('Inspection charge born by is required'),
  mersNo: yup
    .string()
    .trim()
    .when('inspectionChargeBornBy', {
      is: INSPECTION_CHARGE_BORN_BY.CONTRACTOR,
      then: (s) => s.required('MERS No. is required when born by Contractor'),
      otherwise: (s) => s.notRequired(),
    }),
  status: yup.string().oneOf(Object.values(INSPECTION_STATUS)).notRequired(),
  remarks: yup.string().trim().nullable(),
  checklistItems: yup
    .array()
    .of(
      yup.object({
        itemName: yup.string().trim(),
        status: yup.string().oneOf(Object.values(INSPECTION_STATUS)),
        remark: yup.string().trim().nullable(),
      })
    )
    .notRequired(),
});

function toDateInput(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function toDocValue(file) {
  if (!file) return null;
  return { ...file, name: file.originalName || file.name || 'document' };
}

function toDocList(files = []) {
  return (files || []).map((f) => ({ ...f, name: f.originalName || f.name || 'document' }));
}

function mapInspectionToForm(inspection) {
  if (!inspection) {
    return {
      tender: '',
      inspectionDate: null,
      firmCallNo: '',
      rdsoCallNo: '',
      inspectorName: '',
      fireAlarmQty: '',
      controlPanelQty: '',
      dmNo: '',
      doc: '',
      consignee: '',
      orderingAuthority: '',
      inspectionChargeBornBy: INSPECTION_CHARGE_BORN_BY.RAILWAY,
      mersNo: '',
      status: INSPECTION_STATUS.PENDING,
      remarks: '',
      checklistItems: [emptyChecklistItem()],
    };
  }

  return {
    tender: inspection.tender?._id || inspection.tender || '',
    inspectionDate: toDateInput(inspection.inspectionDate),
    firmCallNo: inspection.firmCallNo || '',
    rdsoCallNo: inspection.rdsoCallNo || '',
    inspectorName: inspection.inspectorName || '',
    fireAlarmQty: inspection.fireAlarmQty ?? '',
    controlPanelQty: inspection.controlPanelQty ?? '',
    dmNo: inspection.dmNo || '',
    doc: inspection.doc || '',
    consignee: inspection.consignee || '',
    orderingAuthority: inspection.orderingAuthority || '',
    inspectionChargeBornBy: inspection.inspectionChargeBornBy || INSPECTION_CHARGE_BORN_BY.RAILWAY,
    mersNo: inspection.mersNo || '',
    status: inspection.status || INSPECTION_STATUS.PENDING,
    remarks: inspection.remarks || '',
    checklistItems:
      inspection.checklistItems?.length > 0
        ? inspection.checklistItems.map((item) => ({
            itemName: item.itemName || '',
            status: item.status || INSPECTION_STATUS.PENDING,
            remark: item.remark || '',
          }))
        : [emptyChecklistItem()],
  };
}

export default function InspectionDrawer({ open, mode = 'create', inspection, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';

  const [tenderOptions, setTenderOptions] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(false);

  const [dmFile, setDmFile] = useState(null);
  const [initialDmFile, setInitialDmFile] = useState(null);
  const [icCopy, setIcCopy] = useState(null);
  const [initialIcCopy, setInitialIcCopy] = useState(null);
  const [firmCallLetter, setFirmCallLetter] = useState(null);
  const [initialFirmCallLetter, setInitialFirmCallLetter] = useState(null);
  const [otherDetailsFiles, setOtherDetailsFiles] = useState([]);
  const [initialOtherDetailsFiles, setInitialOtherDetailsFiles] = useState([]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: mapInspectionToForm(null),
  });

  const checklistArray = useFieldArray({ control: methods.control, name: 'checklistItems' });
  const selectedTenderId = useWatch({ control: methods.control, name: 'tender' });
  const chargeBornBy = useWatch({ control: methods.control, name: 'inspectionChargeBornBy' });

  const selectedTender = useMemo(
    () => tenderOptions.find((t) => String(t._id) === String(selectedTenderId)) || null,
    [tenderOptions, selectedTenderId]
  );

  useEffect(() => {
    if (!open) return;

    setLoadingTenders(true);
    nitTenderApi
      .options()
      .then((res) => setTenderOptions(res.data?.data || []))
      .catch(() => setTenderOptions([]))
      .finally(() => setLoadingTenders(false));

    methods.reset(mapInspectionToForm(inspection));

    const nextDm = toDocValue(inspection?.dmFile);
    const nextIc = toDocValue(inspection?.icCopy);
    const nextFirm = toDocValue(inspection?.firmCallLetter);
    const nextOther = toDocList(inspection?.otherDetailsFiles);

    setDmFile(nextDm);
    setInitialDmFile(nextDm);
    setIcCopy(nextIc);
    setInitialIcCopy(nextIc);
    setFirmCallLetter(nextFirm);
    setInitialFirmCallLetter(nextFirm);
    setOtherDetailsFiles(nextOther);
    setInitialOtherDetailsFiles(nextOther);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, inspection]);

  const titleMap = { create: 'Add Inspection', edit: 'Edit Inspection', view: 'Inspection Details' };

  const loaNumberDisplay = selectedTender?.loaNumber || inspection?.loaNumber || '';
  const contractorNameDisplay = selectedTender?.contractorName || inspection?.contractorName || '';
  const loaDivisionNameDisplay = selectedTender?.loaDivisionName || inspection?.loaDivisionName || '';
  const loaWorkCompletionDisplay = selectedTender?.loaWorkCompletion || inspection?.loaWorkCompletion || null;

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append('tender', values.tender);
    formData.append('inspectionDate', values.inspectionDate);
    formData.append('firmCallNo', values.firmCallNo);
    formData.append('rdsoCallNo', values.rdsoCallNo);
    formData.append('inspectorName', values.inspectorName.trim());
    formData.append('fireAlarmQty', values.fireAlarmQty);
    formData.append('controlPanelQty', values.controlPanelQty);
    formData.append('dmNo', values.dmNo);
    formData.append('doc', values.doc);
    formData.append('consignee', values.consignee);
    formData.append('orderingAuthority', values.orderingAuthority);
    formData.append('inspectionChargeBornBy', values.inspectionChargeBornBy);
    formData.append('mersNo', values.mersNo || '');

    if (values.status) formData.append('status', values.status);
    formData.append('remarks', values.remarks || '');
    formData.append(
      'checklistItems',
      JSON.stringify(
        (values.checklistItems || [])
          .filter((item) => String(item.itemName || '').trim())
          .map((item) => ({
            itemName: String(item.itemName).trim(),
            status: item.status || INSPECTION_STATUS.PENDING,
            remark: String(item.remark || '').trim(),
          }))
      )
    );

    if (dmFile?.file) formData.append('dmFile', dmFile.file);
    if (icCopy?.file) formData.append('icCopy', icCopy.file);
    if (firmCallLetter?.file) formData.append('firmCallLetter', firmCallLetter.file);
    otherDetailsFiles.filter((f) => f.file).forEach((f) => formData.append('otherDetailsFiles', f.file));

    if (mode === 'edit') {
      if (initialDmFile && !dmFile) formData.append('removeDmFile', 'true');
      if (initialIcCopy && !icCopy) formData.append('removeIcCopy', 'true');
      if (initialFirmCallLetter && !firmCallLetter) formData.append('removeFirmCallLetter', 'true');

      const removedOtherIds = initialOtherDetailsFiles
        .filter((f) => !otherDetailsFiles.some((c) => c.publicId === f.publicId))
        .map((f) => f.publicId)
        .filter(Boolean);
      formData.append('removeOtherDetailsFileIds', JSON.stringify(removedOtherIds));
    }

    onSubmit(formData);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 560, md: 640 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              {titleMap[mode]}
            </Typography>
            {mode !== 'create' && inspection?.status && <StatusBadge status={inspection.status} />}
          </Stack>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack component="form" id="inspection-form" spacing={2.5} onSubmit={methods.handleSubmit(handleSubmit)}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Select Tender LOA
              </Typography>

              <RHFSelect
                name="tender"
                label="LOA"
                options={tenderOptions.map((t) => ({
                  value: t._id,
                  label: [t.tenderName, t.loaNumber, t.contractorName].filter(Boolean).join(' — '),
                }))}
                disabled={readOnly || loadingTenders}
                helperText={
                  loadingTenders
                    ? 'Loading tender LOAs…'
                    : tenderOptions.length === 0
                      ? 'No tender LOAs found'
                      : undefined
                }
              />

              <Divider />

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                LOA Details
              </Typography>

              <Grid container spacing={1.25}>
                <Grid item xs={12} sm={6}>
                  <TextField label="LOA No." value={loaNumberDisplay || ''} fullWidth size="small" disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Contractor" value={contractorNameDisplay || ''} fullWidth size="small" disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="LOA Division / Name"
                    value={loaDivisionNameDisplay || ''}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="LOA Work Completion"
                    value={loaWorkCompletionDisplay ? formatDate(loaWorkCompletionDisplay) : ''}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="LOA Items Count"
                    value={selectedTender?.loaItems?.length || inspection?.loaItems?.length || 0}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Grid>
              </Grid>

              <Divider />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Inspection Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker name="inspectionDate" label="Inspection Date" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="firmCallNo" label="Firm Call No." disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="rdsoCallNo" label="RDSO Call No." disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="inspectorName" label="Inspector Name" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="fireAlarmQty" label="Quantity of fire Alarm" type="number" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField
                    name="controlPanelQty"
                    label="Quantity of Control Panel"
                    type="number"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="dmNo" label="DM No." disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="doc" label="DOC" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="consignee" label="Consignee" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="orderingAuthority" label="Ordering Authority" disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFSelect
                    name="inspectionChargeBornBy"
                    label="Inspection Charge Born By"
                    options={[
                      { value: INSPECTION_CHARGE_BORN_BY.RAILWAY, label: 'Railway' },
                      { value: INSPECTION_CHARGE_BORN_BY.CONTRACTOR, label: 'Contractor' },
                    ]}
                    disabled={readOnly}
                  />
                </Grid>
                {chargeBornBy === INSPECTION_CHARGE_BORN_BY.CONTRACTOR && (
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="mersNo" label="MERS No." disabled={readOnly} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="remarks" label="Remarks" multiline minRows={2} disabled={readOnly} />
                </Grid>
              </Grid>

              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Checklist Items
                </Typography>
                {!readOnly && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => checklistArray.append(emptyChecklistItem())}>
                    Add Item
                  </Button>
                )}
              </Stack>
              <Stack spacing={1.5}>
                {checklistArray.fields.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No checklist items added.
                  </Typography>
                )}
                {checklistArray.fields.map((field, index) => (
                  <Box key={field.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={1.25} alignItems="flex-start">
                      <Grid item xs={12} sm={5}>
                        <RHFTextField name={`checklistItems.${index}.itemName`} label="Item Name" disabled={readOnly} />
                      </Grid>
                      <Grid item xs={10} sm={3}>
                        <RHFSelect
                          name={`checklistItems.${index}.status`}
                          label="Status"
                          options={STATUS_OPTIONS}
                          disabled={readOnly}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <RHFTextField name={`checklistItems.${index}.remark`} label="Remark" disabled={readOnly} />
                      </Grid>
                      {!readOnly && (
                        <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => checklistArray.remove(index)}
                            aria-label="Remove checklist item"
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Stack>

              <Divider />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Documents
              </Typography>

              <DocumentDropzone
                label="DM File"
                value={dmFile}
                onChange={setDmFile}
                accept={DOC_ACCEPT}
                buttonLabel="Upload DM File"
                disabled={readOnly}
              />
              <DocumentDropzone
                label="IC Copy"
                value={icCopy}
                onChange={setIcCopy}
                accept={DOC_ACCEPT}
                buttonLabel="Upload IC Copy"
                disabled={readOnly}
              />
              <DocumentDropzone
                label="Firm Call Letter"
                value={firmCallLetter}
                onChange={setFirmCallLetter}
                accept={DOC_ACCEPT}
                buttonLabel="Upload Firm Call Letter"
                disabled={readOnly}
              />
              <MixedFileDropzone
                label="Other Details (images or PDFs)"
                value={otherDetailsFiles}
                onChange={setOtherDetailsFiles}
                disabled={readOnly}
              />
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
          {!readOnly && (
            <Button type="submit" form="inspection-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
