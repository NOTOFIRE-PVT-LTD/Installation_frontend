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
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { atlantaPaymentApi } from '../../api/atlantaPaymentApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import { inr } from './atlantaUtils';
import AtlantaPaymentDrawer from './AtlantaPaymentDrawer';
import { downloadAtlantaPaymentPdf } from './atlantaPaymentPdf';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AtlantaPaymentsPage() {
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const isOwnOnly = !isAdmin || Boolean(user?.permissions?.atlantaPaymentsOwnOnly);

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
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [actionRow, setActionRow] = useState(null);

  const handleOpenMenu = (event, row) => {
    event.stopPropagation();
    setActionAnchor(event.currentTarget);
    setActionRow(row);
  };

  const handleCloseMenu = () => {
    setActionAnchor(null);
    setActionRow(null);
  };

  const handleDownloadPdf = async (row) => {
    setDownloadingId(row._id);
    try {
      let payment = row;
      // Fetch full payment document if sub-arrays are missing or to ensure complete details
      if (!row.invoiceEntries || !row.travelExpenses || !row.paymentsReceived) {
        const res = await atlantaPaymentApi.getById(row._id);
        payment = res.data?.data || row;
      }
      await downloadAtlantaPaymentPdf(payment);
      dispatch(showSnackbar({ message: `PDF downloaded for "${payment.fileName || payment.employeeName}"` }));
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to download PDF'), severity: 'error' }));
    } finally {
      setDownloadingId(null);
    }
  };

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
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
              {isOwnOnly ? 'My Payment Entries' : 'All Payment Entries'}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {isOwnOnly
                ? 'View, edit and download your Atlanta payment records.'
                : 'Create, edit and delete Atlanta payment records.'}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawer({ open: true, payment: null })}>
            New Payment Entry
          </Button>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search by file name, consignee, employee..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: { xs: '100%', sm: 360 } }}
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
                        <Tooltip title="Actions">
                          <span>
                            <IconButton
                              size="small"
                              disabled={downloadingId === row._id}
                              onClick={(event) => handleOpenMenu(event, row)}
                              aria-label="Actions"
                            >
                              {downloadingId === row._id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <MoreVertIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
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
          sx={{
            '& .MuiTablePagination-toolbar': {
              justifyContent: 'flex-start',
              pl: 2,
            },
            '& .MuiTablePagination-spacer': {
              display: 'none',
            },
          }}
        />
      </Paper>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(31, 42, 68, 0.12)',
              minWidth: 160,
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) handleDownloadPdf(r);
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download PDF" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }} />
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) setDrawer({ open: true, payment: r });
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }} />
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) setDeleteTarget(r);
          }}
          sx={{ py: 1, color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, color: 'error.main' }} />
        </MenuItem>
      </Menu>

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
