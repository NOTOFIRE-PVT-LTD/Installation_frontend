import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { billingApi } from '../../api/billingApi';
import { downloadBillingExcel, parseBillingLoaPdf } from '../../utils/billingInvoiceImport';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PARTIES = ['KE', 'AHT', 'Arihant'];
const DISCOUNT_PERCENT = 55.7;

const money = (value) => formatCurrency(value);

const DOC_COLUMNS = [
  {
    field: 'fileName',
    headerName: 'LOA File',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'loaNumber',
    headerName: 'LOA No.',
    width: 130,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'itemsCount',
    headerName: 'Items',
    width: 90,
    valueGetter: (_value, row) => row.items?.length || 0,
  },
  {
    field: 'totalAfterDiscount',
    headerName: `Below ${DISCOUNT_PERCENT}% Total`,
    width: 160,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'excludingGst',
    headerName: 'Excluding GST',
    width: 140,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'gstAmount',
    headerName: 'GST 18%',
    width: 120,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    valueFormatter: (value) => formatDate(value),
  },
];

const ITEM_COLUMNS = [
  { field: 'sno', headerName: 'S. No.', width: 70 },
  {
    field: 'itemName',
    headerName: 'Description',
    flex: 1.4,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  { field: 'type', headerName: 'Type', width: 90, valueGetter: (value) => value || '-' },
  {
    field: 'paymentTerms',
    headerName: 'Payment Terms',
    width: 130,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'inspection',
    headerName: 'Inspection',
    width: 110,
    valueGetter: (value) => value || '-',
  },
  { field: 'mfd', headerName: 'MFD', width: 80, valueGetter: (value) => value || '-' },
  {
    field: 'quantity',
    headerName: 'Qty',
    width: 90,
    valueGetter: (value) => value ?? 0,
  },
  { field: 'unit', headerName: 'Unit', width: 80, valueGetter: (value) => value || '-' },
  {
    field: 'loaValuePerUnit',
    headerName: 'LOA Value Per Unit',
    width: 150,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'loaTotal',
    headerName: 'LOA Total',
    width: 130,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'discountPerUnit',
    headerName: `Below ${DISCOUNT_PERCENT}% Per Unit`,
    width: 170,
    valueFormatter: (value) => money(value),
  },
  {
    field: 'discountTotal',
    headerName: `Below ${DISCOUNT_PERCENT}% Total`,
    width: 170,
    valueFormatter: (value) => money(value),
  },
];

function SummaryBlock({ doc }) {
  const loaTotalSum = useMemo(
    () => (doc?.items || []).reduce((sum, item) => sum + (Number(item.loaTotal) || 0), 0),
    [doc]
  );

  const rows = [
    {
      label: 'Total',
      loaTotal: loaTotalSum,
      discountTotal: doc?.totalAfterDiscount,
      emphasis: true,
    },
    { label: 'Excluding GST', discountTotal: doc?.excludingGst },
    { label: 'GST 18%', discountTotal: doc?.gstAmount },
  ];

  return (
    <Box
      sx={{
        mt: 2,
        ml: 'auto',
        width: { xs: '100%', sm: 420 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      {rows.map((row) => (
        <Stack
          key={row.label}
          direction="row"
          alignItems="center"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 0 },
            bgcolor: row.emphasis ? '#e8f5e9' : 'background.paper',
          }}
        >
          <Typography
            sx={{
              flex: 1,
              px: 1.5,
              py: 1,
              fontWeight: 700,
              fontSize: '0.8125rem',
              bgcolor: '#c8e6c9',
              color: '#1b5e20',
            }}
          >
            {row.label}
          </Typography>
          {row.loaTotal != null && (
            <Typography
              sx={{
                width: 140,
                px: 1.5,
                py: 1,
                textAlign: 'right',
                fontWeight: 600,
                fontSize: '0.8125rem',
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              {money(row.loaTotal)}
            </Typography>
          )}
          <Typography
            sx={{
              width: 160,
              px: 1.5,
              py: 1,
              textAlign: 'right',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: '#e8f5e9',
            }}
          >
            {money(row.discountTotal)}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function PartyPanel({ party }) {
  const dispatch = useAppDispatch();
  const inputRef = useRef(null);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [parseError, setParseError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const listParams = useMemo(() => ({ ...queryParams, party }), [queryParams, party]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await billingApi.list(listParams);
      setItems(data?.data || []);
      setTotal(data?.meta?.total || 0);
    } catch (err) {
      setItems([]);
      setTotal(0);
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || `Failed to load ${party} billing`,
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(listParams)]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setParsing(true);
    setParseError('');
    try {
      const created = await parseBillingLoaPdf(file, party);
      dispatch(
        showSnackbar({
          message: `Parsed ${created?.items?.length || 0} items for ${party} from ${file.name}`,
        })
      );
      await load();
      if (created) setViewDoc(created);
    } catch (error) {
      setParseError(error?.message || 'Could not parse that LOA.');
    } finally {
      setParsing(false);
    }
  };

  const handleExcelDownload = async () => {
    setExporting(true);
    try {
      await downloadBillingExcel({ party });
      dispatch(showSnackbar({ message: `${party} Excel downloaded` }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || err.message || 'Failed to download Excel',
          severity: 'error',
        })
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete?._id) return;
    setDeleting(true);
    try {
      await billingApi.remove(confirmDelete._id);
      dispatch(showSnackbar({ message: 'Billing LOA deleted' }));
      setConfirmDelete(null);
      setViewDoc(null);
      await load();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to delete',
          severity: 'error',
        })
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
          onClick={handleExcelDownload}
          disabled={exporting || !items.length}
        >
          {exporting ? 'Downloading…' : 'Download Excel'}
        </Button>
        <Button
          variant="contained"
          startIcon={parsing ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={parsing}
        >
          {parsing ? 'AI reading LOA…' : 'Upload LOA PDF'}
        </Button>
      </Stack>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={handleUpload} />

      {parseError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setParseError('')}>
          {parseError}
        </Alert>
      )}

      <DataTable
        columns={DOC_COLUMNS}
        rows={items}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
        onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(row) => setViewDoc(row)}
        actions={[
          {
            label: 'View items',
            icon: <VisibilityIcon fontSize="small" />,
            onClick: setViewDoc,
          },
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" color="error" />,
            onClick: setConfirmDelete,
          },
        ]}
        loading={loading}
        emptyMessage={`No ${party} LOA uploads yet. Upload an LOA PDF to parse items.`}
        storageKey={`billing-docs-${party}`}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete ${party} LOA`}
        message={`Delete "${confirmDelete?.fileName || confirmDelete?.loaNumber || 'this LOA'}" and its items?`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(null);
        }}
      />

      <Dialog open={Boolean(viewDoc)} onClose={() => setViewDoc(null)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {party} · {viewDoc?.fileName || viewDoc?.loaNumber || 'LOA Items'}
        </DialogTitle>
        <DialogContent dividers>
          <DataTable
            columns={ITEM_COLUMNS}
            rows={(viewDoc?.items || []).map((item, index) => ({
              ...item,
              id: item._id || `${index}`,
              _id: item._id || `${index}`,
            }))}
            totalCount={viewDoc?.items?.length || 0}
            page={1}
            pageSize={Math.max(viewDoc?.items?.length || 25, 25)}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            loading={false}
            emptyMessage="No items in this LOA."
            storageKey={`billing-items-${party}`}
          />
          <SummaryBlock doc={viewDoc} />
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setConfirmDelete(viewDoc);
            }}
          >
            Remove
          </Button>
          <Button onClick={() => setViewDoc(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function BillingPage() {
  const [tab, setTab] = useState(0);
  const party = PARTIES[tab];

  return (
    <>
      <PageHeader
        title="Billing"
        subtitle={`Upload LOA PDF for ${party}. Items: Description, Qty, Unit, LOA Value/Unit, LOA Total, then ${DISCOUNT_PERCENT}% discount columns.`}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_e, next) => setTab(next)}>
          {PARTIES.map((name) => (
            <Tab key={name} label={name} />
          ))}
        </Tabs>
      </Box>

      <PartyPanel key={party} party={party} />
    </>
  );
}
