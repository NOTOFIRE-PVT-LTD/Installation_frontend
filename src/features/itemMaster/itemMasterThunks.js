import { createAsyncThunk } from '@reduxjs/toolkit';
import { itemMasterApi } from '../../api/itemMasterApi';

export const fetchMasterItems = createAsyncThunk('itemMaster/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await itemMasterApi.listItems(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch master items');
  }
});

export const fetchMasterItemById = createAsyncThunk('itemMaster/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await itemMasterApi.getItemById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch master item');
  }
});

export const createMasterItem = createAsyncThunk('itemMaster/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await itemMasterApi.createItem(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create master item');
  }
});

export const updateMasterItem = createAsyncThunk(
  'itemMaster/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await itemMasterApi.updateItem(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update master item');
    }
  }
);

export const deleteMasterItem = createAsyncThunk('itemMaster/delete', async (id, { rejectWithValue }) => {
  try {
    await itemMasterApi.removeItem(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete master item');
  }
});
