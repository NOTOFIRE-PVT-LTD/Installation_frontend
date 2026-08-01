import { createAsyncThunk } from '@reduxjs/toolkit';
import { nitTenderApi } from '../../api/nitTenderApi';

export const fetchNitTenders = createAsyncThunk('nitTenders/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await nitTenderApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tenders');
  }
});

export const fetchNitTenderById = createAsyncThunk('nitTenders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await nitTenderApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tender');
  }
});

export const createNitTender = createAsyncThunk('nitTenders/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await nitTenderApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create tender');
  }
});

export const updateNitTender = createAsyncThunk('nitTenders/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await nitTenderApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update tender');
  }
});

export const deleteNitTender = createAsyncThunk('nitTenders/delete', async (id, { rejectWithValue }) => {
  try {
    await nitTenderApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete tender');
  }
});
