import { useCallback, useEffect, useMemo, useState } from 'react';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';

export function usePayflowRequestsData({ queryParams, status, isTrashView }) {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const params = useMemo(
    () => ({ ...queryParams, ...(isTrashView ? { trash: 'true' } : status !== 'All' ? { status } : {}) }),
    [queryParams, status, isTrashView]
  );
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowRequestApi.list(params);
      setRows(data.data);
      setTotal(data.meta.total);
      if (typeof data.meta?.trashCount === 'number') setTrashCount(data.meta.trashCount);
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

  return { rows, total, trashCount, loading, load };
}

export function usePayflowRowActions({ load, onChanged }) {
  const dispatch = useAppDispatch();
  const [confirmTrashRow, setConfirmTrashRow] = useState(null);
  const [confirmPurgeRow, setConfirmPurgeRow] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);

  const runAction = useCallback(
    async (id, fn, successMsg, errorMsg, onDone) => {
      setActionBusyId(id);
      try {
        await fn();
        dispatch(showSnackbar({ message: successMsg }));
        onDone?.();
        load();
        onChanged?.();
      } catch (err) {
        dispatch(showSnackbar({ message: err.response?.data?.message || errorMsg, severity: 'error' }));
      } finally {
        setActionBusyId(null);
      }
    },
    [dispatch, load, onChanged]
  );

  const handleMoveToTrash = () =>
    confirmTrashRow &&
    runAction(
      confirmTrashRow._id,
      () => payflowRequestApi.moveToTrash(confirmTrashRow._id),
      `Payment request #${confirmTrashRow.srNo} moved to trash`,
      'Failed to move request to trash',
      () => setConfirmTrashRow(null)
    );

  const handleRestore = (row) =>
    runAction(row._id, () => payflowRequestApi.restore(row._id), `Payment request #${row.srNo} restored from trash`, 'Failed to restore request');

  const handleDeletePermanently = () =>
    confirmPurgeRow &&
    runAction(
      confirmPurgeRow._id,
      () => payflowRequestApi.deletePermanently(confirmPurgeRow._id),
      `Payment request #${confirmPurgeRow.srNo} permanently deleted`,
      'Failed to permanently delete request',
      () => setConfirmPurgeRow(null)
    );

  return {
    confirmTrashRow,
    confirmPurgeRow,
    actionBusyId,
    setConfirmTrashRow,
    setConfirmPurgeRow,
    handleMoveToTrash,
    handleRestore,
    handleDeletePermanently,
  };
}
