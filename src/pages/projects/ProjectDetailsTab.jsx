import { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import MultiVideoDropzone from '../../components/common/FileUpload/MultiVideoDropzone';
import { useAppDispatch } from '../../app/hooks';
import { createProject, updateProject } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { userApi } from '../../api/userApi';

// yup's number schema transforms a blank string to NaN, which then fails typeError() even
// though the field is notRequired() — treat blank input as 0 instead of failing validation.
function optionalNumber() {
  return yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null || originalValue === undefined ? 0 : value))
    .typeError('Must be a number')
    .min(0)
    .notRequired();
}

// Same blank-string footgun, but blank here means "use the default bonus %", not 0 — so it
// transforms to null (not 0) and stays nullable.
function optionalNullableNumber() {
  return yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null || originalValue === undefined ? null : value))
    .typeError('Must be a number')
    .min(0)
    .nullable()
    .notRequired();
}

const SERIAL_TYPE_OPTIONS = [
  { value: 'Panel Serial No.', label: 'Panel Serial No.' },
  { value: 'LHS', label: 'LHS' },
  { value: 'AHD', label: 'AHD' },
];

const schema = yup.object({
  projectName: yup.string().required('Project name is required'),
  assignedInstaller: yup.string().required('Please select an installer'),
  contractor: yup.string().required('Contractor is required'),
  railwayZone: yup.string().required('Railway zone is required'),
  serialType: yup.string().oneOf(['Panel Serial No.', 'LHS', 'AHD']).required('Select serial type'),
  panelSerialStart: yup.string().when('serialType', {
    is: (type) => type === 'Panel Serial No.' || type === 'LHS' || type === 'AHD',
    then: (s) => s.trim().required('This field is required'),
    otherwise: (s) => s.notRequired(),
  }),
  panelSerialEnd: yup.string().when('serialType', {
    is: 'Panel Serial No.',
    then: (s) => s.trim().required('End is required'),
    otherwise: (s) => s.notRequired(),
  }),
  invoiceNoDateSupply: yup.string().notRequired(),
  loaNo: yup.string().notRequired(),
  loaDate: yup.string().nullable().notRequired(),
  workName: yup.string().notRequired(),
  dateOfCompletionLOA: yup.string().nullable().notRequired(),
  targetDate: yup.string().nullable().notRequired(),
  reasonForDelay: yup.string().notRequired(),
  supervisorName: yup.string().notRequired(),
  totalInstallationAmount: optionalNumber(),
  bonusPercentOverride: optionalNullableNumber().max(100),
  totalUnits: yup.object({
    stations: optionalNumber(),
    ibh: optionalNumber(),
    autoHuts: optionalNumber(),
    lcGates: optionalNumber(),
    telecomExchanges: optionalNumber(),
    buildings: optionalNumber(),
    signal: optionalNumber(),
  }),
  loaItems: yup.array().of(
    yup.object({
      item: yup.string().notRequired(),
      qty: optionalNumber(),
      unit: yup.string().notRequired(),
    })
  ),
  railwayOfficers: yup.object({
    srDste: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
    dste: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
    sse: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
  }),
  additionalOfficers: yup.array().of(
    yup.object({
      designation: yup.string().notRequired(),
      name: yup.string().notRequired(),
      number: yup.string().notRequired(),
    })
  ),
  notofireContact: yup.object({
    name: yup.string().notRequired(),
    number: yup.string().notRequired(),
    email: yup.string().notRequired(),
  }),
  installerRatings: yup
    .object({
      timelyCompletion: optionalNullableNumber().min(1).max(5),
      qualityOfWork: optionalNullableNumber().min(1).max(5),
      complaintsOrIssues: yup.string().notRequired(),
    })
    .notRequired(),
});

const RATING_OPTIONS = [
  { value: '', label: 'Not rated' },
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Below average' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Good' },
  { value: 5, label: '5 - Excellent' },
];

const defaultValues = {
  projectName: '',
  assignedInstaller: '',
  contractor: '',
  railwayZone: '',
  serialType: 'Panel Serial No.',
  panelSerialStart: '',
  panelSerialEnd: '',
  invoiceNoDateSupply: '',
  loaNo: '',
  loaDate: null,
  workName: '',
  dateOfCompletionLOA: null,
  targetDate: null,
  reasonForDelay: '',
  supervisorName: '',
  totalInstallationAmount: '',
  bonusPercentOverride: '',
  totalUnits: {
    stations: '',
    ibh: '',
    autoHuts: '',
    lcGates: '',
    telecomExchanges: '',
    buildings: '',
    signal: '',
  },
  loaItems: [],
  railwayOfficers: { srDste: { name: '', number: '' }, dste: { name: '', number: '' }, sse: { name: '', number: '' } },
  additionalOfficers: [],
  notofireContact: { name: '', number: '', email: '' },
  installerRatings: { timelyCompletion: '', qualityOfWork: '', complaintsOrIssues: '' },
};

const NUMBER_FIELDS = ['totalInstallationAmount'];
const DATE_FIELDS = ['loaDate', 'dateOfCompletionLOA', 'targetDate'];
const TEXT_FIELDS = [
  'projectName',
  'contractor',
  'railwayZone',
  'serialType',
  'panelSerialStart',
  'panelSerialEnd',
  'invoiceNoDateSupply',
  'loaNo',
  'workName',
  'reasonForDelay',
  'supervisorName',
];

export default function ProjectDetailsTab({ project, canManage, isAdmin, onSaved }) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(project);
  const readOnly = !canManage;

  const [checklistPdf, setChecklistPdf] = useState(null);
  const [commissioningVideos, setCommissioningVideos] = useState([]);
  const [installationInvoiceDoc, setInstallationInvoiceDoc] = useState(null);
  const [supplyInvoiceDoc, setSupplyInvoiceDoc] = useState(null);
  const [installationPoDoc, setInstallationPoDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState([{ value: '', label: 'Select installer' }]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const loaItemsArray = useFieldArray({ control: methods.control, name: 'loaItems' });
  const additionalOfficersArray = useFieldArray({ control: methods.control, name: 'additionalOfficers' });
  const serialType = methods.watch('serialType');

  useEffect(() => {
    if (!canManage) return;
    let cancelled = false;
    setLoadingUsers(true);
    userApi
      .options()
      .then(({ data }) => {
        if (cancelled) return;
        const users = data.data || [];
        setUserOptions([
          { value: '', label: 'Select installer' },
          ...users.map((u) => ({
            value: u._id,
            label: [u.name, u.email].filter(Boolean).join(' · '),
          })),
        ]);
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(showSnackbar({ message: 'Failed to load users for installer assignment', severity: 'error' }));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canManage, dispatch]);

  useEffect(() => {
    if (project) {
      methods.reset({
        projectName: project.projectName || '',
        assignedInstaller: project.assignedInstaller?._id || project.assignedInstaller || '',
        contractor: project.contractor || '',
        railwayZone: project.railwayZone || '',
        serialType: project.serialType || 'Panel Serial No.',
        panelSerialStart: project.panelSerialStart || '',
        panelSerialEnd: project.panelSerialEnd || '',
        invoiceNoDateSupply: project.invoiceNoDateSupply || '',
        loaNo: project.loaNo || '',
        loaDate: project.loaDate?.slice(0, 10) || null,
        workName: project.workName || '',
        dateOfCompletionLOA: project.dateOfCompletionLOA?.slice(0, 10) || null,
        targetDate: project.targetDate?.slice(0, 10) || null,
        reasonForDelay: project.reasonForDelay || '',
        supervisorName: project.supervisorName || '',
        totalInstallationAmount: project.totalInstallationAmount ?? '',
        bonusPercentOverride: project.bonusPercentOverride ?? '',
        totalUnits: {
          stations: project.totalUnits?.stations ?? '',
          ibh: project.totalUnits?.ibh ?? '',
          autoHuts: project.totalUnits?.autoHuts ?? '',
          lcGates: project.totalUnits?.lcGates ?? '',
          telecomExchanges: project.totalUnits?.telecomExchanges ?? '',
          buildings: project.totalUnits?.buildings ?? '',
          signal: project.totalUnits?.signal ?? '',
        },
        loaItems: project.loaItems || [],
        railwayOfficers: {
          srDste: { name: project.railwayOfficers?.srDste?.name || '', number: project.railwayOfficers?.srDste?.number || '' },
          dste: { name: project.railwayOfficers?.dste?.name || '', number: project.railwayOfficers?.dste?.number || '' },
          sse: { name: project.railwayOfficers?.sse?.name || '', number: project.railwayOfficers?.sse?.number || '' },
        },
        additionalOfficers: project.additionalOfficers || [],
        notofireContact: {
          name: project.notofireContact?.name || '',
          number: project.notofireContact?.number || '',
          email: project.notofireContact?.email || '',
        },
        installerRatings: {
          timelyCompletion: project.installerRatings?.timelyCompletion ?? '',
          qualityOfWork: project.installerRatings?.qualityOfWork ?? '',
          complaintsOrIssues: project.installerRatings?.complaintsOrIssues || '',
        },
      });
      setChecklistPdf(project.checklistPdf ? { ...project.checklistPdf, name: 'Checklist.pdf' } : null);
      setCommissioningVideos(
        (project.commissioningVideos || []).map((v, i) => ({ ...v, name: `Commissioning Video ${i + 1}` }))
      );
      setInstallationInvoiceDoc(
        project.installationInvoiceDoc ? { ...project.installationInvoiceDoc, name: 'Installation Invoice.pdf' } : null
      );
      setSupplyInvoiceDoc(project.supplyInvoiceDoc ? { ...project.supplyInvoiceDoc, name: 'Supply Invoice.pdf' } : null);
      setInstallationPoDoc(
        project.installationPoDoc ? { ...project.installationPoDoc, name: 'Installation PO.pdf' } : null
      );
    } else {
      methods.reset(defaultValues);
      setChecklistPdf(null);
      setCommissioningVideos([]);
      setInstallationInvoiceDoc(null);
      setSupplyInvoiceDoc(null);
      setInstallationPoDoc(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();

    TEXT_FIELDS.forEach((field) => formData.append(field, values[field] || ''));
    formData.append('assignedInstaller', values.assignedInstaller || '');
    NUMBER_FIELDS.forEach((field) => formData.append(field, values[field]));
    DATE_FIELDS.forEach((field) => {
      if (values[field]) formData.append(field, values[field]);
    });
    formData.append('bonusPercentOverride', values.bonusPercentOverride === null ? '' : values.bonusPercentOverride);
    formData.append('totalUnits', JSON.stringify(values.totalUnits || {}));
    formData.append('loaItems', JSON.stringify(values.loaItems || []));
    formData.append('railwayOfficers', JSON.stringify(values.railwayOfficers || {}));
    formData.append('additionalOfficers', JSON.stringify(values.additionalOfficers || []));
    formData.append('notofireContact', JSON.stringify(values.notofireContact || {}));
    if (isAdmin) {
      formData.append(
        'installerRatings',
        JSON.stringify({
          timelyCompletion:
            values.installerRatings?.timelyCompletion === '' || values.installerRatings?.timelyCompletion == null
              ? null
              : Number(values.installerRatings.timelyCompletion),
          qualityOfWork:
            values.installerRatings?.qualityOfWork === '' || values.installerRatings?.qualityOfWork == null
              ? null
              : Number(values.installerRatings.qualityOfWork),
          complaintsOrIssues: values.installerRatings?.complaintsOrIssues || '',
        })
      );
    }

    if (checklistPdf?.file) formData.append('checklistPdf', checklistPdf.file);
    commissioningVideos.filter((v) => v.file).forEach((v) => formData.append('commissioningVideos', v.file));
    if (installationInvoiceDoc?.file) formData.append('installationInvoiceDoc', installationInvoiceDoc.file);
    if (supplyInvoiceDoc?.file) formData.append('supplyInvoiceDoc', supplyInvoiceDoc.file);
    if (installationPoDoc?.file) formData.append('installationPoDoc', installationPoDoc.file);

    try {
      let saved;
      if (isEdit) {
        saved = await dispatch(updateProject({ id: project._id, payload: formData })).unwrap();
        dispatch(showSnackbar({ message: 'Project updated successfully' }));
      } else {
        saved = await dispatch(createProject(formData)).unwrap();
        dispatch(showSnackbar({ message: 'Project created — you can now add stations, cad drawings, and daily reports' }));
      }
      onSaved?.(saved);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save project', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Stack component="form" onSubmit={methods.handleSubmit(onSubmit)} spacing={0}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Basic Information
        </Typography>
        <Grid container spacing={1.25}>
          <Grid item xs={12}>
            <RHFTextField name="projectName" label="Project Name" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {canManage ? (
              <RHFSelect
                name="assignedInstaller"
                label="Assign Installer"
                options={userOptions}
                disabled={readOnly || loadingUsers}
                size="small"
                helperText={loadingUsers ? 'Loading users…' : 'Project will be visible only to the selected user'}
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                label="Assigned Installer"
                value={project?.installerName || '—'}
                disabled
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="contractor" label="Contractor" disabled={readOnly} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <RHFTextField name="railwayZone" label="Railway Zone" disabled={readOnly} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <RHFSelect
              name="serialType"
              label="Serial Type"
              options={SERIAL_TYPE_OPTIONS}
              disabled={readOnly}
              size="small"
            />
          </Grid>
          {serialType === 'Panel Serial No.' ? (
            <>
              <Grid item xs={6} sm={4}>
                <RHFTextField name="panelSerialStart" label="Panel Serial No. — Start" disabled={readOnly} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <RHFTextField name="panelSerialEnd" label="Panel Serial No. — End" disabled={readOnly} />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={4}>
              <RHFTextField
                name="panelSerialStart"
                label={serialType === 'LHS' ? 'LHS' : serialType === 'AHD' ? 'AHD' : 'Value'}
                disabled={readOnly}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={8}>
            <RHFTextField name="invoiceNoDateSupply" label="Invoice No. / Date & Supply" disabled={readOnly} />
          </Grid>
        </Grid>

        {isAdmin && (
          <>
            <Divider sx={{ my: 1.75 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 0.35, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ratings of Installer
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', mb: 1 }}>
              Admin only — rate installer performance for this project
            </Typography>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="installerRatings.timelyCompletion"
                  label="Timely Completion of Work"
                  options={RATING_OPTIONS}
                  disabled={readOnly}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="installerRatings.qualityOfWork"
                  label="Quality of Work"
                  options={RATING_OPTIONS}
                  disabled={readOnly}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField
                  name="installerRatings.complaintsOrIssues"
                  label="Complaints or Issues"
                  disabled={readOnly}
                  multiline
                  minRows={2}
                  placeholder="Note any complaints, delays, or quality issues"
                />
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 1.75 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          LOA Details
        </Typography>
        <Grid container spacing={1.25}>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="loaNo" label="LOA No." disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFDatePicker name="loaDate" label="LOA Date" disabled={readOnly} />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="workName" label="Name of Work" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFDatePicker name="dateOfCompletionLOA" label="Date of Completion (as per LOA)" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFDatePicker name="targetDate" label="Target Date to Complete" disabled={readOnly} />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="reasonForDelay" label="Reason for Delay" disabled={readOnly} placeholder="Leave blank if on track" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.75 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Site Scope (Total No. as per LOA)
        </Typography>
        <Grid container spacing={1.25}>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.stations" label="Stations" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.ibh" label="IBH" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.autoHuts" label="Auto Huts" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.lcGates" label="LC Gates" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.telecomExchanges" label="Telecom Ex." type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.buildings" label="Buildings" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={4} sm={2}>
            <RHFTextField name="totalUnits.signal" label="Signal" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="supervisorName" label="Name of Project Supervisor" disabled={readOnly} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.75 }} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          gap={1}
          sx={{ mb: 1 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Items as per LOA
          </Typography>
          {!readOnly && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => loaItemsArray.append({ item: '', qty: 0, unit: 'Nos' })}
            >
              Add Item
            </Button>
          )}
        </Stack>
        <Stack spacing={1}>
          {loaItemsArray.fields.length === 0 && (
            <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
              No items added.
            </Typography>
          )}
          {loaItemsArray.fields.map((field, index) => (
            <Grid container spacing={1} key={field.id} alignItems="center">
              <Grid item xs={12} sm={5}>
                <RHFTextField name={`loaItems.${index}.item`} label="Item" disabled={readOnly} />
              </Grid>
              <Grid item xs={5} sm={3}>
                <RHFTextField name={`loaItems.${index}.qty`} label="Qty" type="number" disabled={readOnly} />
              </Grid>
              <Grid item xs={5} sm={3}>
                <RHFTextField name={`loaItems.${index}.unit`} label="Unit" disabled={readOnly} />
              </Grid>
              {!readOnly && (
                <Grid item xs={2} sm={1}>
                  <IconButton size="small" onClick={() => loaItemsArray.remove(index)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}
        </Stack>

        <Divider sx={{ my: 1.75 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Railway Officers
        </Typography>
        <Grid container spacing={1.25}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600 }} color="text.secondary">
                Sr.DSTE
              </Typography>
              <RHFTextField name="railwayOfficers.srDste.name" label="Name" disabled={readOnly} />
              <RHFTextField name="railwayOfficers.srDste.number" label="Number" disabled={readOnly} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600 }} color="text.secondary">
                DSTE
              </Typography>
              <RHFTextField name="railwayOfficers.dste.name" label="Name" disabled={readOnly} />
              <RHFTextField name="railwayOfficers.dste.number" label="Number" disabled={readOnly} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600 }} color="text.secondary">
                SSE
              </Typography>
              <RHFTextField name="railwayOfficers.sse.name" label="Name" disabled={readOnly} />
              <RHFTextField name="railwayOfficers.sse.number" label="Number" disabled={readOnly} />
            </Stack>
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 1.75, mb: 1 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Additional Officers
          </Typography>
          {!readOnly && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => additionalOfficersArray.append({ designation: '', name: '', number: '' })}
            >
              Add Officer
            </Button>
          )}
        </Stack>
        <Stack spacing={1}>
          {additionalOfficersArray.fields.length === 0 && (
            <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
              None added.
            </Typography>
          )}
          {additionalOfficersArray.fields.map((field, index) => (
            <Grid container spacing={1} key={field.id} alignItems="center">
              <Grid item xs={12} sm={3}>
                <RHFTextField name={`additionalOfficers.${index}.designation`} label="Designation" disabled={readOnly} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <RHFTextField name={`additionalOfficers.${index}.name`} label="Name" disabled={readOnly} />
              </Grid>
              <Grid item xs={5} sm={4}>
                <RHFTextField name={`additionalOfficers.${index}.number`} label="Number" disabled={readOnly} />
              </Grid>
              {!readOnly && (
                <Grid item xs={1}>
                  <IconButton size="small" onClick={() => additionalOfficersArray.remove(index)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}
        </Stack>

        <Divider sx={{ my: 1.75 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Commercials & Notofire Contact
        </Typography>
        <Grid container spacing={1.25}>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="totalInstallationAmount" label="Total Installation Amount" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="bonusPercentOverride" label="Bonus % Override" type="number" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <RHFTextField name="notofireContact.name" label="Notofire Contact — Name" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <RHFTextField name="notofireContact.number" label="Number" disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <RHFTextField name="notofireContact.email" label="Email ID" disabled={readOnly} />
          </Grid>
        </Grid>

        {isAdmin && (
          <>
            <Divider sx={{ my: 1.75 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Documents
            </Typography>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone value={checklistPdf} onChange={readOnly ? () => {} : setChecklistPdf} label="Checklist Storage (PDF)" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MultiVideoDropzone
                  value={commissioningVideos}
                  onChange={readOnly ? () => {} : setCommissioningVideos}
                  label="Commissioning Videos"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={installationInvoiceDoc}
                  onChange={readOnly ? () => {} : setInstallationInvoiceDoc}
                  label="Installation Invoice"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={supplyInvoiceDoc}
                  onChange={readOnly ? () => {} : setSupplyInvoiceDoc}
                  label="Supply Invoice"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={installationPoDoc}
                  onChange={readOnly ? () => {} : setInstallationPoDoc}
                  label="Installation PO"
                />
              </Grid>
            </Grid>
          </>
        )}

        {canManage && (
          <Stack direction="row" sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={submitting}
              sx={{ borderRadius: '8px', bgcolor: '#0f766e', '&:hover': { bgcolor: '#0d9488' } }}
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </Stack>
        )}
      </Stack>
    </FormProvider>
  );
}
