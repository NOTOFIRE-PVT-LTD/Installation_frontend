import { useCallback, useEffect, useMemo, useState } from 'react';
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
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import StageStepper from '../../components/common/StageStepper';
import StatusBadge from '../../components/common/StatusBadge';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import MixedFileDropzone from '../../components/common/FileUpload/MixedFileDropzone';
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
  claimRequests: yup.array().of(
    yup.object({
      date: yup.string().nullable().notRequired(),
      amountRequested: optionalNumber(),
      amountCleared: optionalNumber(),
      note: yup.string().notRequired(),
    })
  ),
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
  claimRequests: [{ date: null, amountRequested: '', amountCleared: '', note: '' }],
  remarks: '',
};

function buildClaimRequestsFromStation(station) {
  const existing = Array.isArray(station.claimRequests) ? station.claimRequests : [];
  if (existing.length > 0) {
    return existing.map((r) => ({
      _id: r._id,
      date: r.date?.slice?.(0, 10) || (typeof r.date === 'string' ? r.date.slice(0, 10) : null) || null,
      amountRequested: r.amountRequested ?? '',
      amountCleared: r.amountCleared ?? '',
      note: r.note || '',
    }));
  }

  if (station.amountClaimed > 0 || station.amountCleared > 0 || station.claimDate) {
    return [
      {
        date: station.claimDate?.slice?.(0, 10) || null,
        amountRequested: station.amountClaimed ?? '',
        amountCleared: station.amountCleared ?? '',
        note: '',
      },
    ];
  }

  return [{ date: null, amountRequested: '', amountCleared: '', note: '' }];
}

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
  const [initialCadDrawingFile, setInitialCadDrawingFile] = useState(null);
  const [cadDrawingFiles, setCadDrawingFiles] = useState([]);
  const [initialCadDrawingFiles, setInitialCadDrawingFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [removingCadInstaller, setRemovingCadInstaller] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null, address: '', accuracy: null });
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');

    // Use watchPosition so the browser keeps refining accuracy
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // Stop watching once we get a fix accurate to within 50 m
        if (accuracy <= 50) {
          navigator.geolocation.clearWatch(watchId);
        }
        let address = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const json = await res.json();
          address = json.display_name || '';
        } catch {
          // reverse geocoding failed — coordinates still shown
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
    // Auto-stop watching after 20 s regardless
    setTimeout(() => navigator.geolocation.clearWatch(watchId), 20000);
  }, []);

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  const canManage = isAdmin ? Boolean(permissions?.projects) : permissions ? permissions.projects !== false : true;
  const canApprove = isAdmin && Boolean(permissions?.claimApprovals);

  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const materialsArray = useFieldArray({ control: methods.control, name: 'materials' });
  const claimRequestsArray = useFieldArray({ control: methods.control, name: 'claimRequests' });
  const claimRequestsWatch = useWatch({ control: methods.control, name: 'claimRequests' });

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
      claimRequests: buildClaimRequestsFromStation(station),
      remarks: station.remarks || '',
    });
    setChecklistFile(station.checklistFile ? { ...station.checklistFile, name: 'Checklist.pdf' } : null);
    setChecklistSignedFile(station.checklistSignedFile ? { ...station.checklistSignedFile, name: 'Signed Checklist.pdf' } : null);
    setWorkPhotos((station.workPhotos || []).map((p, i) => ({ ...p, name: `Photo ${i + 1}` })));
    setInitialWorkPhotos(station.workPhotos || []);
    setCadDrawingFile(station.cadDrawingFile ? { ...station.cadDrawingFile, name: 'Station Layout Installer' } : null);
    setInitialCadDrawingFile(station.cadDrawingFile || null);
    const cadFiles = (station.cadDrawingFiles || []).map((f, i) => ({
      ...f,
      name: f.originalName || `Cad File Signed ${i + 1}`,
    }));
    setCadDrawingFiles(cadFiles);
    setInitialCadDrawingFiles(cadFiles.filter((f) => f.publicId));
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
  const mandatoryOk = Boolean(station.workPhotos?.length > 0);
  const effectiveBonusPercent = project.bonusPercentOverride != null ? project.bonusPercentOverride : DEFAULT_BONUS_PERCENT;
  const claimRows = Array.isArray(claimRequestsWatch) ? claimRequestsWatch : [];
  const allocatedAmount = Number(methods.watch('installationAmount')) || 0;
  const totalRequested = claimRows.reduce((sum, row) => sum + (Number(row?.amountRequested) || 0), 0);
  const totalTds = Math.round((totalRequested * CLAIM_TDS_PERCENT) / 100);
  const totalAfterTds = Math.round(totalRequested - totalTds);
  const totalCleared = claimRows.reduce((sum, row) => sum + (Number(row?.amountCleared) || 0), 0);
  const remainingAllocated = Math.max(0, Math.round((allocatedAmount - totalRequested) * 100) / 100);
  const overAllocated = totalRequested > allocatedAmount && allocatedAmount > 0;
  const claimEditable = canManage && ['Not Submitted', 'Rejected'].includes(station.claimStatus);
  // After a claim is approved/paid, installers can request the remaining amount as new subparts.
  const reRequestMode =
    canManage && [CLAIM_STATUS.APPROVED, CLAIM_STATUS.PAID].includes(station.claimStatus);
  const hasNewRequest = reRequestMode && claimRows.some((row) => !row?._id && Number(row?.amountRequested) > 0);
  const clearedEditable =
    canApprove && [CLAIM_STATUS.APPROVED, CLAIM_STATUS.PAID, CLAIM_STATUS.PENDING_APPROVAL].includes(station.claimStatus);

  const addPaymentSubpart = () => {
    const remaining = Math.max(0, allocatedAmount - totalRequested);
    claimRequestsArray.append({
      date: null,
      amountRequested: remaining > 0 ? remaining : '',
      amountCleared: '',
      note: '',
    });
  };

  const onSubmit = async (values) => {
    const rows = values.claimRequests || [];
    const requestedSum = rows.reduce(
      (sum, row) => sum + (row.amountRequested === '' || row.amountRequested == null ? 0 : Number(row.amountRequested) || 0),
      0
    );
    const allocated = Number(values.installationAmount) || 0;
    if (allocated > 0 && requestedSum > allocated) {
      dispatch(
        showSnackbar({
          message: `Total amount requested (${formatCurrency(requestedSum)}) cannot exceed allocated amount (${formatCurrency(allocated)})`,
          severity: 'error',
        })
      );
      return false;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('type', values.type || '');
    formData.append('reasonForDelay', values.reasonForDelay || '');
    formData.append('remarks', values.remarks || '');
    formData.append('installationAmount', values.installationAmount === '' ? 0 : values.installationAmount);
    ['startDate', 'completionDate', 'commissioningDate'].forEach((field) => {
      if (values[field]) formData.append(field, values[field]);
    });
    formData.append('sse', JSON.stringify(values.sse || {}));
    formData.append('installer', JSON.stringify(values.installer || {}));
    formData.append('supervisor', JSON.stringify(values.supervisor || {}));
    formData.append('materials', JSON.stringify(values.materials || []));
    if (currentLocation.latitude != null) {
      formData.append('location', JSON.stringify(currentLocation));
    }
    formData.append(
      'claimRequests',
      JSON.stringify(
        (values.claimRequests || []).map((row) => ({
          ...(row._id ? { _id: row._id } : {}),
          date: row.date || null,
          amountRequested: row.amountRequested === '' || row.amountRequested == null ? 0 : Number(row.amountRequested),
          amountCleared: row.amountCleared === '' || row.amountCleared == null ? 0 : Number(row.amountCleared),
          note: row.note || '',
        }))
      )
    );

    if (checklistFile?.file) formData.append('checklistFile', checklistFile.file);
    if (checklistSignedFile?.file) formData.append('checklistSignedFile', checklistSignedFile.file);
    if (cadDrawingFile?.file) formData.append('cadDrawingFile', cadDrawingFile.file);
    if (initialCadDrawingFile?.publicId && !cadDrawingFile) {
      formData.append('removeCadDrawingFile', 'true');
    }
    cadDrawingFiles.filter((f) => f.file).forEach((f) => formData.append('cadDrawingFiles', f.file));
    workPhotos.filter((p) => p.file).forEach((p) => formData.append('workPhotos', p.file));

    const remainingPhotoIds = workPhotos.filter((p) => !p.file).map((p) => p.publicId);
    const removedIds = initialWorkPhotos.filter((p) => !remainingPhotoIds.includes(p.publicId)).map((p) => p.publicId);
    if (removedIds.length > 0) formData.append('removePhotoIds', JSON.stringify(removedIds));

    const remainingCadIds = cadDrawingFiles.filter((f) => !f.file && f.publicId).map((f) => f.publicId);
    const removedCadIds = initialCadDrawingFiles
      .filter((f) => f.publicId && !remainingCadIds.includes(f.publicId))
      .map((f) => f.publicId);
    if (removedCadIds.length > 0) formData.append('removeCadFileIds', JSON.stringify(removedCadIds));

    try {
      await dispatch(updateStation({ id: project._id, stationId: station._id, formData })).unwrap();
      dispatch(showSnackbar({ message: 'Station updated successfully' }));
      return true;
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to update station', severity: 'error' }));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Save the new subpart(s) first, then flip the claim back to Pending Approval (triggers WhatsApp).
  const handleReRequest = methods.handleSubmit(async (values) => {
    const saved = await onSubmit(values);
    if (!saved) return;
    await runAction(
      submitStationClaim,
      { id: project._id, stationId: station._id },
      'New payment request submitted for approval'
    );
  });

  const handleRemoveCadDrawingInstaller = async () => {
    const previous = cadDrawingFile;
    const previousInitial = initialCadDrawingFile;
    setCadDrawingFile(null);

    // Local-only file (not yet saved) — nothing to delete on server
    if (!previousInitial?.publicId) {
      setInitialCadDrawingFile(null);
      return;
    }

    setRemovingCadInstaller(true);
    const formData = new FormData();
    formData.append('removeCadDrawingFile', 'true');
    try {
      await dispatch(updateStation({ id: project._id, stationId: station._id, formData })).unwrap();
      setInitialCadDrawingFile(null);
      dispatch(showSnackbar({ message: 'Station Layout Installer removed' }));
      await dispatch(fetchProjectById(id));
    } catch (err) {
      setCadDrawingFile(previous);
      setInitialCadDrawingFile(previousInitial);
      dispatch(showSnackbar({ message: err || 'Failed to remove Station Layout Installer', severity: 'error' }));
    } finally {
      setRemovingCadInstaller(false);
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
          onClick={async () => {
            try {
              await downloadSingleStationReport(project, station);
            } catch (err) {
              dispatch(showSnackbar({ message: err?.message || 'Failed to generate PDF', severity: 'error' }));
            }
          }}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Download Station PDF
        </Button>
      </Stack>

      <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', height: '100%' }}>
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', height: '100%' }}>
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

            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MyLocationIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Current Location</Typography>
                  </Stack>
                  <IconButton size="small" onClick={fetchCurrentLocation} disabled={locationLoading} title="Refresh location">
                    {locationLoading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                  </IconButton>
                </Stack>

                {locationLoading && currentLocation.latitude == null ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">Acquiring GPS fix — this may take a few seconds…</Typography>
                  </Stack>
                ) : locationError ? (
                  <Typography variant="body2" color="error">{locationError}</Typography>
                ) : currentLocation.latitude != null ? (
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2">
                        <strong>Lat:</strong> {currentLocation.latitude.toFixed(6)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Lng:</strong> {currentLocation.longitude.toFixed(6)}
                      </Typography>
                      {currentLocation.accuracy != null && (
                        <Typography variant="caption" color={currentLocation.accuracy <= 50 ? 'success.main' : 'warning.main'}>
                          ±{currentLocation.accuracy} m accuracy
                        </Typography>
                      )}
                      <Typography
                        component="a"
                        href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        color="primary"
                        sx={{ textDecoration: 'none', fontWeight: 600 }}
                      >
                        Open in Google Maps ↗
                      </Typography>
                    </Stack>
                    {currentLocation.address && (
                      <Typography variant="body2" color="text.secondary">{currentLocation.address}</Typography>
                    )}
                    {station.location?.latitude != null && (
                      <Typography variant="caption" color="text.disabled">
                        Last saved: {station.location.latitude.toFixed(6)}, {station.location.longitude.toFixed(6)}
                        {station.location.address ? ` — ${station.location.address}` : ''}
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Location unavailable. Please enable location access in your browser/device settings.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
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

          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Site Documentation
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={checklistFile}
                  onChange={canManage ? setChecklistFile : () => {}}
                  label="Checklist Uploaded"
                  disabled={!canManage}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DocumentDropzone
                  value={checklistSignedFile}
                  onChange={canManage ? setChecklistSignedFile : () => {}}
                  label="Checklist Signed"
                  disabled={!canManage}
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
                  label="Station Layout Installer"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  buttonLabel="Upload Image / PDF"
                  disabled={!canManage}
                  removing={removingCadInstaller}
                  onRemove={canManage ? handleRemoveCadDrawingInstaller : undefined}
                />
              </Grid>
              <Grid item xs={12}>
                <MixedFileDropzone
                  value={cadDrawingFiles}
                  onChange={canManage ? setCadDrawingFiles : () => {}}
                  label="Cad File Signed"
                  helperText="Upload multiple CAD images or PDF files"
                  disabled={!canManage}
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
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Amount Claimed & Approval
              </Typography>
              {(claimEditable || reRequestMode) && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addPaymentSubpart}
                  disabled={allocatedAmount > 0 && remainingAllocated <= 0}
                >
                  Add Payment Subpart
                </Button>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Split the Installation Amount Allocated into multiple payment subparts (Date → Amount Requested → After TDS
              → Amount Cleared).
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              <RHFTextField
                name="installationAmount"
                label="Installation Amount Allocated"
                type="number"
                disabled={!canManage}
                helperText="Total budget for this station — payment requests must stay within this amount"
              />

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: overAllocated ? 'error.light' : 'divider',
                  bgcolor: overAllocated ? '#fef2f2' : '#f0fdfa',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                  <Typography variant="body2">
                    Allocated: <b>{formatCurrency(allocatedAmount)}</b>
                  </Typography>
                  <Typography variant="body2">
                    Requested: <b>{formatCurrency(totalRequested)}</b>
                  </Typography>
                  <Typography variant="body2" color={overAllocated ? 'error.main' : remainingAllocated > 0 ? 'success.main' : 'text.primary'}>
                    Remaining: <b>{formatCurrency(remainingAllocated)}</b>
                  </Typography>
                </Stack>
                {overAllocated && (
                  <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.75 }}>
                    Total requested exceeds allocated amount. Reduce one or more subparts before saving.
                  </Typography>
                )}
                {claimEditable && allocatedAmount > 0 && remainingAllocated > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    Tip: keep Request 1 as a partial amount, then click &quot;Add Payment Subpart&quot; for the next installment
                    (remaining {formatCurrency(remainingAllocated)} will be filled automatically).
                  </Typography>
                )}
              </Box>

              {claimRequestsArray.fields.map((field, index) => {
                const requested = Number(claimRows[index]?.amountRequested) || 0;
                const rowTds = Math.round((requested * CLAIM_TDS_PERCENT) / 100);
                const rowAfterTds = Math.round(requested - rowTds);
                // New (unsaved) rows stay editable even after previous requests were approved/paid
                const rowEditable = claimEditable || (reRequestMode && !claimRows[index]?._id);
                return (
                  <Box
                    key={field.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Payment Subpart {index + 1}
                        {allocatedAmount > 0 && requested > 0
                          ? ` · ${Math.min(100, Math.round((requested / allocatedAmount) * 100))}% of allocated`
                          : ''}
                      </Typography>
                      {rowEditable && claimRequestsArray.fields.length > 1 && (
                        <IconButton size="small" onClick={() => claimRequestsArray.remove(index)} aria-label="Remove subpart">
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      )}
                    </Stack>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <RHFDatePicker
                          name={`claimRequests.${index}.date`}
                          label="Date"
                          disabled={!rowEditable && !clearedEditable}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField
                          name={`claimRequests.${index}.amountRequested`}
                          label="Amount Requested (this subpart)"
                          type="number"
                          disabled={!rowEditable}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={`After TDS (${CLAIM_TDS_PERCENT}%)`}
                          value={
                            requested > 0
                              ? `${formatCurrency(rowAfterTds)}  (TDS ${formatCurrency(rowTds)})`
                              : '—'
                          }
                          size="small"
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField
                          name={`claimRequests.${index}.amountCleared`}
                          label="Amount Cleared"
                          type="number"
                          disabled={!clearedEditable}
                          helperText={canApprove ? 'Filled by admin' : 'Set by admin when claim is cleared'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <RHFTextField
                          name={`claimRequests.${index}.note`}
                          label="Note (optional)"
                          disabled={!rowEditable && !clearedEditable}
                          placeholder="e.g. 1st installment / after commissioning"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}

              {(claimEditable || reRequestMode) && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addPaymentSubpart}
                  disabled={allocatedAmount > 0 && remainingAllocated <= 0}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {remainingAllocated > 0
                    ? `Add next subpart (remaining ${formatCurrency(remainingAllocated)})`
                    : 'Add Payment Subpart'}
                </Button>
              )}

              <Divider />
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                  Totals across all payment subparts
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    Total Requested: <b>{formatCurrency(totalRequested)}</b>
                    {allocatedAmount > 0 ? ` / ${formatCurrency(allocatedAmount)} allocated` : ''}
                  </Typography>
                  <Typography variant="body2">
                    Total After TDS: <b>{formatCurrency(totalAfterTds)}</b>
                    {totalRequested > 0 ? ` (TDS ${formatCurrency(totalTds)})` : ''}
                  </Typography>
                  <Typography variant="body2">
                    Total Cleared: <b>{formatCurrency(totalCleared)}</b>
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Typography variant="body2" color={mandatoryOk ? 'success.main' : 'text.secondary'} sx={{ mb: 2 }}>
              {mandatoryOk
                ? 'All mandatory documents are in place.'
                : 'Save the checklist, signed checklist, and work photos above to enable claim submission.'}
            </Typography>
            {[CLAIM_STATUS.NOT_SUBMITTED, CLAIM_STATUS.REJECTED].includes(station.claimStatus) && !(totalRequested > 0) && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                Add at least one payment subpart and click &quot;Save Changes&quot; before submitting for approval.
              </Typography>
            )}
            {[CLAIM_STATUS.NOT_SUBMITTED, CLAIM_STATUS.REJECTED].includes(station.claimStatus) && totalRequested > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                On submit, selected admins receive a WhatsApp alert with the signed checklist PDF attached.
              </Typography>
            )}
            {reRequestMode && remainingAllocated > 0 && !hasNewRequest && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {formatCurrency(remainingAllocated)} still remaining — click &quot;Add Payment Subpart&quot; to request the
                next installment.
              </Typography>
            )}
            {hasNewRequest && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Click &quot;Submit New Request&quot; to save this subpart and send it for approval (admins get a WhatsApp
                alert).
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {[CLAIM_STATUS.NOT_SUBMITTED, CLAIM_STATUS.REJECTED].includes(station.claimStatus) && (
                <Button
                  variant="contained"
                  disabled={!mandatoryOk || !canManage || actionSubmitting || !(station.amountClaimed > 0 || totalRequested > 0)}
                  onClick={() => runAction(submitStationClaim, { id: project._id, stationId: station._id }, 'Claim submitted for approval')}
                >
                  Submit for Approval
                </Button>
              )}
              {hasNewRequest && (
                <Button
                  variant="contained"
                  disabled={!mandatoryOk || actionSubmitting || submitting || overAllocated}
                  onClick={handleReRequest}
                >
                  Submit New Request
                </Button>
              )}
              {station.claimStatus === CLAIM_STATUS.PENDING_APPROVAL && (
                <Stack spacing={0.5}>
                  <StatusBadge status="Pending Approval" />
                  <Typography variant="caption" color="text.secondary">
                    Requests are locked while waiting for admin approval. You can request the remaining amount once this
                    is approved.
                  </Typography>
                </Stack>
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
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', height: '100%' }}>
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
          <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
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
