import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/common/DataTable/DataTable';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { formatIstDateTime } from '../../utils/attendanceFormat';
import { ROLES } from '../../utils/constants';

export default function VisitApprovalsPage({ embedded = false, toolbarStart }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [items, setItems] = useState([]);
  const [approveRow, setApproveRow] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await visitApi.approvals({ pageSize: 50 });
      const rows = data.data || [];
      rows.sort((a, b) => Number(a.decision !== 'PENDING') - Number(b.decision !== 'PENDING'));
      setItems(rows);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load approvals', severity: 'error' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, decision, reason) => {
    setBusy(true);
    try {
      await visitApi.review(id, { decision, rejectionReason: reason });
      dispatch(
        showSnackbar({
          message:
            decision === 'APPROVED'
              ? approveRow?.kind === 'OUT_OF_RANGE'
                ? 'Out-of-range visit approved'
                : 'Approved as missed'
              : 'Rejected',
        })
      );
      setApproveRow(null);
      setRejectRow(null);
      setRejectionReason('');
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Review failed', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      field: 'salesperson',
      headerName: 'Person',
      minWidth: 150,
      valueGetter: (_v, row) => row.visit?.salesperson?.name || '—',
    },
    {
      field: 'customer',
      headerName: 'Customer',
      minWidth: 160,
      valueGetter: (_v, row) => row.visit?.customer?.companyName || '—',
    },
    {
      field: 'kind',
      headerName: 'Type',
      minWidth: 130,
      renderCell: (params) => {
        const isOutOfRange = params.value === 'OUT_OF_RANGE';
        return (
          <Chip
            size="small"
            label={isOutOfRange ? 'OUT OF RANGE' : params.value || 'MISSED'}
            color={isOutOfRange ? 'warning' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        );
      },
    },
    {
      field: 'requestedAt',
      headerName: 'Requested on',
      minWidth: 160,
      valueGetter: (_v, row) => formatIstDateTime(row.requestedAt || row.createdAt),
    },
    {
      field: 'visitDate',
      headerName: 'Visit date',
      minWidth: 110,
      valueGetter: (_v, row) => row.visit?.visitDate || '—',
    },
    {
      field: 'plannedTime',
      headerName: 'Time',
      minWidth: 90,
      valueGetter: (_v, row) => formatPlanTime(row.visit?.plannedTime),
    },
    {
      field: 'purpose',
      headerName: 'Purpose',
      minWidth: 140,
      valueGetter: (_v, row) => row.visit?.purpose || '—',
    },
    {
      field: 'reason',
      headerName: 'Reason / Details',
      minWidth: 230,
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const dist = row.visit?.checkInDistanceM;
        return (
          <Stack spacing={0.25} sx={{ py: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.missedReason || (row.kind === 'OUT_OF_RANGE' ? 'Outside Location Exception' : 'Missed Visit')}
            </Typography>
            {dist != null && dist > 0 && (
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                📍 {dist} meters away from customer
              </Typography>
            )}
            {row.missedExplanation && (
              <Typography variant="caption" color="text.secondary">
                {row.missedExplanation}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'decision',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value === 'REJECTED' ? 'error' : 'primary'}
          variant={params.value === 'PENDING' ? 'outlined' : 'filled'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'reviewedBy',
      headerName: 'Reviewed by',
      minWidth: 140,
      valueGetter: (_v, row) => row.reviewedBy?.name || '—',
    },
    { field: 'rejectionReason', headerName: 'Admin comment', minWidth: 160 },
    {
      field: 'view',
      headerName: 'Photo & Details',
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        const v = params.row.visit;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {v?.checkInPhotoUrl && (
              <Box
                component="img"
                src={v.checkInPhotoUrl}
                alt="Selfie"
                sx={{ width: 32, height: 32, borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            {v?._id && (
              <Button size="small" onClick={() => navigate(`/visits/${v._id}`)}>
                View
              </Button>
            )}
          </Stack>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            field: 'decide',
            headerName: 'Decision',
            minWidth: 200,
            sortable: false,
            renderCell: (params) =>
              params.row.decision === 'PENDING' ? (
                <Stack direction="row" spacing={0.75} onClick={(e) => e.stopPropagation()}>
                  <Button size="small" variant="contained" onClick={() => setApproveRow(params.row)}>
                    Approve
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => setRejectRow(params.row)}>
                    Reject
                  </Button>
                </Stack>
              ) : (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>—</Typography>
              ),
          },
        ]
      : []),
  ];

  const isApproveOutOfRange = approveRow?.kind === 'OUT_OF_RANGE';

  return (
    <>
      {!embedded && <PageHeader title="Visit Approvals" subtitle="Missed visits and out-of-range location requests waiting for review" />}
      <DataTable
        columns={columns}
        rows={items}
        totalCount={items.length}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        toolbarStart={toolbarStart}
        emptyMessage="No visit requests."
      />

      <ConfirmDialog
        open={Boolean(approveRow)}
        title={isApproveOutOfRange ? 'Approve Out-of-Range Visit' : 'Approve Missed Visit'}
        message={
          isApproveOutOfRange
            ? 'This approves the location exception for this visit. The visit will be verified and marked as Completed.'
            : 'This keeps the original plan and records the missed reason. It will not mark the visit completed.'
        }
        confirmLabel="Approve"
        onClose={() => setApproveRow(null)}
        onConfirm={() => review(approveRow._id, 'APPROVED')}
        loading={busy}
      />
      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject visit request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectRow(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy || !rejectionReason.trim()}
            onClick={() => review(rejectRow._id, 'REJECTED', rejectionReason.trim())}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
