import { createAsyncThunk } from '@reduxjs/toolkit';
import { stockApi } from '../../api/stockApi';

export const fetchStockItems = createAsyncThunk('stockItems/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await stockApi.listItems(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock items');
  }
});

export const fetchStockItemById = createAsyncThunk('stockItems/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await stockApi.getItemById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock item');
  }
});

export const fetchStockItemOptions = createAsyncThunk('stockItems/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    const { data } = await stockApi.itemOptions();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock item options');
  }
});

export const createStockItem = createAsyncThunk('stockItems/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await stockApi.createItem(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create stock item');
  }
});

export const updateStockItem = createAsyncThunk(
  'stockItems/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await stockApi.updateItem(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stock item');
    }
  }
);

export const deleteStockItem = createAsyncThunk('stockItems/delete', async (id, { rejectWithValue }) => {
  try {
    await stockApi.removeItem(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete stock item');
  }
});
