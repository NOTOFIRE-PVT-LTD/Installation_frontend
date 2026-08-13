import { createAsyncThunk } from '@reduxjs/toolkit';
import { bomApi } from '../../api/bomApi';

export const fetchBoms = createAsyncThunk('bom/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await bomApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch BOMs');
  }
});

export const fetchBomById = createAsyncThunk('bom/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bomApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch BOM');
  }
});

export const createBom = createAsyncThunk('bom/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await bomApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create BOM');
  }
});

export const updateBom = createAsyncThunk('bom/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await bomApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update BOM');
  }
});

export const deleteBom = createAsyncThunk('bom/delete', async (id, { rejectWithValue }) => {
  try {
    await bomApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete BOM');
  }
});

export const fetchBomProductions = createAsyncThunk(
  'bomProductions/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await bomApi.listProductions(params);
      return { items: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch BOM productions');
    }
  }
);

export const previewBomProduction = createAsyncThunk(
  'bom/previewProduction',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await bomApi.previewProduction(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to preview production');
    }
  }
);

export const confirmBomProduction = createAsyncThunk(
  'bom/confirmProduction',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await bomApi.confirmProduction(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to confirm production');
    }
  }
);
