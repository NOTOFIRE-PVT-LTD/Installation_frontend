import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { proformaInvoiceApi } from '../../api/proformaInvoiceApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage, money } from '../quotations/quotationUtils';

export default function SelectQuotationDialog({ open, onClose, onSelect }) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    proformaInvoiceApi
      .quotations({ search: debouncedSearch || undefined, pageSize: 50 })
      .then((res) => {
        if (active) setRows(res.data?.data || []);
      })
      .catch((err) => {
        if (active) dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load quotations'), severity: 'error' }));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, debouncedSearch, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Select a Quotation</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search by quotation number or party..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mt: 0.5, mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ minHeight: 240, maxHeight: 420, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : rows.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 6, fontSize: '0.8125rem' }}>
              No quotations found
            </Typography>
          ) : (
            <List disablePadding>
              {rows.map((row) => (
                <ListItemButton
                  key={row._id}
                  divider
                  onClick={() => onSelect(row)}
                  sx={{ py: 1, alignItems: 'flex-start' }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ width: '100%' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{row.quotationNo}</Typography>
                      <Typography color="text.secondary" noWrap sx={{ fontSize: '0.75rem' }}>
                        {row.party?.name || '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{money(row.totalAmount)}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                        {formatDate(row.quotationDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
