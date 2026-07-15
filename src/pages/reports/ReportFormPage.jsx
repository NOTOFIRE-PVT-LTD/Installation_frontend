import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../components/common/PageHeader';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import VideoDropzone from '../../components/common/FileUpload/VideoDropzone';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProjectOptions } from '../../features/projects/projectsThunks';
import { fetchReportById, createReport, updateReport } from '../../features/reports/reportsThunks';
import { clearCurrent } from '../../features/reports/reportsSlice';
import { showSnackbar } from '../../features/ui/uiSlice';

const schema = yup.object({
  project: yup.string().required('Project is required'),
  date: yup.string().required('Date is required'),
  workDescription: yup.string().required('Work description is required'),
  progressPercentage: yup.number().typeError('Must be a number').min(0).max(100).required('Progress % is required'),
  materialUsed: yup.string().notRequired(),
  remarks: yup.string().notRequired(),
});

export default function ReportFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { options: projectOptions } = useAppSelector((state) => state.projects);
  const { current: report, currentStatus } = useAppSelector((state) => state.reports);

  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { project: '', date: null, workDescription: '', progressPercentage: '', materialUsed: '', remarks: '' },
  });

  useEffect(() => {
    dispatch(fetchProjectOptions());
    if (isEdit) dispatch(fetchReportById(id));
    return () => dispatch(clearCurrent());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isEdit && report) {
      methods.reset({
        project: report.project?._id,
        date: report.date?.slice(0, 10),
        workDescription: report.workDescription,
        progressPercentage: report.progressPercentage,
        materialUsed: report.materialUsed || '',
        remarks: report.remarks || '',
      });
      setPhotos(report.sitePhotos || []);
      setVideo(report.siteVideo || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const onSubmit = async (values) => {
    if (!isEdit && photos.length === 0) {
      setPhotoError('At least one site photo is required');
      return;
    }
    setPhotoError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('project', values.project);
    formData.append('date', values.date);
    formData.append('workDescription', values.workDescription);
    formData.append('progressPercentage', values.progressPercentage);
    formData.append('materialUsed', values.materialUsed || '');
    formData.append('remarks', values.remarks || '');

    const newPhotoFiles = photos.filter((p) => p.file).map((p) => p.file);
    newPhotoFiles.forEach((file) => formData.append('sitePhotos', file));
    if (video?.file) formData.append('siteVideo', video.file);

    try {
      if (isEdit) {
        await dispatch(updateReport({ id, formData })).unwrap();
        dispatch(showSnackbar({ message: 'Report updated successfully' }));
      } else {
        await dispatch(createReport(formData)).unwrap();
        dispatch(showSnackbar({ message: 'Report submitted successfully' }));
      }
      navigate('/reports');
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save report', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && currentStatus === 'loading') {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <FormProvider {...methods}>
      <PageHeader
        title={isEdit ? 'Edit Report' : 'Submit Daily Report'}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        }
      />
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }} component="form" onSubmit={methods.handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <RHFSelect
              name="project"
              label="Project"
              options={projectOptions.map((p) => ({ value: p._id, label: p.projectName }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFDatePicker name="date" label="Date" />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="workDescription" label="Work Description" multiline minRows={3} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="progressPercentage" label="Progress %" type="number" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="materialUsed" label="Material Used" />
          </Grid>
          <Grid item xs={12}>
            <RHFTextField name="remarks" label="Remarks" multiline minRows={2} />
          </Grid>
          <Grid item xs={12}>
            <ImageDropzone value={photos} onChange={setPhotos} error={Boolean(photoError)} helperText={photoError} />
          </Grid>
          <Grid item xs={12}>
            <VideoDropzone value={video} onChange={setVideo} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </FormProvider>
  );
}
