import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import QuotationMastersPanel from './QuotationMastersPanel';
import { downloadQuotationPdf } from './quotationPdf';
import { QUOTATION_STATUSES, apiErrorMessage, money, statusMeta } from './quotationUtils';

const PAGE_SIZE = 20;

const CSV_COLUMNS = [
  { field: 'quotationNo', headerName: 'Quotation No.' },
  { field: 'date', headerName: 'Date' },
  { field: 'party', headerName: 'Party' },
  { field: 'company', headerName: 'Company' },
  { field: 'projectName', headerName: 'Project' },
  { field: 'salesperson', headerName: 'Salesperson' },
  { field: 'subtotal', headerName: 'Subtotal' },
  { field: 'gstAmount', headerName: 'GST' },
  { field: 'totalAmount', headerName: 'Total Amount' },
  { field: 'status', headerName: 'Status' },
];

function InfoCell({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap title={typeof children === 'string' ? children : undefined}>
        {children || '-'}
      </Typography>
    </Box>
  );
}

function QuotationCard({ quotation, trash, busy, onAction }) {
  const status = statusMeta(quotation.status);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);

  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler(event);
  };
  const runMenuAction = (action, value) => {
    setMenuAnchor(null);
    setStatusAnchor(null);
    onAction(action, quotation, value);
  };

  const menuItems = trash
    ? [{ key: 'purge', label: 'Delete Permanently', icon: <DeleteIcon fontSize="small" />, danger: true }]
    : [
        { key: 'duplicate', label: 'Duplicate', icon: <ContentCopyIcon fontSize="small" /> },
        ...(quotation.status === 'draft'
          ? [{ key: 'status', value: 'sent', label: 'Mark as Sent', icon: <SendIcon fontSize="small" /> }]
          : []),
        { key: 'trash', label: 'Move to Trash', icon: <DeleteIcon fontSize="small" />, danger: true },
      ];

  return (
    <Paper
      variant="outlined"
      onClick={() => onAction('view', quotation)}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': { borderColor: 'primary.light', boxShadow: '0 6px 18px rgba(31, 42, 68, 0.08)' },
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} gap={{ xs: 1.25, md: 2 }}>
        <Box sx={{ minWidth: 0, flex: { md: '0 0 240px' } }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography fontWeight={700} fontSize="1rem" noWrap>
              {quotation.quotationNo}
            </Typography>
            <Chip
              size="small"
              label={status.label}
              color={status.color}
              variant={status.value === 'draft' ? 'filled' : 'outlined'}
              onDelete={trash || busy ? undefined : stop((event) => setStatusAnchor(event.currentTarget))}
              deleteIcon={<ArrowDropDownIcon />}
              onClick={trash || busy ? undefined : stop((event) => setStatusAnchor(event.currentTarget))}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap title={quotation.party?.name}>
            {quotation.party?.name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created {formatDate(quotation.createdAt)}
          </Typography>
        </Box>

        <Grid container spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Amount
            </Typography>
            <Typography fontWeight={700} noWrap>
              {money(quotation.totalAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <InfoCell label="Company">{quotation.company?.name}</InfoCell>
          </Grid>
          <Grid item xs={6} md={3}>
            <InfoCell label="Salesperson">{quotation.salesperson}</InfoCell>
          </Grid>
          <Grid item xs={6} md={3}>
            <InfoCell label="Project">{quotation.projectName}</InfoCell>
          </Grid>
        </Grid>

        <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', md: 'center' } }}>
          {trash ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestoreIcon />}
              disabled={busy}
              onClick={stop(() => onAction('restore', quotation))}
            >
              Restore
            </Button>
          ) : (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={stop(() => onAction('edit', quotation))}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton size="small" onClick={stop(() => onAction('pdf', quotation))}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="More actions">
            <span>
              <IconButton size="small" disabled={busy} onClick={stop((event) => setMenuAnchor(event.currentTarget))}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            dense
            onClick={() => runMenuAction(item.key, item.value)}
            sx={{ color: item.danger ? 'error.main' : 'text.primary' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        onClick={(event) => event.stopPropagation()}
      >
        {QUOTATION_STATUSES.map((s) => (
          <MenuItem
            key={s.value}
            dense
            selected={s.value === quotation.status}
            onClick={() => (s.value === quotation.status ? setStatusAnchor(null) : runMenuAction('status', s.value))}
          >
            {s.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

export default function QuotationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ active: 0, trash: 0 });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [exporting, setExporting] = useState(false);
  const trash = tab === 'trash';

  const listParams = (overrides = {}) => ({
    page,
    pageSize: PAGE_SIZE,
    trash: trash ? 'true' : 'false',
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(status ? { status } : {}),
    ...overrides,
  });

  const load = () => {
    if (tab === 'masters') return;
    setLoading(true);
    quotationApi
      .list(listParams())
      .then((res) => {
        setRows(res.data?.data || []);
        setTotal(res.data?.meta?.total || 0);
        setCounts(res.data?.meta?.counts || { active: 0, trash: 0 });
      })
      .catch((err) => {
        setRows([]);
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load quotations'), severity: 'error' }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, debouncedSearch, status]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, status]);

  const runAction = async (id, work, successMessage) => {
    setBusyId(id);
    try {
      await work();
      if (successMessage) dispatch(showSnackbar({ message: successMessage }));
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Action failed'), severity: 'error' }));
    } finally {
      setBusyId(null);
    }
  };

  const handleAction = (action, quotation, value) => {
    const id = quotation._id;
    switch (action) {
      case 'view':
        navigate(`/quotations/${id}`);
        break;
      case 'edit':
        navigate(`/quotations/${id}/edit`);
        break;
      case 'pdf':
        downloadQuotationPdf(quotation);
        break;
      case 'duplicate':
        runAction(
          id,
          async () => {
            const { data } = await quotationApi.duplicate(id);
            dispatch(showSnackbar({ message: `Duplicated as ${data.data.quotationNo}` }));
          },
          null
        );
        break;
      case 'status':
        if (!value) return;
        runAction(id, () => quotationApi.setStatus(id, value), `Status set to ${statusMeta(value).label}`);
        break;
      case 'restore':
        runAction(id, () => quotationApi.restore(id), 'Quotation restored');
        break;
      case 'trash':
      case 'purge':
        setConfirm({ action, quotation });
        break;
      default:
    }
  };

  const handleConfirm = async () => {
    const { action, quotation } = confirm;
    await runAction(
      quotation._id,
      () => (action === 'trash' ? quotationApi.moveToTrash(quotation._id) : quotationApi.removePermanently(quotation._id)),
      action === 'trash' ? 'Quotation moved to trash' : 'Quotation deleted permanently'
    );
    setConfirm(null);
  };

  const handleDownloadAll = async () => {
    setExporting(true);
    try {
      const { data } = await quotationApi.list(listParams({ page: 1, pageSize: 1000 }));
      const csvRows = (data?.data || []).map((q) => ({
        quotationNo: q.quotationNo,
        date: formatDate(q.quotationDate || q.createdAt),
        party: q.party?.name || '',
        company: q.company?.name || '',
        projectName: q.projectName || '',
        salesperson: q.salesperson || '',
        subtotal: q.subtotal ?? 0,
        gstAmount: q.gstAmount ?? 0,
        totalAmount: q.totalAmount ?? 0,
        status: statusMeta(q.status).label,
      }));
      if (!csvRows.length) {
        dispatch(showSnackbar({ message: 'No quotations to download', severity: 'warning' }));
        return;
      }
      exportToCsv(trash ? 'quotations-trash' : 'quotations', csvRows, CSV_COLUMNS);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to download quotations'), severity: 'error' }));
    } finally {
      setExporting(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Quotations"
        subtitle="Manage your quotations"
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {tab !== 'masters' && (
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleDownloadAll} disabled={exporting}>
                {exporting ? 'Preparing…' : 'Download All'}
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/quotations/new')}>
              New Quotation
            </Button>
          </Stack>
        }
      />

      <Tabs value={tab} onChange={(_e, next) => setTab(next)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab
          value="active"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Quotations</span>
              <Chip size="small" label={counts.active} />
            </Stack>
          }
        />
        <Tab
          value="trash"
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Trash</span>
              <Chip size="small" label={counts.trash} />
            </Stack>
          }
        />
        <Tab value="masters" label="Products / Companies / Parties / Terms" />
      </Tabs>

      {tab === 'masters' ? (
        <QuotationMastersPanel />
      ) : (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search quotations by number, party, company, salesperson, project…"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              SelectProps={{ displayEmpty: true }}
              sx={{ minWidth: { sm: 180 } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {QUOTATION_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack spacing={1.5}>
            {loading &&
              rows.length === 0 &&
              [0, 1, 2].map((key) => <Skeleton key={key} variant="rounded" height={150} />)}
            {!loading && rows.length === 0 && (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {trash ? 'Trash is empty.' : 'No quotations found. Click "New Quotation" to create one.'}
                </Typography>
              </Paper>
            )}
            {rows.map((quotation) => (
              <QuotationCard
                key={quotation._id}
                quotation={quotation}
                trash={trash}
                busy={busyId === quotation._id}
                onAction={handleAction}
              />
            ))}
          </Stack>

          {pageCount > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2.5 }}>
              <Pagination count={pageCount} page={page} onChange={(_e, next) => setPage(next)} color="primary" />
            </Stack>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === 'purge' ? 'Delete Permanently' : 'Move to Trash'}
        message={
          confirm?.action === 'purge'
            ? `Permanently delete ${confirm?.quotation?.quotationNo}? This cannot be undone.`
            : `Move ${confirm?.quotation?.quotationNo} to trash? You can restore it later from the Trash tab.`
        }
        confirmLabel={confirm?.action === 'purge' ? 'Delete Permanently' : 'Move to Trash'}
        confirmColor="error"
        loading={Boolean(busyId)}
        onConfirm={handleConfirm}
        onClose={() => !busyId && setConfirm(null)}
      />
    </>
  );
}
