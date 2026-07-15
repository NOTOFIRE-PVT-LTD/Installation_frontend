import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportApi } from '../../api/reportApi';

export const fetchReports = createAsyncThunk('reports/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await reportApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reports');
  }
});

export const fetchReportById = createAsyncThunk('reports/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await reportApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch report');
  }
});

export const createReport = createAsyncThunk('reports/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await reportApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit report');
  }
});

export const updateReport = createAsyncThunk('reports/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await reportApi.update(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update report');
  }
});

export const deleteReport = createAsyncThunk('reports/delete', async (id, { rejectWithValue }) => {
  try {
    await reportApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete report');
  }
});

export const verifyReport = createAsyncThunk('reports/verify', async (id, { rejectWithValue }) => {
  try {
    const { data } = await reportApi.verify(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to verify report');
  }
});
