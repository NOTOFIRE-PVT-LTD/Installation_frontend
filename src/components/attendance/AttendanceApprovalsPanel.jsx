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
import { ROLES } from '../../utils/constants';
import { attendanceApi } from '../../api/attendanceApi';
import { formatIstDate, formatIstDateTime, formatIstTime } from '../../utils/attendanceFormat';

const KIND_LABELS = {
  MISSING_IN: 'Missing Punch In',
  MISSING_OUT: 'Missing Punch Out',
};

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

function TimeCell({ value, highlight = false }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: highlight && value ? 'primary.main' : 'text.primary' }}>
      {formatIstTime(value)}
    </Typography>
  );
}

export default function AttendanceApprovalsPanel({ title = 'Attendance approvals' }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [corrections, setCorrections] = useState([]);
  const [pending, setPending] = useState(false);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveId, setApproveId] = useState(null);

  const loadCorrections = async () => {
    try {
      const { data } = await attendanceApi.corrections({ pageSize: 50 });
      const rows = data.data || [];
      rows.sort((a, b) => Number(a.status !== 'PENDING') - Number(b.status !== 'PENDING'));
      setCorrections(rows);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load corrections', severity: 'error' }));
    }
  };

  useEffect(() => {
    loadCorrections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, decision, adminComment) => {
    setPending(true);
    try {
      await attendanceApi.reviewCorrection(id, { decision, adminComment });
      dispatch(showSnackbar({ message: decision === 'APPROVED' ? 'Correction approved' : 'Correction rejected' }));
      setApproveId(null);
      setRejectRow(null);
      setRejectReason('');
      loadCorrections();
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
      minWidth: 160,
      valueGetter: (_v, row) => row.salesperson?.name || '—',
    },
    {
      field: 'requestedAt',
      headerName: 'Requested on',
      minWidth: 160,
      valueGetter: (_v, row) => formatIstDateTime(row.requestedAt || row.createdAt),
    },
    {
      field: 'attendanceDate',
      headerName: 'For date',
      minWidth: 110,
      valueGetter: (_v, row) => formatIstDate(row.attendanceDate),
    },
    {
      field: 'kind',
      headerName: 'Type',
      minWidth: 150,
      valueGetter: (_v, row) => KIND_LABELS[row.kind] || row.kind,
    },
    {
      field: 'requestedPunchIn',
      headerName: 'Requested in',
      minWidth: 120,
      sortable: false,
      renderCell: (params) => <TimeCell value={params.row.requestedPunchIn} highlight />,
    },
    {
      field: 'requestedPunchOut',
      headerName: 'Requested out',
      minWidth: 130,
      sortable: false,
      renderCell: (params) => <TimeCell value={params.row.requestedPunchOut} highlight />,
    },
    {
      field: 'originalPunchIn',
      headerName: 'Original in',
      minWidth: 110,
      sortable: false,
      renderCell: (params) => <TimeCell value={params.row.originalPunchIn} />,
    },
    {
      field: 'originalPunchOut',
      headerName: 'Original out',
      minWidth: 120,
      sortable: false,
      renderCell: (params) => <TimeCell value={params.row.originalPunchOut} />,
    },
    { field: 'reason', headerName: 'Reason', minWidth: 220, flex: 1 },
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
        rows={corrections}
        totalCount={corrections.length}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        loading={false}
        emptyMessage="No correction requests."
      />

      <ConfirmDialog
        open={Boolean(approveId)}
        title="Approve attendance correction"
        message="The original timestamps stay on the request. Approved times will be written onto the attendance record."
        confirmLabel="Approve"
        onClose={() => setApproveId(null)}
        onConfirm={() => review(approveId, 'APPROVED', '')}
        loading={pending}
      />
      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject attendance correction</DialogTitle>
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
