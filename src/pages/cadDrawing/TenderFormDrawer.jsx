import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import MixedFileDropzone from '../../components/common/FileUpload/MixedFileDropzone';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDivisions } from '../../features/divisions/divisionsThunks';
import { fetchProjectOptions } from '../../features/projects/projectsThunks';
import { fetchTenderById, createTender, updateTender } from '../../features/tenders/tendersThunks';
import { clearCurrent } from '../../features/tenders/tendersSlice';
import { showSnackbar } from '../../features/ui/uiSlice';

const schema = yup.object({
  division: yup.string().required('Division is required'),
  project: yup.string().notRequired(),
  tenderName: yup.string().required('Tender name is required'),
  date: yup.string().required('Date is required'),
});

export default function TenderFormDrawer({ open, tenderId, onClose, onSaved }) {
  const isEdit = Boolean(tenderId);
  const dispatch = useAppDispatch();
  const { current: tender, currentStatus } = useAppSelector((state) => state.tenders);
  const { items: divisions } = useAppSelector((state) => state.divisions);
  const { options: projectOptions } = useAppSelector((state) => state.projects);

  const [zone, setZone] = useState('');
  const [files, setFiles] = useState([]);
  const [initialFiles, setInitialFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { division: '', project: '', tenderName: '', date: null },
  });

  useEffect(() => {
    if (!open) return;
    dispatch(fetchDivisions({ pageSize: 100 }));
    dispatch(fetchProjectOptions());
    if (isEdit) {
      dispatch(fetchTenderById(tenderId));
    } else {
      setZone('');
      setFiles([]);
      setInitialFiles([]);
      methods.reset({ division: '', project: '', tenderName: '', date: null });
    }
    return () => dispatch(clearCurrent());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tenderId]);

  useEffect(() => {
    if (isEdit && tender && open) {
      setZone(tender.division?.zone || '');
      methods.reset({
        division: tender.division?._id || '',
        project: tender.project?._id || '',
        tenderName: tender.tenderName,
        date: tender.date?.slice(0, 10) || null,
      });
      setFiles(tender.files || []);
      setInitialFiles(tender.files || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender, open]);

  const zoneOptions = useMemo(() => [...new Set(divisions.map((d) => d.zone).filter(Boolean))], [divisions]);

  const divisionOptions = useMemo(
    () => divisions.filter((d) => d.zone === zone).map((d) => ({ value: d._id, label: d.name })),
    [divisions, zone]
  );

  const handleZoneChange = (newZone) => {
    setZone(newZone);
    // Division belongs to whichever zone was previously selected; changing zone invalidates it.
    methods.setValue('division', '', { shouldValidate: false });
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('division', values.division);
    if (values.project) formData.append('project', values.project);
    formData.append('tenderName', values.tenderName);
    formData.append('date', values.date);

    files.filter((f) => f.file).forEach((f) => formData.append('tenderFiles', f.file));

    if (isEdit) {
      const removedIds = initialFiles.filter((f) => !files.some((c) => c.publicId === f.publicId)).map((f) => f.publicId);
      formData.append('removeFileIds', JSON.stringify(removedIds));
    }

    try {
      let saved;
      if (isEdit) {
        saved = await dispatch(updateTender({ id: tenderId, formData })).unwrap();
        dispatch(showSnackbar({ message: 'Tender updated successfully' }));
      } else {
        saved = await dispatch(createTender(formData)).unwrap();
        dispatch(showSnackbar({ message: 'Tender created successfully' }));
      }
      onSaved?.(saved);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save tender', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const loading = isEdit && open && currentStatus === 'loading';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 560 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? 'Edit Tender' : 'Add Tender'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {loading ? (
            <Stack alignItems="center" sx={{ mt: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <FormProvider {...methods}>
              <Box component="form" id="tender-form" onSubmit={methods.handleSubmit(onSubmit)}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  1. Select Zone
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField select fullWidth label="Zone" value={zone} onChange={(e) => handleZoneChange(e.target.value)}>
                      <MenuItem value="" disabled>
                        Select a zone
                      </MenuItem>
                      {zoneOptions.map((z) => (
                        <MenuItem key={z} value={z}>
                          {z}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  2. Select Division
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <RHFSelect
                      name="division"
                      label="Division"
                      options={divisionOptions}
                      disabled={!zone}
                      helperText={!zone ? 'Select a zone first' : undefined}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  3. Tender Details
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <RHFTextField name="tenderName" label="Tender Name" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFDatePicker name="date" label="Date" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFSelect
                      name="project"
                      label="Project (optional)"
                      options={projectOptions.map((p) => ({ value: p._id, label: p.projectName }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MixedFileDropzone value={files} onChange={setFiles} label="Images / PDFs" />
                  </Grid>
                </Grid>
              </Box>
            </FormProvider>
          )}
        </Box>

        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2.5 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="tender-form" variant="contained" disabled={submitting || loading}>
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tender'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
