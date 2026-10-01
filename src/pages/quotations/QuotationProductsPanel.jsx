import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import QuotationProductDialog from './QuotationProductDialog';
import { apiErrorMessage, money } from './quotationUtils';

export default function QuotationProductsPanel() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [dialog, setDialog] = useState({ open: false, product: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    quotationApi
      .listProducts(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {})
      .then((res) => setRows(res.data?.data || []))
      .catch((err) => {
        setRows([]);
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load products'), severity: 'error' }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await quotationApi.removeProduct(confirmDelete._id);
      dispatch(showSnackbar({ message: 'Product deleted' }));
      setConfirmDelete(null);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to delete product'), severity: 'error' }));
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
          placeholder="Search by description, model, category, approvals…"
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
          onClick={() => setDialog({ open: true, product: null })}
          sx={{ flexShrink: 0 }}
        >
          Add Product
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={56} />
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Approvals</TableCell>
              <TableCell>Datasheet</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right" width={100}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id} hover>
                <TableCell>
                  <Avatar variant="rounded" src={row.picture?.url || undefined} sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}>
                    <InventoryIcon fontSize="small" color="action" />
                  </Avatar>
                </TableCell>
                <TableCell sx={{ maxWidth: 420 }}>
                  <Typography variant="body2" fontWeight={600} noWrap title={row.description}>
                    {row.description || row.modelNo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Model: {row.modelNo || '-'} · Unit: {row.unit || 'Nos'}
                  </Typography>
                </TableCell>
                <TableCell>{row.category || '-'}</TableCell>
                <TableCell>{row.approvals || '-'}</TableCell>
                <TableCell>
                  {row.datasheet?.url ? (
                    <Link href={row.datasheet.url} target="_blank" rel="noopener" variant="body2">
                      View
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {money(row.price)}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setDialog({ open: true, product: row })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setConfirmDelete(row)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {search ? 'No products match your search.' : 'No products yet. Click "Add Product" to add one.'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <QuotationProductDialog
        open={dialog.open}
        product={dialog.product}
        onClose={() => setDialog({ open: false, product: null })}
        onSaved={load}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Product"
        message={`Delete "${confirmDelete?.description || confirmDelete?.modelNo}"? Existing quotations keep their saved lines.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setConfirmDelete(null)}
      />
    </>
  );
}
