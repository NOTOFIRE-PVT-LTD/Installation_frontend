import { useCallback, useEffect, useMemo, useState } from 'react';
import { visitApi } from '../../api/visitApi';
import {
  groupVisitsByDay,
  istTodayYmd,
  salespeopleOnVisitToday,
} from './adminVisitsDayBoardHelpers';

export function useAdminVisitsDayBoard() {
  const today = istTodayYmd();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [openDays, setOpenDays] = useState(() => new Set([today]));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await visitApi.list({
        from,
        to,
        pageSize: 100,
        sortField: 'visitDate',
        sortOrder: 'asc',
      });
      setVisits(data.data || []);
    } catch {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => groupVisitsByDay(visits), [visits]);
  const onVisitToday = useMemo(
    () => salespeopleOnVisitToday(visits, today),
    [visits, today]
  );

  const toggleDay = (date) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const applyToday = () => {
    setFrom(today);
    setTo(today);
  };

  return {
    today,
    from,
    setFrom,
    to,
    setTo,
    loading,
    load,
    days,
    onVisitToday,
    openDays,
    toggleDay,
    applyToday,
  };
}