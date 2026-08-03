import { createAsyncThunk } from '@reduxjs/toolkit';
import { bgApplicationApi } from '../../api/bgApplicationApi';

export const fetchBgApplications = createAsyncThunk('bgApplications/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await bgApplicationApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch BG applications');
  }
});

export const fetchBgApplicationById = createAsyncThunk('bgApplications/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bgApplicationApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch BG application');
  }
});

export const createBgApplication = createAsyncThunk('bgApplications/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await bgApplicationApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create BG application');
  }
});

export const updateBgApplication = createAsyncThunk(
  'bgApplications/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await bgApplicationApi.update(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update BG application');
    }
  }
);

export const deleteBgApplication = createAsyncThunk('bgApplications/delete', async (id, { rejectWithValue }) => {
  try {
    await bgApplicationApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete BG application');
  }
});
