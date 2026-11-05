import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PageHeader from '../../components/common/PageHeader';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitExpenseApi } from '../../api/visitExpenseApi';
import {
  PRIVATE_KM_RATE,
  ROLES,
  TRANSPORT_MODE,
  VISIT_EXPENSE_CLAIM_MODE,
  VISIT_EXPENSE_STATUS,
} from '../../utils/constants';

const MODES = Object.values(TRANSPORT_MODE);

function itemAmount(row) {
  if (row.transportMode === TRANSPORT_MODE.PRIVATE) {
    return Math.round((Number(row.distanceKm) || 0) * PRIVATE_KM_RATE);
  }
  return Math.max(0, Number(row.fare) || 0);
}

export default function ExpenseDayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [expense, setExpense] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await visitExpenseApi.getById(id);
    setExpense(data.data);
  };

  useEffect(() => {
    load().catch((err) => {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Expense not found', severity: 'error' }));
      navigate('/expenses');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const draft = expense?.status === VISIT_EXPENSE_STATUS.DRAFT;
  const items = expense?.items || [];

  const patchItem = (itemId, field, value) => {
    setExpense((prev) => ({
      ...prev,
      items: prev.items.map((row) => (row._id === itemId ? { ...row, [field]: value } : row)),
    }));
  };

  const claimMode = expense?.claimMode || VISIT_EXPENSE_CLAIM_MODE.PER_VISIT;

  const payload = () => ({
    claimMode,
    dayTotalAmount: expense.dayTotalAmount || 0,
    items: items.map((row) => ({
      visit: row.visit?._id || row.visit,
      transportMode: row.transportMode,
      fare: row.fare,
    })),
    gstAmount: expense.gstAmount || 0,
  });

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await visitExpenseApi.update(id, payload());
      setExpense(data.data);
      dispatch(showSnackbar({ message: 'Expense saved' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not save', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      await visitExpenseApi.update(id, payload());
      const { data } = await visitExpenseApi.submit(id);
      setExpense(data.data);
      dispatch(showSnackbar({ message: 'Expense submitted for approval' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit', severity: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const uploadTicket = async (itemId, file) => {
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
  };

  if (!expense) return null;

  const liveItems = items.map((row) => ({ ...row, amount: itemAmount(row) }));
  const privateKm = liveItems
    .filter((row) => row.transportMode === TRANSPORT_MODE.PRIVATE)
    .reduce((sum, row) => sum + (Number(row.distanceKm) || 0), 0);
  const privateAmount = liveItems
    .filter((row) => row.transportMode === TRANSPORT_MODE.PRIVATE)
    .reduce((sum, row) => sum + row.amount, 0);
  const publicAmount = liveItems
    .filter((row) => row.transportMode !== TRANSPORT_MODE.PRIVATE)
    .reduce((sum, row) => sum + row.amount, 0);
  const liveTotalKm = liveItems.reduce((sum, row) => sum + (Number(row.distanceKm) || 0), 0);
  const liveTravel = privateAmount + publicAmount;
  const gstAmount = Math.max(0, Number(expense.gstAmount) || 0);
  const dayTotalAmount = Math.max(0, Number(expense.dayTotalAmount) || 0);
  const liveTotal =
    (claimMode === VISIT_EXPENSE_CLAIM_MODE.DAY_TOTAL ? dayTotalAmount : liveTravel) + gstAmount;
  const perVisitMode = claimMode === VISIT_EXPENSE_CLAIM_MODE.PER_VISIT;

  return (
    <>
      <PageHeader
        title={`Expenses · ${expense.date}`}
        subtitle={`${items.length} visits · ${liveTotalKm || 0} km · ₹${Number(liveTotal || 0).toLocaleString('en-IN')}`}
      />
      <Chip label={expense.status.replaceAll('_', ' ')} sx={{ mb: 2 }} color={expense.status === VISIT_EXPENSE_STATUS.APPROVED ? 'success' : 'default'} />
      {expense.adminComment && (
        <Typography sx={{ mb: 2 }} color="error">
          Admin: {expense.adminComment}
        </Typography>
      )}
      {draft && !isAdmin && (
        <TextField
          select
          size="small"
          label="Claim type"
          value={claimMode}
          onChange={(e) => setExpense((prev) => ({ ...prev, claimMode: e.target.value }))}
          sx={{ mb: 2, minWidth: 260 }}
        >
          <MenuItem value={VISIT_EXPENSE_CLAIM_MODE.PER_VISIT}>Per visit</MenuItem>
          <MenuItem value={VISIT_EXPENSE_CLAIM_MODE.DAY_TOTAL}>Total for the day</MenuItem>
        </TextField>
      )}
      {!draft && (
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Claim type: {perVisitMode ? 'Per visit' : 'Total for the day'}
        </Typography>
      )}
      {perVisitMode ? (
        <Stack spacing={1.5}>
          {liveItems.map((row, index) => {
            const visit = row.visit || {};
            const privateMode = row.transportMode === TRANSPORT_MODE.PRIVATE;
            return (
              <Card key={row._id} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>
                    Visit {index + 1} — {visit.customer?.companyName || 'Visit'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1 }}>
                    Travel {row.distanceKm || 0} km
                    {privateMode ? ` · ₹${PRIVATE_KM_RATE}/km` : ''}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      select
                      size="small"
                      label="Transport"
                      value={row.transportMode}
                      disabled={!draft}
                      onChange={(e) => patchItem(row._id, 'transportMode', e.target.value)}
                      sx={{ minWidth: 160 }}
                    >
                      {MODES.map((mode) => (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      ))}
                    </TextField>
                    {!privateMode && (
                      <TextField
                        size="small"
                        type="number"
                        label="Fare ₹"
                        value={row.fare || ''}
                        disabled={!draft}
                        onChange={(e) => patchItem(row._id, 'fare', e.target.value)}
                      />
                    )}
                    <Typography sx={{ fontWeight: 700, alignSelf: 'center' }}>₹{Number(row.amount || 0).toLocaleString('en-IN')}</Typography>
                  </Stack>
                  {!privateMode && draft && (
                    <Button component="label" size="small" sx={{ mt: 1 }}>
                      {row.ticketUrl ? 'Replace ticket' : 'Upload ticket (optional)'}
                      <input hidden type="file" accept="image/*,application/pdf" onChange={(e) => uploadTicket(row._id, e.target.files?.[0])} />
                    </Button>
                  )}
                  {row.ticketUrl && (
                    <Button size="small" href={row.ticketUrl} target="_blank" rel="noreferrer" sx={{ mt: 1 }}>
                      View ticket
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Day total expense</Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8125rem' }}>
              One amount for all {items.length} visits today ({liveTotalKm || 0} km travelled).
            </Typography>
            {draft && !isAdmin ? (
              <TextField
                size="small"
                type="number"
                label="Total amount ₹"
                value={expense.dayTotalAmount || ''}
                onChange={(e) => setExpense((prev) => ({ ...prev, dayTotalAmount: e.target.value }))}
                sx={{ maxWidth: 220 }}
              />
            ) : (
              <Typography sx={{ fontWeight: 700 }}>₹{dayTotalAmount.toLocaleString('en-IN')}</Typography>
            )}
          </CardContent>
        </Card>
      )}
      <Card sx={{ mt: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Expense summary</Typography>
          <Typography>Date: {expense.date}</Typography>
          <Typography>Total visits: {items.length}</Typography>
          <Typography>Total kilometers: {liveTotalKm}</Typography>
          {perVisitMode ? (
            <>
              <Typography>
                Private travel: {privateKm} km × ₹{PRIVATE_KM_RATE}/km = ₹{privateAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography>Public transport fares: ₹{publicAmount.toLocaleString('en-IN')}</Typography>
            </>
          ) : (
            <Typography>Day total claim: ₹{dayTotalAmount.toLocaleString('en-IN')}</Typography>
          )}
          {draft && !isAdmin ? (
            <TextField
              size="small"
              type="number"
              label="GST ₹ (optional)"
              value={expense.gstAmount || ''}
              onChange={(e) => setExpense((prev) => ({ ...prev, gstAmount: e.target.value }))}
              sx={{ mt: 1.5, maxWidth: 220 }}
            />
          ) : (
            <Typography>GST: ₹{gstAmount.toLocaleString('en-IN')}</Typography>
          )}
          <Typography sx={{ fontWeight: 700, mt: 1 }}>Grand total: ₹{liveTotal.toLocaleString('en-IN')}</Typography>
        </CardContent>
      </Card>
      {draft && !isAdmin && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={busy} onClick={save}>
            Save
          </Button>
          <Button variant="contained" disabled={busy} onClick={submit}>
            Submit expense
          </Button>
        </Stack>
      )}
    </>
  );
}
