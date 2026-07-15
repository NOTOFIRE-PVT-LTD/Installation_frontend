import { createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../../api/paymentApi';

export const fetchPayments = createAsyncThunk('payments/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await paymentApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments');
  }
});

export const fetchPaymentById = createAsyncThunk('payments/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await paymentApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch payment');
  }
});

export const createPayment = createAsyncThunk('payments/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await paymentApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create payment');
  }
});

export const updatePayment = createAsyncThunk('payments/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await paymentApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update payment');
  }
});

export const deletePayment = createAsyncThunk('payments/delete', async (id, { rejectWithValue }) => {
  try {
    await paymentApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete payment');
  }
});

export const updatePaymentStatus = createAsyncThunk(
  'payments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.updateStatus(id, status);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
    }
  }
);
