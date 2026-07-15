import { createAsyncThunk } from '@reduxjs/toolkit';
import { tenderApi } from '../../api/tenderApi';

export const fetchTenders = createAsyncThunk('tenders/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await tenderApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tenders');
  }
});

export const fetchTenderById = createAsyncThunk('tenders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await tenderApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tender');
  }
});

export const createTender = createAsyncThunk('tenders/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await tenderApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create tender');
  }
});

export const updateTender = createAsyncThunk('tenders/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await tenderApi.update(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update tender');
  }
});

export const deleteTender = createAsyncThunk('tenders/delete', async (id, { rejectWithValue }) => {
  try {
    await tenderApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete tender');
  }
});
