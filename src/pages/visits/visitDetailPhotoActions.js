import { visitApi } from '../../api/visitApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { readLocation } from '../../utils/readLocation';
import { VISIT_STATUS } from '../../utils/constants';

function appendLocationToForm(form, loc) {
  form.append('lat', String(loc.lat));
  form.append('lng', String(loc.lng));
  if (loc.address) form.append('address', loc.address);
}

function appendProceedAnyway(form, options) {
  if (!options.proceedAnyway) return;
  form.append('proceedAnyway', 'true');
  if (options.explanation) form.append('explanation', options.explanation);
}

async function requireGpsLocation() {
  const loc = await readLocation();
  if (loc.lat == null) throw new Error(loc.error || 'GPS location is required');
  return loc;
}

function checkInSnackbar(dispatch, visit) {
  if (visit?.status === VISIT_STATUS.PENDING_APPROVAL) {
    dispatch(
      showSnackbar({
        message: 'Checked in outside location. Submitted to Admin for approval.',
        severity: 'warning',
      })
    );
    return;
  }
  dispatch(showSnackbar({ message: 'Checked in successfully!' }));
}

function checkOutSnackbar(dispatch, visit) {
  if (visit?.status === VISIT_STATUS.PENDING_APPROVAL) {
    dispatch(
      showSnackbar({
        message: 'Checked out. Visit is Pending Admin Approval for location exception.',
        severity: 'warning',
      })
    );
    return;
  }
  dispatch(showSnackbar({ message: 'Checked out successfully!' }));
}

export async function runVisitCheckIn({ id, photoFile, options, dispatch }) {
  const loc = await requireGpsLocation();
  const form = new FormData();
  appendLocationToForm(form, loc);
  form.append('photo', photoFile);
  appendProceedAnyway(form, options);
  const { data } = await visitApi.checkIn(id, form);
  checkInSnackbar(dispatch, data.data);
  return data.data;
}

export async function runVisitCheckOut({ id, photoFile, remark, options, dispatch }) {
  const cleanRemark = String(remark || '').trim();
  if (!cleanRemark) {
    dispatch(showSnackbar({ message: 'Please enter a visit remark before checking out', severity: 'warning' }));
    return null;
  }
  const loc = await requireGpsLocation();
  const form = new FormData();
  appendLocationToForm(form, loc);
  form.append('photo', photoFile);
  form.append('outcomeNotes', cleanRemark);
  appendProceedAnyway(form, options);
  const { data } = await visitApi.checkOut(id, form);
  checkOutSnackbar(dispatch, data.data);
  return data.data;
}

export function visitActionErrorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}