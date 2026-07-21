import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PageHeader from '../../components/common/PageHeader';
import RejectClaimDialog from './RejectClaimDialog';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { fetchApprovalsQueue, approveStationClaim, rejectStationClaim } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ApprovalsQueuePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAdmin, permissions } = useAuth();
  const canApprove = isAdmin && Boolean(permissions?.claimApprovals);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingKey, setActingKey] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = () => {
    setLoading(true);
    dispatch(fetchApprovalsQueue())
      .unwrap()
      .then(setQueue)
      .catch((err) => dispatch(showSnackbar({ message: err || 'Failed to fetch approvals queue', severity: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (item) => {
    const key = `${item.projectId}-${item.stationId}`;
    setActingKey(key);
    try {
      await dispatch(approveStationClaim({ id: item.projectId, stationId: item.stationId })).unwrap();
      dispatch(showSnackbar({ message: 'Claim approved' }));
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to approve claim', severity: 'error' }));
    } finally {
      setActingKey(null);
    }
  };

  const handleReject = async (reason) => {
    const item = rejectTarget;
    const key = `${item.projectId}-${item.stationId}`;
    setActingKey(key);
    try {
      await dispatch(rejectStationClaim({ id: item.projectId, stationId: item.stationId, reason })).unwrap();
      dispatch(showSnackbar({ message: 'Claim rejected' }));
      setRejectTarget(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to reject claim', severity: 'error' }));
    } finally {
      setActingKey(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Approvals Queue" subtitle="Station claims waiting for approval, across every project" />

      {!canApprove && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Read-only view — only Admins with Projects access can approve or reject claims.
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" sx={{ mt: 6 }}>
          <CircularProgress />
        </Stack>
      ) : queue.length === 0 ? (
        <Typography color="text.secondary">No claims waiting for approval.</Typography>
      ) : (
        <Stack spacing={2}>
          {queue.map((item) => {
            const key = `${item.projectId}-${item.stationId}`;
            const isActing = actingKey === key;
            return (
              <Paper key={key} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {item.stationName}{' '}
                      <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                        — {item.projectName}
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Installer: {item.installerName || '—'} · Commissioned: {formatDate(item.commissioningDate)}
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={1}>
                    <Typography variant="h6" fontWeight={700}>
                      {formatCurrency(item.amountClaimed)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {canApprove && (
                        <>
                          <Button size="small" variant="contained" color="success" disabled={isActing} onClick={() => handleApprove(item)}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" disabled={isActing} onClick={() => setRejectTarget(item)}>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="small" onClick={() => navigate(`/projects/${item.projectId}/stations/${item.stationId}`)}>
                        View →
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <RejectClaimDialog
        open={Boolean(rejectTarget)}
        submitting={Boolean(actingKey)}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleReject}
      />
    </Box>
  );
}
