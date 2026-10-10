import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { usePermission } from '../../hooks/usePermission';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import QuotationMasterDialog, { MASTER_LABELS } from './QuotationMasterDialog';
import QuotationProductsPanel from './QuotationProductsPanel';
import { apiErrorMessage } from './quotationUtils';

const KINDS = ['company', 'party', 'terms'];
const PRODUCTS_TAB = 'product';
const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function QuotationMastersPanel() {
  const [kind, setKind] = useState(PRODUCTS_TAB);

  return (
    <>
      <Tabs value={kind} onChange={(_e, next) => setKind(next)} sx={{ mb: 2 }}>
        <Tab value={PRODUCTS_TAB} label="Products" />
        {KINDS.map((k) => (
          <Tab key={k} value={k} label={MASTER_LABELS[k].plural} />
        ))}
      </Tabs>
      {kind === PRODUCTS_TAB ? <QuotationProductsPanel /> : <MasterRecordsPanel kind={kind} />}
    </>
  );
}

function MasterRecordsPanel({ kind }) {
  const dispatch = useAppDispatch();
  const canManage = !usePermission('quotationsOwnOnly');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [dialog, setDialog] = useState({ open: false, record: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isTerms = kind === 'terms';

  const load = () => {
    setLoading(true);
    const params = { page: page + 1, pageSize: rowsPerPage };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    quotationApi
      .listMasters(kind, params)
      .then((res) => {
        const items = res.data?.data || [];
        const count = res.data?.meta?.total ?? items.length;
        if (!items.length && count > 0 && page > 0) {
          setPage(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
          return;
        }
        setRows(items);
        setTotal(count);
      })
      .catch((err) => {
        setRows([]);
        setTotal(0);
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load records'), severity: 'error' }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSearch('');
    setPage(0);
  }, [kind]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, page, rowsPerPage, debouncedSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await quotationApi.removeMaster(confirmDelete._id);
      dispatch(showSnackbar({ message: `${MASTER_LABELS[kind].singular} deleted` }));
      setConfirmDelete(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to delete'), severity: 'error' }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isTerms ? 'Search by title or content…' : 'Search by name, GSTIN, contact, phone, email, address…'
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialog({ open: true, record: null })}
          sx={{ flexShrink: 0 }}
        >
          Add {MASTER_LABELS[kind].singular}
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{isTerms ? 'Title' : 'Name'}</TableCell>
              {isTerms ? (
                <TableCell>Content</TableCell>
              ) : (
                <>
                  <TableCell>GSTIN</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address</TableCell>
                </>
              )}
              {canManage && (
                <TableCell align="right" width={100}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                {isTerms ? (
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography variant="body2" noWrap title={row.content}>
                      {row.content || '-'}
                    </Typography>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>{row.gstin || '-'}</TableCell>
                    <TableCell>{[row.contactPerson, row.phone, row.email].filter(Boolean).join(' · ') || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap title={row.address}>
                        {row.address || '-'}
                      </Typography>
                    </TableCell>
                  </>
                )}
                {canManage && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setDialog({ open: true, record: row })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setConfirmDelete(row)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={(isTerms ? 2 : 4) + (canManage ? 1 : 0)}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {debouncedSearch.trim()
                        ? `No ${MASTER_LABELS[kind].plural.toLowerCase()} match your search.`
                        : `No ${MASTER_LABELS[kind].plural.toLowerCase()} yet.`}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(_event, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </TableContainer>

      <QuotationMasterDialog
        open={dialog.open}
        kind={kind}
        record={dialog.record}
        onClose={() => setDialog({ open: false, record: null })}
        onSaved={load}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete ${MASTER_LABELS[kind].singular}`}
        message={`Delete "${confirmDelete?.name}"? Existing quotations keep their saved details.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setConfirmDelete(null)}
      />
    </>
  );
}
