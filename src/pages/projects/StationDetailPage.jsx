import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import StageStepper from '../../components/common/StageStepper';
import StatusBadge from '../../components/common/StatusBadge';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import StationDailyReportingSection from './StationDailyReportingSection';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchProjectById,
  updateStation,
  submitStationClaim,
  markStationPaid,
} from '../../features/projects/projectsThunks';
import { clearCurrent } from '../../features/projects/projectsSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatCurrency } from '../../utils/formatters';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import { SITE_TYPES, CLAIM_STATUS, STATION_STAGE_LABELS, DEFAULT_BONUS_PERCENT, CLAIM_TDS_PERCENT } from '../../utils/constants';
import { stationStage } from '../../utils/projectFlow';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

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

const schema = yup.object({
  name: yup.string().required('Station name is required'),
  type: yup.string().notRequired(),
  sse: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
  installer: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
  supervisor: yup.object({ name: yup.string().notRequired(), number: yup.string().notRequired() }),
  startDate: yup.string().nullable().notRequired(),
  completionDate: yup.string().nullable().notRequired(),
  commissioningDate: yup.string().nullable().notRequired(),
  reasonForDelay: yup.string().notRequired(),
  materials: yup.array().of(
    yup.object({
      item: yup.string().notRequired(),
      qty: optionalNumber(),
      unit: yup.string().notRequired(),
    })
  ),
  installationAmount: optionalNumber(),
  claimDate: yup.string().nullable().notRequired(),
  amountClaimed: optionalNumber(),
  amountCleared: optionalNumber(),
  remarks: yup.string().notRequired(),
});

const defaultValues = {
  name: '',
  type: SITE_TYPES[0],
  sse: { name: '', number: '' },
  installer: { name: '', number: '' },
  supervisor: { name: '', number: '' },
  startDate: null,
  completionDate: null,
  commissioningDate: null,
  reasonForDelay: '',
  materials: [],
  installationAmount: '',
  claimDate: null,
  amountClaimed: '',
  amountCleared: '',
  remarks: '',
};

export default function StationDetailPage() {
  const { id, stationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin, permissions } = useAuth();
  const project = useAppSelector((state) => state.projects.current);
  const currentStatus = useAppSelector((state) => state.projects.currentStatus);

  const [checklistFile, setChecklistFile] = useState(null);
  const [checklistSignedFile, setChecklistSignedFile] = useState(null);
  const [workPhotos, setWorkPhotos] = useState([]);
  const [initialWorkPhotos, setInitialWorkPhotos] = useState([]);
  const [cadDrawingFile, setCadDrawingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const canManage = isAdmin ? Boolean(permissions?.projects) : permissions ? permissions.projects !== false : true;
  const canApprove = isAdmin && Boolean(permissions?.projects);

  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const materialsArray = useFieldArray({ control: methods.control, name: 'materials' });
  const amountRequestedWatch = useWatch({ control: methods.control, name: 'amountClaimed' });

  useEffect(() => {
    dispatch(fetchProjectById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  const station = useMemo(() => project?.stations?.find((s) => s._id === stationId) || null, [project, stationId]);

  useEffect(() => {
    if (!station) return;
    methods.reset({
      name: station.name || '',
      type: station.type || SITE_TYPES[0],
      sse: { name: station.sse?.name || '', number: station.sse?.number || '' },
      installer: { name: station.installer?.name || '', number: station.installer?.number || '' },
      supervisor: { name: station.supervisor?.name || '', number: station.supervisor?.number || '' },
      startDate: station.startDate?.slice(0, 10) || null,
      completionDate: station.completionDate?.slice(0, 10) || null,
      commissioningDate: station.commissioningDate?.slice(0, 10) || null,
      reasonForDelay: station.reasonForDelay || '',
      materials: station.materials || [],
      installationAmount: station.installationAmount ?? '',
      claimDate: station.claimDate?.slice(0, 10) || null,
      amountClaimed: station.amountClaimed ?? '',
      amountCleared: station.amountCleared ?? '',
      remarks: station.remarks || '',
    });
    setChecklistFile(station.checklistFile ? { ...station.checklistFile, name: 'Checklist.pdf' } : null);
    setChecklistSignedFile(station.checklistSignedFile ? { ...station.checklistSignedFile, name: 'Signed Checklist.pdf' } : null);
    setWorkPhotos((station.workPhotos || []).map((p, i) => ({ ...p, name: `Photo ${i + 1}` })));
    setInitialWorkPhotos(station.workPhotos || []);
    setCadDrawingFile(station.cadDrawingFile ? { ...station.cadDrawingFile, name: 'CAD Drawing' } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?._id, station?.updatedAt]);

  if (currentStatus === 'loading' || !project) {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!station) {
    return (
      <Box>
        <Typography>Station not found.</Typography>
        <Link component="button" variant="body2" onClick={() => navigate(`/projects/${id}`)}>
          Back to project
        </Link>
      </Box>
    );
  }

  const stage = stationStage(station);
  const mandatoryOk = Boolean(station.checklistFile && station.checklistSignedFile && station.workPhotos?.length > 0);
  const effectiveBonusPercent = project.bonusPercentOverride != null ? project.bonusPercentOverride : DEFAULT_BONUS_PERCENT;
  const requestedAmount = Number(amountRequestedWatch) || 0;
  const tdsAmount = Math.round((requestedAmount * CLAIM_TDS_PERCENT) / 100);
  const amountAfterTds = Math.round(requestedAmount - tdsAmount);
  const claimEditable = canManage && ['Not Submitted', 'Rejected'].includes(station.claimStatus);

  const onSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('type', values.type || '');
    formData.append('reasonForDelay', values.reasonForDelay || '');
    formData.append('remarks', values.remarks || '');
    formData.append('installationAmount', values.installationAmount === '' ? 0 : values.installationAmount);
    formData.append('amountClaimed', values.amountClaimed === '' ? 0 : values.amountClaimed);
    formData.append('amountCleared', values.amountCleared === '' ? 0 : values.amountCleared);
    ['startDate', 'completionDate', 'commissioningDate', 'claimDate'].forEach((field) => {
      if (values[field]) formData.append(field, values[field]);
    });
    formData.append('sse', JSON.stringify(values.sse || {}));
    formData.append('installer', JSON.stringify(values.installer || {}));
    formData.append('supervisor', JSON.stringify(values.supervisor || {}));
    formData.append('materials', JSON.stringify(values.materials || []));

    if (checklistFile?.file) formData.append('checklistFile', checklistFile.file);
    if (checklistSignedFile?.file) formData.append('checklistSignedFile', checklistSignedFile.file);
    if (cadDrawingFile?.file) formData.append('cadDrawingFile', cadDrawingFile.file);
    workPhotos.filter((p) => p.file).forEach((p) => formData.append('workPhotos', p.file));

    const remainingPhotoIds = workPhotos.filter((p) => !p.file).map((p) => p.publicId);
    const removedIds = initialWorkPhotos.filter((p) => !remainingPhotoIds.includes(p.publicId)).map((p) => p.publicId);
    if (removedIds.length > 0) formData.append('removePhotoIds', JSON.stringify(removedIds));

    try {
      await dispatch(updateStation({ id: project._id, stationId: station._id, formData })).unwrap();
      dispatch(showSnackbar({ message: 'Station updated successfully' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update station', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (thunk, payload, successMessage) => {
    setActionSubmitting(true);
    try {
      await dispatch(thunk(payload)).unwrap();
      dispatch(showSnackbar({ message: successMessage }));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Action failed', severity: 'error' }));
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link component="button" variant="body2" onClick={() => navigate('/projects')} underline="hover">
          Projects
        </Link>
        <Link component="button" variant="body2" onClick={() => navigate(`/projects/${project._id}`)} underline="hover">
          {project.projectName}
        </Link>
        <Typography variant="body2" color="text.primary">
          {station.name}
        </Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Station — {station.name}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => downloadSingleStationReport(project, station)}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Download Station PDF
        </Button>
      </Stack>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
        <StageStepper
          steps={STATION_STAGE_LABELS}
          statuses={STATION_STAGE_LABELS.map((_, i) => (stage === -1 ? (i === 0 ? 'current' : 'pending') : i < stage ? 'done' : i === stage ? 'current' : 'pending'))}
        />
        {stage === -1 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Claim was rejected. See remarks below — update and resubmit.
          </Alert>
        )}
      </Paper>

      <FormProvider {...methods}>
        <Box component="form" id="station-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Station Details
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="name" label="Name of Station" disabled={!canManage} />
                  <RHFSelect
                    name="type"
                    label="Site Type"
                    options={SITE_TYPES.map((t) => ({ value: t, label: t }))}
                    disabled={!canManage}
                  />
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      SSE Name & Number
                    </Typography>
                    <RHFTextField name="sse.name" label="Name" disabled={!canManage} />
                    <RHFTextField name="sse.number" label="Number" disabled={!canManage} />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Installer Name & Number
                    </Typography>
                    <RHFTextField name="installer.name" label="Name" disabled={!canManage} />
                    <RHFTextField name="installer.number" label="Number" disabled={!canManage} />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Supervisor Name & Number
                    </Typography>
                    <RHFTextField name="supervisor.name" label="Name" disabled={!canManage} />
                    <RHFTextField name="supervisor.number" label="Number" disabled={!canManage} />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Timeline
                </Typography>
                <Stack spacing={2.5}>
                  <RHFDatePicker name="startDate" label="Installation Start Date" disabled={!canManage} />
                  <RHFDatePicker name="completionDate" label="Installation Completion Date" disabled={!canManage} />
                  <RHFDatePicker name="commissioningDate" label="Commissioning Date" disabled={!canManage} />
                  <RHFTextField
                    name="reasonForDelay"
                    label="Reason for Delay (if any)"
                    multiline
                    minRows={2}
                    disabled={!canManage}
                    placeholder="Leave blank if on track"
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Materials Used (with quantity)
              </Typography>
              {canManage && (
                <Button size="small" startIcon={<AddIcon />} onClick={() => materialsArray.append({ item: '', qty: 0, unit: 'Nos' })}>
                  Add Material
                </Button>
              )}
            </Stack>
            <Stack spacing={1.5}>
              {materialsArray.fields.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No materials logged.
                </Typography>
              )}
              {materialsArray.fields.map((field, index) => (
                <Grid container spacing={1.5} key={field.id} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <RHFTextField name={`materials.${index}.item`} label="Item" disabled={!canManage} />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <RHFTextField name={`materials.${index}.qty`} label="Qty" type="number" disabled={!canManage} />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <RHFTextField name={`materials.${index}.unit`} label="Unit" disabled={!canManage} />
                  </Grid>
                  {canManage && (
                    <Grid item xs={2} sm={1}>
                      <IconButton onClick={() => materialsArray.remove(index)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Mandatory Site Documentation
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone value={checklistFile} onChange={canManage ? setChecklistFile : () => {}} label="Checklist Uploaded (mandatory)" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={checklistSignedFile}
                  onChange={canManage ? setChecklistSignedFile : () => {}}
                  label="Checklist Signed (mandatory)"
                />
              </Grid>
              <Grid item xs={12}>
                <ImageDropzone
                  value={workPhotos}
                  onChange={canManage ? setWorkPhotos : () => {}}
                  label="Photos of Work Done (mandatory)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={cadDrawingFile}
                  onChange={canManage ? setCadDrawingFile : () => {}}
                  label="CAD Drawing (optional)"
                  accept="image/jpeg,image/png,image/webp"
                  buttonLabel="Upload Image"
                />
              </Grid>
            </Grid>
          </Paper>

          <StationDailyReportingSection
            projectId={project._id}
            station={station}
            canManage={canManage}
            onUpdated={() => dispatch(fetchProjectById(id))}
          />

          {canManage && (
            <Stack direction="row" sx={{ mb: 2.5 }}>
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </Stack>
          )}
        </Box>

        <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              Amount Claimed & Approval
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Flow: Allocated → Date → Amount Requested → After TDS (2%) → Amount Cleared
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <RHFTextField
                name="installationAmount"
                label="1. Installation Amount Allocated"
                type="number"
                disabled={!canManage}
              />
              <RHFDatePicker name="claimDate" label="2. Date" disabled={!claimEditable && !canApprove} />
              <RHFTextField
                name="amountClaimed"
                label="3. Amount Requested"
                type="number"
                disabled={!claimEditable}
              />
              <TextField
                label={`4. After TDS Deduction (${CLAIM_TDS_PERCENT}%)`}
                value={
                  requestedAmount > 0
                    ? `${formatCurrency(amountAfterTds)}  (TDS ${formatCurrency(tdsAmount)})`
                    : '—'
                }
                size="small"
                fullWidth
                disabled
                helperText={
                  requestedAmount > 0
                    ? `Amount Requested ${formatCurrency(requestedAmount)} minus ${CLAIM_TDS_PERCENT}% TDS`
                    : 'Enter amount requested to calculate TDS'
                }
              />
              <Divider />
              <RHFTextField
                name="amountCleared"
                label="5. Amount Cleared"
                type="number"
                disabled={!canApprove || ![CLAIM_STATUS.APPROVED, CLAIM_STATUS.PAID, CLAIM_STATUS.PENDING_APPROVAL].includes(station.claimStatus)}
                helperText={canApprove ? 'Filled by admin after reviewing the claim' : 'Set by admin when claim is cleared'}
              />
            </Stack>
            <Typography variant="body2" color={mandatoryOk ? 'success.main' : 'text.secondary'} sx={{ mb: 2 }}>
              {mandatoryOk
                ? 'All mandatory documents are in place.'
                : 'Save the checklist, signed checklist, and work photos above to enable claim submission.'}
            </Typography>
            {[CLAIM_STATUS.NOT_SUBMITTED, CLAIM_STATUS.REJECTED].includes(station.claimStatus) && !(station.amountClaimed > 0) && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                Enter amount requested above and click "Save Changes" before submitting for approval.
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {[CLAIM_STATUS.NOT_SUBMITTED, CLAIM_STATUS.REJECTED].includes(station.claimStatus) && (
                <Button
                  variant="contained"
                  disabled={!mandatoryOk || !canManage || actionSubmitting || !(station.amountClaimed > 0)}
                  onClick={() => runAction(submitStationClaim, { id: project._id, stationId: station._id }, 'Claim submitted for approval')}
                >
                  Submit for Approval
                </Button>
              )}
              {station.claimStatus === CLAIM_STATUS.PENDING_APPROVAL && (
                <StatusBadge status="Pending Approval" />
              )}
              {station.claimStatus === CLAIM_STATUS.APPROVED && canApprove && (
                <Button
                  variant="contained"
                  color="success"
                  disabled={actionSubmitting}
                  onClick={() => runAction(markStationPaid, { id: project._id, stationId: station._id }, 'Payment marked as released')}
                >
                  Mark as Paid
                </Button>
              )}
              {station.claimStatus === CLAIM_STATUS.PAID && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    Payment released
                    {station.amountCleared > 0 ? ` · Cleared ${formatCurrency(station.amountCleared)}` : ''}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Bonus
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Awarded when a station is commissioned on/before the project's target date with all mandatory documentation
              complete, and the claim is approved.
            </Typography>
            {station.bonusEligible ? (
              <Alert severity="info" sx={{ mb: 1.5 }}>
                <b>{formatCurrency(station.bonusAmount)}</b> bonus at {station.bonusPercent}% — eligible.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                Not yet eligible (or not yet evaluated — bonus is calculated at approval).
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Current bonus rate for this project: <b>{effectiveBonusPercent}%</b>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Remarks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {station.remarks || 'No remarks yet — add notes in the station form above and save.'}
            </Typography>
          </Paper>
        </Grid>
        </Grid>
      </FormProvider>
    </Box>
  );
}
