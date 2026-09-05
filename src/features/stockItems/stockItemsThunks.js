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

export const importStockItems = createAsyncThunk('stockItems/import', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await stockApi.importItems(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to import stock items');
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

export const deleteStockItems = createAsyncThunk('stockItems/bulkDelete', async (ids, { rejectWithValue }) => {
  try {
    const normalized = (Array.isArray(ids) ? ids : [])
      .map((value) => {
        if (value == null) return '';
        if (typeof value === 'object') return String(value._id ?? value.id ?? '').trim();
        return String(value).trim();
      })
      .filter((id) => /^[a-f\d]{24}$/i.test(id));
    if (!normalized.length) {
      return rejectWithValue('No valid items selected');
    }
    const { data } = await stockApi.removeItems(normalized);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete stock items');
  }
});
