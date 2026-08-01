import { createAsyncThunk } from '@reduxjs/toolkit';
import { financialDocumentApi } from '../../api/financialDocumentApi';

export const fetchFinancialDocuments = createAsyncThunk(
  'financialDocuments/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await financialDocumentApi.list(params);
      return { items: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch financial documents');
    }
  }
);

export const fetchFinancialDocumentById = createAsyncThunk(
  'financialDocuments/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await financialDocumentApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch financial document');
    }
  }
);

export const createFinancialDocument = createAsyncThunk(
  'financialDocuments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await financialDocumentApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create financial document');
    }
  }
);

export const updateFinancialDocument = createAsyncThunk(
  'financialDocuments/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await financialDocumentApi.update(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update financial document');
    }
  }
);

export const deleteFinancialDocument = createAsyncThunk(
  'financialDocuments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await financialDocumentApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete financial document');
    }
  }
);
