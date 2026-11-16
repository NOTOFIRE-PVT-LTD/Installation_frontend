import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';

export function useVisitDayPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await visitApi.getDay();
    const payload = data.data;
    setDay(payload);
    setPicked((payload.selected || []).map((v) => v._id));
  };

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not load today', severity: 'error' }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
  };

  const selectAll = () => {
    if (!day?.planned) return;
    setPicked(day.planned.map((v) => v._id));
  };

  const deselectAll = () => setPicked([]);

  const saveSelection = async () => {
    if (!picked.length) {
      dispatch(showSnackbar({ message: 'Please select at least one visit for today', severity: 'warning' }));
      return;
    }
    setBusy(true);
    try {
      const { data } = await visitApi.selectDay({ visitIds: picked });
      setDay(data.data);
      dispatch(showSnackbar({ message: `${picked.length} visits confirmed for today!` }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not save selection', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const submitDay = async () => {
    setBusy(true);
    try {
      const { data } = await visitApi.submitDay();
      setDay(data.data);
      dispatch(showSnackbar({ message: 'Day submitted! Please complete travel expenses below.' }));
      if (data.data?.expense?._id) {
        navigate(`/expenses/${data.data.expense._id}`);
      }
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Cannot submit day', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  return {
    day,
    picked,
    busy,
    navigate,
    toggle,
    selectAll,
    deselectAll,
    saveSelection,
    submitDay,
  };
}