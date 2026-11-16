import { visitApi } from '../../api/visitApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { VISIT_TYPE } from '../../utils/constants';

function visitPayloadFromRow(v, isAdmin, selectedSalesperson) {
  return {
    salesperson: isAdmin ? selectedSalesperson : undefined,
    customer: v.customer,
    visitType: VISIT_TYPE.HOURLY,
    visitDate: v.date,
    plannedTime: v.plannedTime?.slice(0, 5) || '09:30',
    endTime: v.endTime?.slice(0, 5) || '11:30',
    purpose: v.purpose.trim(),
    notes: (v.notes || '').trim(),
  };
}

export async function submitVisitPlanRows({ visits, isAdmin, selectedSalesperson, dispatch }) {
  const promises = visits.map((v) => visitApi.create(visitPayloadFromRow(v, isAdmin, selectedSalesperson)));
  await Promise.all(promises);
  dispatch(
    showSnackbar({ message: `Successfully planned ${visits.length} visit${visits.length > 1 ? 's' : ''}!` })
  );
}

export function visitPlanSubmitErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Could not save visit plan';
}