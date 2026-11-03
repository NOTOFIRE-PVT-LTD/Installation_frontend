import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ConfirmDialog from '../common/ConfirmDialog';
import DataTable from '../common/DataTable/DataTable';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { leaveApi } from '../../api/leaveApi';
import { ROLES } from '../../utils/constants';

function formatReviewedAt(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

export default function LeaveApprovalsPanel({ title, toolbarStart }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [rows, setRows] = useState([]);
  const [approveId, setApproveId] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [pending, setPending] = useState(false);

  const load = async () => {
    try {
      const { data } = await leaveApi.list({ pageSize: 50 });
      const items = data.data || [];
      items.sort((a, b) => Number(a.status !== 'PENDING') - Number(b.status !== 'PENDING'));
      setRows(items);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load leave', severity: 'error' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, decision, adminComment) => {
    setPending(true);
    try {
      await leaveApi.review(id, { decision, adminComment });
      dispatch(showSnackbar({ message: decision === 'APPROVED' ? 'Leave approved' : 'Leave rejected' }));
      setApproveId(null);
      setRejectRow(null);
      setRejectReason('');
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Review failed', severity: 'error' }));
    } finally {
      setPending(false);
    }
  };

  const columns = [
    {
      field: 'salesperson',
      headerName: 'Person',
      minWidth: 150,
      valueGetter: (_v, row) => row.salesperson?.name || '—',
    },
    {
      field: 'requestedAt',
      headerName: 'Requested on',
      minWidth: 160,
      valueGetter: (_v, row) => formatReviewedAt(row.requestedAt || row.createdAt),
    },
    { field: 'fromDate', headerName: 'From', minWidth: 110 },
    { field: 'toDate', headerName: 'To', minWidth: 110 },
    {
      field: 'leaveTime',
      headerName: 'Time',
      minWidth: 120,
      valueGetter: (_v, row) => [row.startTime, row.endTime].filter(Boolean).join(' – ') || 'Full day',
    },
    { field: 'reason', headerName: 'Reason', minWidth: 200, flex: 1 },
    { field: 'payType', headerName: 'Pay', minWidth: 100 },
    {
      field: 'status',
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
    {
      field: 'reviewedAt',
      headerName: 'Reviewed at',
      minWidth: 160,
      valueGetter: (_v, row) => (row.reviewedAt ? formatReviewedAt(row.reviewedAt) : '—'),
    },
    { field: 'adminComment', headerName: 'Admin comment', minWidth: 160 },
    ...(isAdmin
      ? [
          {
            field: 'decide',
            headerName: 'Decision',
            minWidth: 200,
            sortable: false,
            renderCell: (params) =>
              params.row.status === 'PENDING' ? (
                <Stack direction="row" spacing={0.75} onClick={(e) => e.stopPropagation()}>
                  <Button size="small" variant="contained" onClick={() => setApproveId(params.row._id)}>
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

  return (
    <>
      {title ? (
        <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>{title}</Typography>
      ) : null}
      <DataTable
        columns={columns}
        rows={rows}
        totalCount={rows.length}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        toolbarStart={toolbarStart}
        emptyMessage="No leave requests."
      />
      <ConfirmDialog
        open={Boolean(approveId)}
        title="Approve leave"
        message="Confirm this leave request as approved."
        confirmLabel="Approve"
        onClose={() => setApproveId(null)}
        onConfirm={() => review(approveId, 'APPROVED', '')}
        loading={pending}
      />
      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject leave</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
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
            disabled={pending || !rejectReason.trim()}
            onClick={() => review(rejectRow._id, 'REJECTED', rejectReason.trim())}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
