import { createAsyncThunk } from '@reduxjs/toolkit';
import { divisionApi } from '../../api/divisionApi';

export const fetchDivisions = createAsyncThunk('divisions/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await divisionApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch divisions');
  }
});

export const fetchDivisionById = createAsyncThunk('divisions/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await divisionApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch division');
  }
});

export const createDivision = createAsyncThunk('divisions/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await divisionApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create division');
  }
});

export const updateDivision = createAsyncThunk('divisions/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await divisionApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update division');
  }
});

export const deleteDivision = createAsyncThunk('divisions/delete', async (id, { rejectWithValue }) => {
  try {
    await divisionApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete division');
  }
});
