import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';

export function useDailyVisitsSummary(onPlanVisit) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDates, setOpenDates] = useState(new Set());
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handlePlanVisit = () => {
    if (onPlanVisit) onPlanVisit();
    else navigate('/visits/new');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await visitApi.dailySummary();
      const list = res.data?.data || [];
      setData(list);
      if (list.length > 0) setOpenDates(new Set([list[0].date]));
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDate = (date) => {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return {
    navigate,
    data,
    loading,
    openDates,
    previewPhoto,
    setPreviewPhoto,
    handlePlanVisit,
    toggleDate,
  };
}