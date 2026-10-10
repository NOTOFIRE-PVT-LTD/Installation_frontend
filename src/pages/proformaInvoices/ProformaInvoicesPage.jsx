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
import { proformaInvoiceApi } from '../../api/proformaInvoiceApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import ProformaInvoiceDrawer from './ProformaInvoiceDrawer';
import SelectQuotationDialog from './SelectQuotationDialog';
import { downloadProformaInvoicePdf } from './proformaInvoicePdf';
import { PI_TEMPLATES, emptyPiForm, piToForm, quotationToForm, shortCompanyName } from './piUtils';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function templateLabel(value) {
  return (PI_TEMPLATES.find((t) => t.value === value)?.label || value || 'Standard').toUpperCase();
}

export default function ProformaInvoicesPage() {
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
  const [drawer, setDrawer] = useState({ open: false, pi: null, initialValues: null });
  const [quotationPickerOpen, setQuotationPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await proformaInvoiceApi.list({ page: page + 1, pageSize, search: debouncedSearch || undefined });
      setRows(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load Proforma Invoices'), severity: 'error' }));
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
    Promise.all([proformaInvoiceApi.companies(), proformaInvoiceApi.parties()])
      .then(([companyRes, partyRes]) => {
        setCompanies(companyRes.data?.data || []);
        setParties(partyRes.data?.data || []);
      })
      .catch((err) => dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load companies'), severity: 'error' })));
  }, [dispatch]);

  const defaultCompany = companies.find((c) => /notofire/i.test(c.name)) || companies[0] || null;

  const openDirect = () => setDrawer({ open: true, pi: null, initialValues: emptyPiForm(defaultCompany) });
  const openEdit = (pi) => setDrawer({ open: true, pi, initialValues: piToForm(pi) });
  const closeDrawer = () => setDrawer((prev) => ({ ...prev, open: false }));

  const handleQuotationSelected = (quotation) => {
    setQuotationPickerOpen(false);
    setDrawer({ open: true, pi: null, initialValues: quotationToForm(quotation, companies) });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await proformaInvoiceApi.remove(deleteTarget._id);
      dispatch(showSnackbar({ message: `Proforma Invoice ${deleteTarget.piNumber} deleted` }));
      setDeleteTarget(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to delete Proforma Invoice'), severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Proforma Invoices" subtitle="Manage your Proforma Invoices" />

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>All Proforma Invoices</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Create, edit, download, and delete Proforma Invoices.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setQuotationPickerOpen(true)}>
              From Quotation
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openDirect}>
              Create PI Directly
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search by PI number, party, quotation..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: { xs: '100%', sm: 380 } }}
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
                <TableCell>PI Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Party</TableCell>
                <TableCell>Quotation</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Template</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {debouncedSearch ? 'No Proforma Invoices match your search' : 'No Proforma Invoices yet'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id} hover sx={{ '& td': { fontSize: '0.8125rem' } }}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.piNumber}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.piDate)}</TableCell>
                    <TableCell>{row.party?.name || '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.quotation?.quotationNo || '-'}</TableCell>
                    <TableCell>
                      {row.company?.name ? (
                        <Chip size="small" label={shortCompanyName(row.company.name)} sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 600 }} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={templateLabel(row.template)} sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton size="small" onClick={() => downloadProformaInvoicePdf(row)}>
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

      <SelectQuotationDialog
        open={quotationPickerOpen}
        onClose={() => setQuotationPickerOpen(false)}
        onSelect={handleQuotationSelected}
      />

      <ProformaInvoiceDrawer
        open={drawer.open}
        pi={drawer.pi}
        initialValues={drawer.initialValues}
        companies={companies}
        parties={parties}
        onClose={closeDrawer}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Proforma Invoice?"
        message={`${deleteTarget?.piNumber || 'This Proforma Invoice'} will be permanently deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </Box>
  );
}
