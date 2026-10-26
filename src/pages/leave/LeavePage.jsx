import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { leaveApi } from '../../api/leaveApi';
import { LEAVE_PAY } from '../../utils/constants';

dayjs.extend(customParseFormat);

const EMPTY = { fromDate: '', toDate: '', startTime: '', endTime: '', reason: '', payType: LEAVE_PAY.UNPAID };

export default function LeavePage() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const paidLocked = rows.some(
    (row) => row.payType === LEAVE_PAY.PAID && (row.status === 'PENDING' || row.status === 'APPROVED')
  );

  const load = async () => {
    try {
      const { data } = await leaveApi.list({ pageSize: 50 });
      setRows(data.data || []);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load leave', severity: 'error' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await leaveApi.create({
        ...form,
        payType: paidLocked ? LEAVE_PAY.UNPAID : form.payType,
      });
      dispatch(showSnackbar({ message: 'Leave submitted. Open Approvals to see pending status.' }));
      setForm(EMPTY);
      load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not apply for leave', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Leave" subtitle="Apply for leave. Paid leave can be used only once. Track status under Approvals." />
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>New request</Typography>
          <Stack component="form" spacing={1.5} onSubmit={submit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <DatePicker
                label="From"
                format="DD/MM/YYYY"
                value={form.fromDate ? dayjs(form.fromDate) : null}
                onChange={(value) => setForm((prev) => ({ ...prev, fromDate: value ? value.format('YYYY-MM-DD') : '' }))}
                slotProps={{ textField: { required: true, size: 'small', sx: { minWidth: 160 } } }}
              />
              <DatePicker
                label="To"
                format="DD/MM/YYYY"
                value={form.toDate ? dayjs(form.toDate) : null}
                onChange={(value) => setForm((prev) => ({ ...prev, toDate: value ? value.format('YYYY-MM-DD') : '' }))}
                slotProps={{ textField: { required: true, size: 'small', sx: { minWidth: 160 } } }}
              />
              <TimePicker
                label="Start time"
                ampm
                value={form.startTime ? dayjs(form.startTime, 'HH:mm') : null}
                onChange={(value) => setForm((prev) => ({ ...prev, startTime: value ? value.format('HH:mm') : '' }))}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
              <TimePicker
                label="End time"
                ampm
                value={form.endTime ? dayjs(form.endTime, 'HH:mm') : null}
                onChange={(value) => setForm((prev) => ({ ...prev, endTime: value ? value.format('HH:mm') : '' }))}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
            </Stack>
            <TextField
              required
              size="small"
              label="Reason"
              value={form.reason}
              onChange={setField('reason')}
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                select
                size="small"
                label="Leave type"
                value={paidLocked ? LEAVE_PAY.UNPAID : form.payType}
                onChange={setField('payType')}
                sx={{ minWidth: 180 }}
                helperText={paidLocked ? 'Paid leave already used (pending or approved).' : 'Paid leave is allowed once.'}
              >
                <MenuItem value={LEAVE_PAY.UNPAID}>Unpaid</MenuItem>
                <MenuItem value={LEAVE_PAY.PAID} disabled={paidLocked}>
                  Paid
                </MenuItem>
              </TextField>
              <Button type="submit" variant="contained" disabled={busy} sx={{ alignSelf: { sm: 'flex-start' }, mt: { sm: 0.25 } }}>
                {busy ? 'Submitting…' : 'Apply'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
