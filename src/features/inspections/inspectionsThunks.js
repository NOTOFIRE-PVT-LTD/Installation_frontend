import { createAsyncThunk } from '@reduxjs/toolkit';
import { inspectionApi } from '../../api/inspectionApi';

export const fetchInspections = createAsyncThunk('inspections/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await inspectionApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch inspections');
  }
});

export const fetchInspectionById = createAsyncThunk('inspections/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await inspectionApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch inspection');
  }
});

export const createInspection = createAsyncThunk('inspections/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await inspectionApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create inspection');
  }
});

export const updateInspection = createAsyncThunk(
  'inspections/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await inspectionApi.update(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update inspection');
    }
  }
);

export const deleteInspection = createAsyncThunk('inspections/delete', async (id, { rejectWithValue }) => {
  try {
    await inspectionApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete inspection');
  }
});
