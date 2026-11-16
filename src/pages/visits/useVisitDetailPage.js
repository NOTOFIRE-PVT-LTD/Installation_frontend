import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { visitApi } from '../../api/visitApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { readLocation } from '../../utils/readLocation';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { runVisitCheckIn, runVisitCheckOut, visitActionErrorMessage } from './visitDetailPhotoActions';

export function useVisitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isSalesperson } = useAuth();

  const [visit, setVisit] = useState(null);
  const [proximity, setProximity] = useState(null);
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);
  const [missOpen, setMissOpen] = useState(false);
  const [outOfRangeReason, setOutOfRangeReason] = useState('');
  const [readingLoc, setReadingLoc] = useState(false);

  const load = useCallback(async () => {
    const { data } = await visitApi.getById(id);
    setVisit(data.data);
    return data.data;
  }, [id]);

  const refreshProximity = useCallback(async () => {
    try {
      const loc = await readLocation();
      if (loc.lat == null) {
        setProximity(loc.error ? { error: loc.error } : null);
        return;
      }
      const { data } = await visitApi.proximity(id, { lat: loc.lat, lng: loc.lng });
      setProximity(data.data);
    } catch {
      // Ignore background refresh errors
    }
  }, [id]);

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Visit not found', severity: 'error' }));
      navigate(isSalesperson ? '/visits/today' : '/salesperson-tracking?tab=visits');
    });
  }, [load, dispatch, navigate, isSalesperson]);

  useEffect(() => {
    if (!visit || !isSalesperson) return undefined;
    refreshProximity();
    const timer = setInterval(refreshProximity, 10000);
    return () => clearInterval(timer);
  }, [visit, isSalesperson, refreshProximity]);

  const handleCheckInWithPhoto = async (photoFile, options = {}) => {
    if (!photoFile) return;
    setBusy(true);
    setReadingLoc(true);
    try {
      const updated = await runVisitCheckIn({ id, photoFile, options, dispatch });
      setVisit(updated);
      if (isSalesperson) {
        navigate('/visits/today');
        return;
      }
      await refreshProximity();
    } catch (err) {
      dispatch(showSnackbar({ message: visitActionErrorMessage(err, 'Check-in failed'), severity: 'error' }));
    } finally {
      setBusy(false);
      setReadingLoc(false);
    }
  };

  const handleCheckOutWithPhoto = async (photoFile, options = {}) => {
    if (!photoFile) return;
    setBusy(true);
    setReadingLoc(true);
    try {
      const updated = await runVisitCheckOut({ id, photoFile, remark, options, dispatch });
      if (!updated) return;
      setVisit(updated);
      if (isSalesperson) {
        navigate('/visits/today');
        return;
      }
      await refreshProximity();
    } catch (err) {
      dispatch(showSnackbar({ message: visitActionErrorMessage(err, 'Check-out failed'), severity: 'error' }));
    } finally {
      setBusy(false);
      setReadingLoc(false);
    }
  };

  const submitMissed = async (payload) => {
    setBusy(true);
    try {
      const { data } = await visitApi.reportMissed(id, payload);
      setVisit(data.data);
      setMissOpen(false);
      dispatch(showSnackbar({ message: data.message || 'Visit marked as missed' }));
      navigate('/visits/today');
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  return {
    visit,
    proximity,
    remark,
    setRemark,
    busy,
    missOpen,
    setMissOpen,
    outOfRangeReason,
    setOutOfRangeReason,
    readingLoc,
    isSalesperson,
    navigate,
    handleCheckInWithPhoto,
    handleCheckOutWithPhoto,
    submitMissed,
  };
}