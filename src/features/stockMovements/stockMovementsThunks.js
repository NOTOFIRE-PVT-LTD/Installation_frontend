import { createAsyncThunk } from '@reduxjs/toolkit';
import { stockApi } from '../../api/stockApi';

export const fetchStockMovements = createAsyncThunk(
  'stockMovements/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await stockApi.listMovements(params);
      return { items: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock movements');
    }
  }
);

export const createStockMovement = createAsyncThunk(
  'stockMovements/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await stockApi.createMovement(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record stock movement');
    }
  }
);

export const updateStockMovement = createAsyncThunk(
  'stockMovements/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await stockApi.updateMovement(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stock movement');
    }
  }
);

export const deleteStockMovement = createAsyncThunk(
  'stockMovements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await stockApi.removeMovement(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete stock movement');
    }
  }
);

export const deleteStockMovements = createAsyncThunk(
  'stockMovements/bulkDelete',
  async (ids, { rejectWithValue }) => {
    try {
      const normalized = (Array.isArray(ids) ? ids : [])
        .map((value) => {
          if (value == null) return '';
          if (typeof value === 'object') return String(value._id ?? value.id ?? '').trim();
          return String(value).trim();
        })
        .filter((id) => /^[a-f\d]{24}$/i.test(id));
      if (!normalized.length) {
        return rejectWithValue('No valid movements selected');
      }
      const { data } = await stockApi.removeMovements(normalized);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete stock movements');
    }
  }
);

export const importStockReceives = createAsyncThunk(
  'stockMovements/importReceives',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await stockApi.importReceives(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to import receive records');
    }
  }
);
