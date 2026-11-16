import { showSnackbar } from '../../features/ui/uiSlice';

export function validateVisitPlanRows(visits, dispatch, isAdmin, selectedSalesperson) {
  if (isAdmin && !selectedSalesperson) {
    dispatch(showSnackbar({ message: 'Please select a salesperson to assign this visit plan', severity: 'error' }));
    return false;
  }
  for (let i = 0; i < visits.length; i += 1) {
    const v = visits[i];
    if (!v.customer) {
      dispatch(showSnackbar({ message: `Please select a customer for Visit #${i + 1}`, severity: 'error' }));
      return false;
    }
    if (!v.date) {
      dispatch(showSnackbar({ message: `Please pick a date for Visit #${i + 1}`, severity: 'error' }));
      return false;
    }
    if (!v.purpose?.trim()) {
      dispatch(showSnackbar({ message: `Please enter a purpose for Visit #${i + 1}`, severity: 'error' }));
      return false;
    }
  }
  return true;
}