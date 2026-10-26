import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ConfirmDialog from '../common/ConfirmDialog';
import DataTable from '../common/DataTable/DataTable';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitExpenseApi } from '../../api/visitExpenseApi';
import { ROLES, VISIT_EXPENSE_STATUS } from '../../utils/constants';

export default function ExpenseApprovalsPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [rows, setRows] = useState([]);
  const [approveId, setApproveId] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [pending, setPending] = useState(false);

  const load = async () => {
    try {
      const { data } = await visitExpenseApi.list({ pageSize: 50 });
      const items = data.data || [];
      items.sort((a, b) => Number(a.status !== VISIT_EXPENSE_STATUS.PENDING_APPROVAL) - Number(b.status !== VISIT_EXPENSE_STATUS.PENDING_APPROVAL));
      setRows(items);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load expenses', severity: 'error' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, decision, adminComment) => {
    setPending(true);
    try {
      await visitExpenseApi.review(id, { decision, adminComment });
      dispatch(showSnackbar({ message: decision === 'APPROVED' ? 'Expense approved' : 'Expense rejected' }));
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
    { field: 'date', headerName: 'Date', minWidth: 120 },
    {
      field: 'salesperson',
      headerName: 'Person',
      minWidth: 150,
      valueGetter: (_v, row) => row.salesperson?.name || '—',
    },
    {
      field: 'visits',
      headerName: 'Visits',
      minWidth: 80,
      valueGetter: (_v, row) => row.items?.length || 0,
    },
    { field: 'totalKm', headerName: 'Km', minWidth: 80 },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      minWidth: 120,
      valueGetter: (_v, row) => `₹${Number(row.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    { field: 'status', headerName: 'Status', minWidth: 160 },
    ...(isAdmin
      ? [
          {
            field: 'actions',
            headerName: 'Review',
            minWidth: 200,
            sortable: false,
            renderCell: ({ row }) =>
              row.status === VISIT_EXPENSE_STATUS.PENDING_APPROVAL ? (
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => setApproveId(row._id)}>
                    Approve
                  </Button>
                  <Button size="small" color="error" onClick={() => setRejectRow(row)}>
                    Reject
                  </Button>
                </Stack>
              ) : (
                '—'
              ),
          },
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        columns={isAdmin ? columns : columns.filter((c) => c.field !== 'salesperson')}
        rows={rows}
        totalCount={rows.length}
        page={0}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onRowClick={(row) => navigate(`/expenses/${row._id}`)}
      />
      <ConfirmDialog
        open={Boolean(approveId)}
        title="Approve expense?"
        message="This marks the day's travel expense as approved."
        confirmLabel="Approve"
        loading={pending}
        onClose={() => setApproveId(null)}
        onConfirm={() => review(approveId, 'APPROVED')}
      />
      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reject expense</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectRow(null)}>Cancel</Button>
          <Button color="error" disabled={pending || !rejectReason.trim()} onClick={() => review(rejectRow._id, 'REJECTED', rejectReason)}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
