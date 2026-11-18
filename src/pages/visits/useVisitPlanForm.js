import { useEffect, useState } from 'react';
import { customerApi } from '../../api/customerApi';
import { peopleApi } from '../../api/peopleApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { ROLES } from '../../utils/constants';
import { createDefaultVisitRow, getMondayOfCurrentWeek } from './visitPlanHelpers';
import { submitVisitPlanRows, visitPlanSubmitErrorMessage } from './visitPlanSubmit';
import { validateVisitPlanRows } from './visitPlanValidation';
import {
  buildNewVisitRow,
  patchVisitRow,
  syncVisitsForPlanDate,
  syncVisitsForScope,
  syncVisitsForWeekStart,
} from './visitPlanVisitHandlers';

async function loadCustomerOptions() {
  try {
    const { data } = await customerApi.list({ pageSize: 100, active: 'true' });
    return data.data || [];
  } catch {
    return [];
  }
}

async function loadSalespeopleOptions() {
  try {
    const { data } = await peopleApi.list({ role: ROLES.USER, pageSize: 100 });
    return data?.data || [];
  } catch {
    return [];
  }
}

export function useVisitPlanForm({ isAdmin, dispatch, onSuccess, drawerOpen, initialSalespersonId }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedSalesperson, setSelectedSalesperson] = useState(initialSalespersonId || '');
  const [salespeople, setSalespeople] = useState([]);
  const [scope, setScope] = useState('day');
  const [planDate, setPlanDate] = useState(todayStr);
  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [customers, setCustomers] = useState([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [activeVisitIndex, setActiveVisitIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visits, setVisits] = useState([createDefaultVisitRow(todayStr)]);

  useEffect(() => {
    const shouldLoad = drawerOpen === undefined ? true : drawerOpen;
    if (!shouldLoad) return undefined;
    loadCustomerOptions().then(setCustomers);
    if (isAdmin) loadSalespeopleOptions().then(setSalespeople);
    if (initialSalespersonId) setSelectedSalesperson(initialSalespersonId);
    return undefined;
  }, [drawerOpen, isAdmin, initialSalespersonId]);

  const handleScopeChange = (_e, newScope) => {
    if (!newScope) return;
    setScope(newScope);
    setVisits((prev) => syncVisitsForScope(prev, newScope, planDate, weekStart));
  };

  const handlePlanDateChange = (newDate) => {
    setPlanDate(newDate);
    if (scope === 'day') setVisits((prev) => syncVisitsForPlanDate(prev, newDate));
  };

  const handleWeekStartChange = (newWeekStart) => {
    setWeekStart(newWeekStart);
    if (scope === 'week') setVisits((prev) => syncVisitsForWeekStart(prev, newWeekStart));
  };

  const addVisitRow = () => setVisits((prev) => [...prev, buildNewVisitRow(prev, scope, planDate, weekStart)]);

  const removeVisitRow = (index) => {
    if (visits.length <= 1) return;
    setVisits((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVisit = (index, field, value) => {
    setVisits((prev) => patchVisitRow(prev, index, field, value, scope, weekStart));
  };

  const openCustomerModal = (index) => {
    setActiveVisitIndex(index);
    setCustomerModal(true);
  };

  const handleCustomerCreated = (newCust) => {
    setCustomers((prev) => [newCust, ...prev]);
    if (activeVisitIndex !== null) updateVisit(activeVisitIndex, 'customer', newCust._id);
  };

  const handleSaveAll = async () => {
    if (!validateVisitPlanRows(visits, dispatch, isAdmin, selectedSalesperson)) return;
    setSubmitting(true);
    try {
      await submitVisitPlanRows({ visits, isAdmin, selectedSalesperson, dispatch });
      onSuccess?.();
    } catch (err) {
      dispatch(showSnackbar({ message: visitPlanSubmitErrorMessage(err), severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isAdmin,
    selectedSalesperson,
    setSelectedSalesperson,
    salespeople,
    scope,
    planDate,
    weekStart,
    customers,
    customerModal,
    setCustomerModal,
    submitting,
    visits,
    handleScopeChange,
    handlePlanDateChange,
    handleWeekStartChange,
    addVisitRow,
    removeVisitRow,
    updateVisit,
    openCustomerModal,
    handleCustomerCreated,
    handleSaveAll,
  };
}