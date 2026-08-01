import { createAsyncThunk } from '@reduxjs/toolkit';
import { callLetterApi } from '../../api/callLetterApi';

export const fetchCallLetters = createAsyncThunk(
  'callLetters/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await callLetterApi.list(params);
      return { items: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch call letters');
    }
  }
);

export const fetchCallLetterById = createAsyncThunk(
  'callLetters/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await callLetterApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch call letter');
    }
  }
);

export const createCallLetter = createAsyncThunk(
  'callLetters/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await callLetterApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create call letter');
    }
  }
);

export const updateCallLetter = createAsyncThunk(
  'callLetters/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await callLetterApi.update(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update call letter');
    }
  }
);

export const deleteCallLetter = createAsyncThunk(
  'callLetters/delete',
  async (id, { rejectWithValue }) => {
    try {
      await callLetterApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete call letter');
    }
  }
);
