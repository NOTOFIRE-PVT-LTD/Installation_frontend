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

export default function VisitApprovalsPage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [items, setItems] = useState([]);
  const [approveId, setApproveId] = useState(null);
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
      dispatch(showSnackbar({ message: decision === 'APPROVED' ? 'Approved as missed' : 'Rejected' }));
      setApproveId(null);
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
      headerName: 'Reason',
      minWidth: 200,
      flex: 1,
      valueGetter: (_v, row) => [row.missedReason, row.missedExplanation].filter(Boolean).join(' — ') || '—',
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
      headerName: 'Visit',
      minWidth: 100,
      sortable: false,
      renderCell: (params) =>
        params.row.visit?._id ? (
          <Button size="small" onClick={() => navigate(`/visits/${params.row.visit._id}`)}>
            View
          </Button>
        ) : (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>—</Typography>
        ),
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
      {!embedded && <PageHeader title="Visit Approvals" subtitle="Missed and incomplete visits waiting for review" />}
      <DataTable
        columns={columns}
        rows={items}
        totalCount={items.length}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        emptyMessage="No visit requests."
      />

      <ConfirmDialog
        open={Boolean(approveId)}
        title="Approve missed visit"
        message="This keeps the original plan and records the missed reason. It will not mark the visit completed."
        confirmLabel="Approve"
        onClose={() => setApproveId(null)}
        onConfirm={() => review(approveId, 'APPROVED')}
        loading={busy}
      />
      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject missed visit</DialogTitle>
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
