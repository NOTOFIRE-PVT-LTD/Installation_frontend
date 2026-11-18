import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, VISIT_EXPENSE_CLAIM_MODE, VISIT_EXPENSE_STATUS } from '../../utils/constants';
import { saveExpenseDay, submitExpenseDay, uploadExpenseTicket } from './expenseDayMutations';
import { useExpenseDayLoad } from './useExpenseDayLoad';

export function useExpenseDayPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [expense, setExpense] = useState(null);
  const [busy, setBusy] = useState(false);

  useExpenseDayLoad(setExpense);

  const draft = expense?.status === VISIT_EXPENSE_STATUS.DRAFT;
  const items = expense?.items || [];
  const claimMode = expense?.claimMode || VISIT_EXPENSE_CLAIM_MODE.PER_VISIT;
  const mutationArgs = { id, expense, items, claimMode, setExpense, setBusy, dispatch };

  const patchItem = (itemId, field, value) => {
    setExpense((prev) => ({
      ...prev,
      items: prev.items.map((row) => (row._id === itemId ? { ...row, [field]: value } : row)),
    }));
  };

  return {
    expense,
    busy,
    draft,
    items,
    claimMode,
    isAdmin,
    patchItem,
    setClaimMode: (value) => setExpense((prev) => ({ ...prev, claimMode: value })),
    setDayTotalAmount: (value) => setExpense((prev) => ({ ...prev, dayTotalAmount: value })),
    setGstAmount: (value) => setExpense((prev) => ({ ...prev, gstAmount: value })),
    save: () => saveExpenseDay(mutationArgs),
    submit: () => submitExpenseDay(mutationArgs),
    uploadTicket: (itemId, file) => uploadExpenseTicket({ id, itemId, file, setExpense, setBusy, dispatch }),
  };
}