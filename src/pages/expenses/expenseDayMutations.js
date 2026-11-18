import { showSnackbar } from '../../features/ui/uiSlice';
import { visitExpenseApi } from '../../api/visitExpenseApi';
import { buildExpenseUpdatePayload } from './expenseDayPayload';

function updatePayload(expense, items, claimMode) {
  return buildExpenseUpdatePayload(expense, items, claimMode);
}

export async function saveExpenseDay({ id, expense, items, claimMode, setExpense, setBusy, dispatch }) {
  setBusy(true);
  try {
    const { data } = await visitExpenseApi.update(id, updatePayload(expense, items, claimMode));
    setExpense(data.data);
    dispatch(showSnackbar({ message: 'Expense saved' }));
  } catch (err) {
    dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not save', severity: 'error' }));
  } finally {
    setBusy(false);
  }
}

export async function submitExpenseDay({ id, expense, items, claimMode, setExpense, setBusy, dispatch }) {
  setBusy(true);
  try {
    await visitExpenseApi.update(id, updatePayload(expense, items, claimMode));
    const { data } = await visitExpenseApi.submit(id);
    setExpense(data.data);
    dispatch(showSnackbar({ message: 'Expense submitted for approval' }));
  } catch (err) {
    dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit', severity: 'error' }));
  } finally {
    setBusy(false);
  }
}

export async function uploadExpenseTicket({ id, itemId, file, setExpense, setBusy, dispatch }) {
  if (!file) return;
  setBusy(true);
  try {
    const { data } = await visitExpenseApi.uploadTicket(id, itemId, file);
    setExpense(data.data);
    dispatch(showSnackbar({ message: 'Ticket uploaded' }));
  } catch (err) {
    dispatch(showSnackbar({ message: err.response?.data?.message || 'Upload failed', severity: 'error' }));
  } finally {
    setBusy(false);
  }
}