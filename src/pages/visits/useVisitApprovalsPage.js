import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';

export function useVisitApprovalsPage() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState([]);
  const [approveRow, setApproveRow] = useState(null);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await visitApi.approvals({ pageSize: 50 });
      const rows = data.data || [];
      rows.sort((a, b) => Number(a.decision !== 'PENDING') - Number(b.decision !== 'PENDING'));
      setItems(rows);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load approvals', severity: 'error' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, decision, reason) => {
    setBusy(true);
    try {
      await visitApi.review(id, { decision, rejectionReason: reason });
      dispatch(
        showSnackbar({
          message:
            decision === 'APPROVED'
              ? approveRow?.kind === 'OUT_OF_RANGE'
                ? 'Out-of-range visit approved'
                : 'Approved as missed'
              : 'Rejected',
        })
      );
      setApproveRow(null);
      setRejectRow(null);
      setRejectionReason('');
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Review failed', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  return {
    items,
    approveRow,
    setApproveRow,
    rejectRow,
    setRejectRow,
    rejectionReason,
    setRejectionReason,
    busy,
    review,
  };
}