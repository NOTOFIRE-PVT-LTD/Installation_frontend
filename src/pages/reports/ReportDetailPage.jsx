import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { usePermission } from '../../hooks/usePermission';
import { fetchReportById, verifyReport } from '../../features/reports/reportsThunks';
import { clearCurrent } from '../../features/reports/reportsSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDate, formatPercent } from '../../utils/formatters';
import { REPORT_STATUS } from '../../utils/constants';

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value}
      </Typography>
    </Grid>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const canVerify = usePermission('reports');
  const { current: report, currentStatus } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchReportById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  const handleVerify = async () => {
    try {
      await dispatch(verifyReport(id)).unwrap();
      dispatch(showSnackbar({ message: 'Report verified successfully' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to verify report', severity: 'error' }));
    }
  };

  if (currentStatus === 'loading' || !report) {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <PageHeader
        title="Report Details"
        subtitle={report.project?.projectName}
        actions={
          <Stack direction="row" spacing={1}>
            {canVerify && report.status === REPORT_STATUS.PENDING && (
              <Button startIcon={<CheckCircleIcon />} variant="contained" color="success" onClick={handleVerify}>
                Verify Report
              </Button>
            )}
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reports')}>
              Back
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Grid container spacing={3}>
          <Field label="Status" value={<StatusBadge status={report.status} />} />
          <Field label="Submitted By" value={report.submittedBy?.name} />
          <Field label="Date" value={formatDate(report.date)} />
          <Field label="Progress" value={formatPercent(report.progressPercentage)} />
          <Field label="Material Used" value={report.materialUsed || '-'} />
          <Field label="Remarks" value={report.remarks || '-'} />
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Work Description
            </Typography>
            <Typography variant="body1">{report.workDescription}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Site Photos
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
          {report.sitePhotos?.map((photo) => (
            <Box
              key={photo.publicId}
              component="a"
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ width: 140, height: 140, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
            >
              <Box component="img" src={photo.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Stack>

        {report.siteVideo && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Site Video
            </Typography>
            <Box component="video" src={report.siteVideo.url} controls sx={{ maxWidth: 480, borderRadius: 2 }} />
          </>
        )}
      </Paper>
    </>
  );
}
