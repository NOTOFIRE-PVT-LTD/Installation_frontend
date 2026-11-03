import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/common/DataTable/DataTable';
import PayflowRequestDetail, { StatusPill } from './PayflowRequestDetail';
import PayflowRequestFormDrawer from './PayflowRequestFormDrawer';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { REQUEST_STATUS_FILTERS, formatInr } from './payflowRequestConfig';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

export default function PayflowRequestsTab({
  initialStatus = 'All',
  openForm = false,
  allowCreate = true,
  isAdmin = false,
  trashOnly = false,
  onChanged,
  title = 'Total Payment Requests',
}) {
  const dispatch = useAppDispatch();
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [status, setStatus] = useState(trashOnly ? 'Trash' : initialStatus);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(openForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmTrashRow, setConfirmTrashRow] = useState(null);
  const [confirmPurgeRow, setConfirmPurgeRow] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);

  const isTrashView = trashOnly || status === 'Trash';

  const params = useMemo(
    () => ({
      ...queryParams,
      ...(isTrashView ? { trash: 'true' } : status !== 'All' ? { status } : {}),
    }),
    [queryParams, status, isTrashView]
  );
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowRequestApi.list(params);
      setRows(data.data);
      setTotal(data.meta.total);
      if (typeof data.meta?.trashCount === 'number') {
        setTrashCount(data.meta.trashCount);
      }
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

  const handleMoveToTrash = async () => {
    if (!confirmTrashRow) return;
    setActionBusyId(confirmTrashRow._id);
    try {
      await payflowRequestApi.moveToTrash(confirmTrashRow._id);
      dispatch(showSnackbar({ message: `Payment request #${confirmTrashRow.srNo} moved to trash` }));
      setConfirmTrashRow(null);
      load();
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to move request to trash', severity: 'error' }));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleRestore = async (row) => {
    setActionBusyId(row._id);
    try {
      await payflowRequestApi.restore(row._id);
      dispatch(showSnackbar({ message: `Payment request #${row.srNo} restored from trash` }));
      load();
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to restore request', severity: 'error' }));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeletePermanently = async () => {
    if (!confirmPurgeRow) return;
    setActionBusyId(confirmPurgeRow._id);
    try {
      await payflowRequestApi.deletePermanently(confirmPurgeRow._id);
      dispatch(showSnackbar({ message: `Payment request #${confirmPurgeRow.srNo} permanently deleted` }));
      setConfirmPurgeRow(null);
      load();
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to permanently delete request', severity: 'error' }));
    } finally {
      setActionBusyId(null);
    }
  };

  const columns = useMemo(() => {
    const base = [
      { field: 'srNo', headerName: 'SR No.', width: 90 },
      { field: 'requestDate', headerName: 'Date', width: 110, valueFormatter: (v) => fmtDate(v) },
      { field: 'company', headerName: 'Company, Branch', minWidth: 170, flex: 1, valueGetter: (_, row) => `${row.company}, ${row.branch}` },
      { field: 'vendor', headerName: 'Vendor', minWidth: 190, flex: 1.2 },
      { field: 'category', headerName: 'Category', minWidth: 190, flex: 1, valueGetter: (_, row) => [row.category, row.itemType].filter(Boolean).join(' • ') },
      { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: (v) => formatInr(v) },
      { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusPill status={p.value} /> },
      { field: 'requestedBy', headerName: 'Requested By', minWidth: 150, flex: 0.8, sortable: false, valueGetter: (_, row) => row.requestedBy?.name || '—' },
    ];

    if (isAdmin) {
      base.push({
        field: 'actions',
        headerName: 'Actions',
        width: isTrashView ? 170 : 90,
        sortable: false,
        renderCell: ({ row }) =>
          isTrashView ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                startIcon={<RestoreFromTrashOutlinedIcon fontSize="small" />}
                disabled={actionBusyId === row._id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(row);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Restore
              </Button>
              <Tooltip title="Delete Permanently">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={actionBusyId === row._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmPurgeRow(row);
                    }}
                  >
                    <DeleteForeverOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ) : (
            <Tooltip title="Move to Trash">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={actionBusyId === row._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmTrashRow(row);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ),
      });
    }

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isTrashView, actionBusyId]);

  if (selectedId) {
    return (
      <PayflowRequestDetail
        requestId={selectedId}
        isAdmin={isAdmin}
        onBack={() => {
          setSelectedId(null);
          load();
        }}
        onChanged={onChanged}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={isTrashView ? 'Trash — Deleted Payment Requests' : title}
        subtitle={`${total} ${isTrashView ? 'deleted ' : ''}payment${total === 1 ? '' : 's'} found`}
        actions={
          allowCreate ? (
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormOpen(true)}>
              New Request
            </Button>
          ) : null
        }
      />

      {!trashOnly && (
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
          {isAdmin && (
            <Chip
              icon={<DeleteOutlineIcon fontSize="small" />}
              label={`Trash (${trashCount})`}
              clickable
              color={status === 'Trash' ? 'error' : 'default'}
              variant={status === 'Trash' ? 'filled' : 'outlined'}
              onClick={() => {
                setStatus('Trash');
                setPage(1);
              }}
            />
          )}
        </Stack>
      )}

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
          emptyMessage={isTrashView ? 'Trash is empty' : 'No payment requests found'}
          storageKey="payflow-requests"
        />
      </Box>

      <PayflowRequestFormDrawer open={formOpen} submitting={submitting} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      <ConfirmDialog
        open={Boolean(confirmTrashRow)}
        title={`Move Request #${confirmTrashRow?.srNo} to Trash?`}
        message={`This payment request (${confirmTrashRow?.vendor} — ${formatInr(confirmTrashRow?.amount)}) will be moved to Trash and will not be permanently deleted. You can restore it anytime from Trash.`}
        confirmLabel="Move to Trash"
        confirmColor="error"
        loading={Boolean(actionBusyId)}
        onConfirm={handleMoveToTrash}
        onClose={() => !actionBusyId && setConfirmTrashRow(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmPurgeRow)}
        title={`Delete Request #${confirmPurgeRow?.srNo} Permanently?`}
        message={`This payment request (${confirmPurgeRow?.vendor} — ${formatInr(confirmPurgeRow?.amount)}) will be permanently deleted from the database. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        confirmColor="error"
        loading={Boolean(actionBusyId)}
        onConfirm={handleDeletePermanently}
        onClose={() => !actionBusyId && setConfirmPurgeRow(null)}
      />
    </>
  );
}
