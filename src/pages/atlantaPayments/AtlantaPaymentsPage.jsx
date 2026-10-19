import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { atlantaPaymentApi } from '../../api/atlantaPaymentApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import { inr } from './atlantaUtils';
import AtlantaPaymentDrawer from './AtlantaPaymentDrawer';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AtlantaPaymentsPage() {
  const dispatch = useAppDispatch();
  const [drawer, setDrawer] = useState({ open: false, payment: null });
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await atlantaPaymentApi.list({ page: page + 1, pageSize, search: debouncedSearch || undefined });
      setRows(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load payment entries'), severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await atlantaPaymentApi.remove(deleteTarget._id);
      dispatch(showSnackbar({ message: `Payment entry "${deleteTarget.fileName}" deleted` }));
      setDeleteTarget(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to delete payment entry'), severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Atlanta Payments" subtitle="Track employee travel expenses, invoices and payments received" />

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>All Payment Entries</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Create, edit and delete Atlanta payment records.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawer({ open: true, payment: null })}>
            New Payment Entry
          </Button>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by file name, consignee, employee..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50', '& th': { fontWeight: 700, fontSize: '0.8125rem' } }}>
                <TableCell>File / Record Name</TableCell>
                <TableCell>Consignee</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell align="right">Total Expense</TableCell>
                <TableCell align="right">Received</TableCell>
                <TableCell align="right">Amount to Give</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {debouncedSearch ? 'No payment entries match your search' : 'No payment entries yet'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const grandExpense = (row.totalTada || 0) + (row.totalExpense || 0) + (row.totalTravelExpenses || 0);
                  return (
                    <TableRow key={row._id} hover sx={{ '& td': { fontSize: '0.8125rem' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.fileName}</TableCell>
                      <TableCell>{row.consigneeName || '-'}</TableCell>
                      <TableCell>
                        {row.employeeName}
                        {row.designation && (
                          <Typography component="span" color="text.secondary" sx={{ fontSize: '0.75rem', ml: 0.75 }}>
                            ({row.designation})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDate ? formatDate(row.paymentDate) : '-'}</TableCell>
                      <TableCell align="right">{inr(grandExpense)}</TableCell>
                      <TableCell align="right">{inr(row.totalReceivedAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: row.amountToGive > 0 ? 'error.main' : 'success.main' }}>
                        {inr(row.amountToGive)}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setDrawer({ open: true, payment: row })}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(_event, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
        />
      </Paper>

      <AtlantaPaymentDrawer
        open={drawer.open}
        payment={drawer.payment}
        onClose={() => setDrawer((prev) => ({ ...prev, open: false }))}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete payment entry?"
        message={`"${deleteTarget?.fileName || 'This entry'}" and its uploaded proofs will be permanently deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </Box>
  );
}
