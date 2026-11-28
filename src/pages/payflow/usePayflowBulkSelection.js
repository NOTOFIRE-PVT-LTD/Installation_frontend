import { useCallback, useEffect, useMemo, useState } from 'react';
import { payflowRequestApi } from '../../api/payflowApi';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { MAX_BULK_SELECTION, capBulkSelectionIds, isSelectableRequestStatus } from './payflowRequestConfig';

function indexSelectableRows(prevMap, rows) {
  const next = { ...prevMap };
  (rows || []).forEach((row) => {
    if (!row?._id) return;
    if (isSelectableRequestStatus(row.status) && !row.isDeleted) next[row._id] = row;
    else delete next[row._id];
  });
  return next;
}

function pruneMapToIds(map, ids) {
  const keep = new Set(ids);
  const next = {};
  Object.keys(map).forEach((id) => {
    if (keep.has(id)) next[id] = map[id];
  });
  return next;
}

export function usePayflowBulkSelection({ rows, enabled, resetKey, onReload, onChanged }) {
  const dispatch = useAppDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowsById, setRowsById] = useState({});
  const [pendingStatus, setPendingStatus] = useState(null);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    setRowsById({});
    setPendingStatus(null);
    setRemark('');
  }, [resetKey, enabled]);

  useEffect(() => {
    if (!enabled) return;
    setRowsById((prev) => indexSelectableRows(prev, rows));
    setSelectedIds((prev) => prev.filter((id) => {
      const current = (rows || []).find((r) => r._id === id);
      return !current || (isSelectableRequestStatus(current.status) && !current.isDeleted);
    }));
  }, [rows, enabled]);

  const handleSelectionChange = useCallback(
    (model) => {
      const extracted = extractSelectedRowIds(model, rows);
      const { ids, exceeded } = capBulkSelectionIds(extracted, selectedIds, MAX_BULK_SELECTION);
      if (exceeded) {
        dispatch(showSnackbar({ message: `Maximum ${MAX_BULK_SELECTION} selections allowed`, severity: 'warning' }));
      }
      setSelectedIds(ids);
      setRowsById((prev) => pruneMapToIds(indexSelectableRows(prev, rows), ids));
    },
    [dispatch, rows, selectedIds]
  );

  const selectedRows = useMemo(
    () => selectedIds.map((id) => rowsById[id]).filter(Boolean),
    [selectedIds, rowsById]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setRowsById({});
  }, []);

  const openBulkDialog = useCallback((status) => {
    setRemark('');
    setPendingStatus(status);
  }, []);

  const closeBulkDialog = useCallback(() => {
    if (!saving) setPendingStatus(null);
  }, [saving]);

  const confirmBulkStatus = useCallback(
    async (eligibleIds) => {
      if (!pendingStatus || !eligibleIds.length) return;
      setSaving(true);
      try {
        const { data } = await payflowRequestApi.bulkChangeStatus({ ids: eligibleIds, status: pendingStatus, remark });
        dispatch(showSnackbar({ message: data.message }));
        setPendingStatus(null);
        clearSelection();
        onReload();
        onChanged?.();
      } catch (err) {
        dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to update selected requests', severity: 'error' }));
      } finally {
        setSaving(false);
      }
    },
    [clearSelection, dispatch, onChanged, onReload, pendingStatus, remark]
  );

  return {
    selectedIds,
    selectedRows,
    pendingStatus,
    remark,
    saving,
    setRemark,
    handleSelectionChange,
    clearSelection,
    openBulkDialog,
    closeBulkDialog,
    confirmBulkStatus,
  };
}
