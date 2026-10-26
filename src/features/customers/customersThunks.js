import { createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from '../../api/customerApi';

function rejectError(err, fallback) {
  return {
    message: err.response?.data?.message || fallback,
    matches: err.response?.data?.errors,
  };
}

export const fetchCustomers = createAsyncThunk('customers/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
  }
});

export const createCustomer = createAsyncThunk('customers/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(rejectError(err, 'Failed to create customer'));
  }
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(rejectError(err, 'Failed to update customer'));
  }
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id, { rejectWithValue }) => {
  try {
    await customerApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete customer');
  }
});
