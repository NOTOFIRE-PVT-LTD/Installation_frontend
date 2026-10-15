import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { deliveryChallanApi } from '../../api/deliveryChallanApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import { shortCompanyName } from '../proformaInvoices/piUtils';
import DeliveryChallanDrawer from './DeliveryChallanDrawer';
import { downloadDeliveryChallanPdf } from './deliveryChallanPdf';
import { dcToForm, emptyDcForm } from './dcUtils';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function DeliveryChallansPage() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [companies, setCompanies] = useState([]);
  const [parties, setParties] = useState([]);
  const [drawer, setDrawer] = useState({ open: false, dc: null, initialValues: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deliveryChallanApi.list({ page: page + 1, pageSize, search: debouncedSearch || undefined });
      setRows(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load Delivery Challans'), severity: 'error' }));
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

  useEffect(() => {
    Promise.all([deliveryChallanApi.companies(), deliveryChallanApi.parties()])
      .then(([companyRes, partyRes]) => {
        setCompanies(companyRes.data?.data || []);
        setParties(partyRes.data?.data || []);
      })
      .catch((err) => dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load companies'), severity: 'error' })));
  }, [dispatch]);

  const defaultCompany = companies.find((c) => /notofire/i.test(c.name)) || companies[0] || null;

  const openCreate = () => setDrawer({ open: true, dc: null, initialValues: emptyDcForm(defaultCompany) });
  const openEdit = (dc) => setDrawer({ open: true, dc, initialValues: dcToForm(dc) });
  const closeDrawer = () => setDrawer((prev) => ({ ...prev, open: false }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deliveryChallanApi.remove(deleteTarget._id);
      dispatch(showSnackbar({ message: `Delivery Challan ${deleteTarget.dcNumber} deleted` }));
      setDeleteTarget(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to delete Delivery Challan'), severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Delivery Challans" subtitle="Manage your Delivery Challans" />

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>All Delivery Challans</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Create, edit, download, and delete Delivery Challans.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create DC
          </Button>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by DC number, party, receiver..."
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
                <TableCell>DC Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Receiver</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {debouncedSearch ? 'No Delivery Challans match your search' : 'No Delivery Challans yet'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id} hover sx={{ '& td': { fontSize: '0.8125rem' } }}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.dcNumber}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.dcDate)}</TableCell>
                    <TableCell>{row.recipient?.name || '-'}</TableCell>
                    <TableCell>{row.receiverName || '-'}</TableCell>
                    <TableCell>
                      {row.company?.name ? (
                        <Chip size="small" label={shortCompanyName(row.company.name)} sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 600 }} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton size="small" onClick={() => downloadDeliveryChallanPdf(row)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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

      <DeliveryChallanDrawer
        open={drawer.open}
        dc={drawer.dc}
        initialValues={drawer.initialValues}
        companies={companies}
        parties={parties}
        onClose={closeDrawer}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Delivery Challan?"
        message={`${deleteTarget?.dcNumber || 'This Delivery Challan'} and its attachments will be permanently deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </Box>
  );
}
