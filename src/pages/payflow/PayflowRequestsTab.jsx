import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import PayflowRequestDetail, { StatusPill } from './PayflowRequestDetail';
import PayflowRequestFormDrawer from './PayflowRequestFormDrawer';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { REQUEST_STATUS_FILTERS, formatInr } from './payflowRequestConfig';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

export default function PayflowRequestsTab({ initialStatus = 'All', openForm = false, onChanged, title = 'Total Payment Requests' }) {
  const dispatch = useAppDispatch();
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [status, setStatus] = useState(initialStatus);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(openForm);
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ ...queryParams, ...(status !== 'All' ? { status } : {}) }), [queryParams, status]);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowRequestApi.list(params);
      setRows(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to fetch payment requests', severity: 'error' }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await payflowRequestApi.create(values);
      dispatch(showSnackbar({ message: 'Payment request created' }));
      setFormOpen(false);
      load();
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to create request', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: 'srNo', headerName: 'SR No.', width: 90 },
      { field: 'requestDate', headerName: 'Date', width: 110, valueFormatter: (v) => fmtDate(v) },
      { field: 'company', headerName: 'Company, Branch', minWidth: 170, flex: 1, valueGetter: (_, row) => `${row.company}, ${row.branch}` },
      { field: 'vendor', headerName: 'Vendor', minWidth: 190, flex: 1.2 },
      { field: 'category', headerName: 'Category', minWidth: 190, flex: 1, valueGetter: (_, row) => [row.category, row.itemType].filter(Boolean).join(' • ') },
      { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: (v) => formatInr(v) },
      { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusPill status={p.value} /> },
      { field: 'requestedBy', headerName: 'Requested By', minWidth: 150, flex: 0.8, sortable: false, valueGetter: (_, row) => row.requestedBy?.name || '—' },
    ],
    []
  );

  if (selectedId) {
    return <PayflowRequestDetail requestId={selectedId} onBack={() => { setSelectedId(null); load(); }} onChanged={onChanged} />;
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${total} payment${total === 1 ? '' : 's'} found`}
        actions={
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormOpen(true)}>
            New Request
          </Button>
        }
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {REQUEST_STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            label={s}
            clickable
            color={status === s ? 'primary' : 'default'}
            variant={status === s ? 'filled' : 'outlined'}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          />
        ))}
      </Stack>

      <Box>
        <DataTable
          columns={columns}
          rows={rows}
          totalCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
          onSortChange={(model) => model && setSort(model.field, model.sort)}
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(row) => setSelectedId(row._id)}
          loading={loading}
          emptyMessage="No payment requests found"
          storageKey="payflow-requests"
        />
      </Box>

      <PayflowRequestFormDrawer open={formOpen} submitting={submitting} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </>
  );
}
