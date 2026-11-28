import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/common/DataTable/DataTable';
import PayflowRequestDetail from './PayflowRequestDetail';
import PayflowRequestFormDrawer from './PayflowRequestFormDrawer';
import PayflowBulkActionBar from './PayflowBulkActionBar';
import PayflowBulkStatusDialog from './PayflowBulkStatusDialog';
import { buildPayflowRequestColumns } from './PayflowRequestsColumns';
import { usePayflowBulkSelection } from './usePayflowBulkSelection';
import { usePayflowRequestsData, usePayflowRowActions } from './usePayflowRequestsData';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { REQUEST_STATUS_FILTERS, formatInr, isSelectableRequestStatus } from './payflowRequestConfig';

function StatusFilterChips({ status, isAdmin, trashCount, onSelect }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
      {REQUEST_STATUS_FILTERS.map((s) => (
        <Chip
          key={s}
          label={s}
          clickable
          color={status === s ? 'primary' : 'default'}
          variant={status === s ? 'filled' : 'outlined'}
          onClick={() => onSelect(s)}
        />
      ))}
      {isAdmin && (
        <Chip
          icon={<DeleteOutlineIcon fontSize="small" />}
          label={`Trash (${trashCount})`}
          clickable
          color={status === 'Trash' ? 'error' : 'default'}
          variant={status === 'Trash' ? 'filled' : 'outlined'}
          onClick={() => onSelect('Trash')}
        />
      )}
    </Stack>
  );
}

function TrashConfirmDialogs({ confirmTrashRow, confirmPurgeRow, busy, onTrash, onPurge, onCloseTrash, onClosePurge }) {
  return (
    <>
      <ConfirmDialog
        open={Boolean(confirmTrashRow)}
        title={`Move Request #${confirmTrashRow?.srNo} to Trash?`}
        message={`This payment request (${confirmTrashRow?.vendor} — ${formatInr(confirmTrashRow?.amount)}) will be moved to Trash and will not be permanently deleted. You can restore it anytime from Trash.`}
        confirmLabel="Move to Trash"
        confirmColor="error"
        loading={busy}
        onConfirm={onTrash}
        onClose={() => !busy && onCloseTrash()}
      />
      <ConfirmDialog
        open={Boolean(confirmPurgeRow)}
        title={`Delete Request #${confirmPurgeRow?.srNo} Permanently?`}
        message={`This payment request (${confirmPurgeRow?.vendor} — ${formatInr(confirmPurgeRow?.amount)}) will be permanently deleted from the database. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        confirmColor="error"
        loading={busy}
        onConfirm={onPurge}
        onClose={() => !busy && onClosePurge()}
      />
    </>
  );
}

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
  const table = useTableQueryParams({});
  const [status, setStatus] = useState(trashOnly ? 'Trash' : initialStatus);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(openForm);
  const [submitting, setSubmitting] = useState(false);

  const isTrashView = trashOnly || status === 'Trash';
  const canBulkSelect = isAdmin && !isTrashView;
  const { rows, total, trashCount, loading, load } = usePayflowRequestsData({ queryParams: table.queryParams, status, isTrashView });
  const rowActions = usePayflowRowActions({ load, onChanged });
  const bulk = usePayflowBulkSelection({ rows, enabled: canBulkSelect, resetKey: `${status}:${isTrashView}`, onReload: load, onChanged });

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
    () =>
      buildPayflowRequestColumns({
        isAdmin,
        isTrashView,
        actionBusyId: rowActions.actionBusyId,
        onRestore: rowActions.handleRestore,
        onTrash: rowActions.setConfirmTrashRow,
        onPurge: rowActions.setConfirmPurgeRow,
      }),
    [isAdmin, isTrashView, rowActions.actionBusyId, rowActions.handleRestore, rowActions.setConfirmTrashRow, rowActions.setConfirmPurgeRow]
  );

  const checkRowSelectable = useCallback((params) => isSelectableRequestStatus(params.row.status), []);

  if (selectedId) {
    return <PayflowRequestDetail requestId={selectedId} isAdmin={isAdmin} onBack={() => { setSelectedId(null); load(); }} onChanged={onChanged} />;
  }

  return (
    <>
      <PageHeader
        title={isTrashView ? 'Trash — Deleted Payment Requests' : title}
        subtitle={`${total} ${isTrashView ? 'deleted ' : ''}payment${total === 1 ? '' : 's'} found`}
        actions={allowCreate ? <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormOpen(true)}>New Request</Button> : null}
      />

      {!trashOnly && (
        <StatusFilterChips status={status} isAdmin={isAdmin} trashCount={trashCount} onSelect={(next) => { setStatus(next); table.setPage(1); }} />
      )}

      {canBulkSelect && (
        <PayflowBulkActionBar selectedRows={bulk.selectedRows} busy={bulk.saving} onSelectStatus={bulk.openBulkDialog} onClear={bulk.clearSelection} />
      )}

      <Box>
        <DataTable
          columns={columns}
          rows={rows}
          totalCount={total}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          sortModel={table.sortField ? { field: table.sortField, sort: table.sortOrder } : null}
          onSortChange={(model) => model && table.setSort(model.field, model.sort)}
          searchValue={table.search}
          onSearchChange={table.setSearch}
          onRowClick={(row) => setSelectedId(row._id)}
          checkboxSelection={canBulkSelect}
          isRowSelectable={canBulkSelect ? checkRowSelectable : undefined}
          rowSelectionModel={canBulkSelect ? bulk.selectedIds : undefined}
          onRowSelectionModelChange={canBulkSelect ? bulk.handleSelectionChange : undefined}
          loading={loading}
          emptyMessage={isTrashView ? 'Trash is empty' : 'No payment requests found'}
          storageKey="payflow-requests"
        />
      </Box>

      <PayflowRequestFormDrawer open={formOpen} submitting={submitting} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <PayflowBulkStatusDialog
        status={bulk.pendingStatus}
        selectedRows={bulk.selectedRows}
        remark={bulk.remark}
        saving={bulk.saving}
        onRemarkChange={bulk.setRemark}
        onConfirm={bulk.confirmBulkStatus}
        onClose={bulk.closeBulkDialog}
      />
      <TrashConfirmDialogs
        confirmTrashRow={rowActions.confirmTrashRow}
        confirmPurgeRow={rowActions.confirmPurgeRow}
        busy={Boolean(rowActions.actionBusyId)}
        onTrash={rowActions.handleMoveToTrash}
        onPurge={rowActions.handleDeletePermanently}
        onCloseTrash={() => rowActions.setConfirmTrashRow(null)}
        onClosePurge={() => rowActions.setConfirmPurgeRow(null)}
      />
    </>
  );
}
