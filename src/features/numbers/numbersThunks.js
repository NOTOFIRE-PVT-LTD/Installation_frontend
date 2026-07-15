import { createAsyncThunk } from '@reduxjs/toolkit';
import { numberDirectoryApi } from '../../api/numberDirectoryApi';

export const fetchNumbers = createAsyncThunk('numbers/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await numberDirectoryApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch entries');
  }
});

export const createNumber = createAsyncThunk('numbers/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await numberDirectoryApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create entry');
  }
});

export const updateNumber = createAsyncThunk('numbers/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await numberDirectoryApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update entry');
  }
});

export const deleteNumber = createAsyncThunk('numbers/delete', async (id, { rejectWithValue }) => {
  try {
    await numberDirectoryApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete entry');
  }
});

export const importNumbers = createAsyncThunk('numbers/import', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await numberDirectoryApi.importFile(formData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Import failed');
  }
});
