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
