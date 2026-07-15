import { createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../api/projectApi';

export const fetchProjects = createAsyncThunk('projects/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const fetchProjectOptions = createAsyncThunk('projects/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.options();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project options');
  }
});

export const createProject = createAsyncThunk('projects/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await projectApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

export const addStation = createAsyncThunk('projects/addStation', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.addStation(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add station');
  }
});

export const updateStation = createAsyncThunk(
  'projects/updateStation',
  async ({ id, stationId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.updateStation(id, stationId, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update station');
    }
  }
);

export const removeStation = createAsyncThunk(
  'projects/removeStation',
  async ({ id, stationId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.removeStation(id, stationId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete station');
    }
  }
);

export const fetchApprovalsQueue = createAsyncThunk('projects/fetchApprovalsQueue', async (_, { rejectWithValue }) => {
  try {
    const { data } = await projectApi.approvalsQueue();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch approvals queue');
  }
});

export const submitStationClaim = createAsyncThunk(
  'projects/submitStationClaim',
  async ({ id, stationId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.submitStationClaim(id, stationId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit claim');
    }
  }
);

export const approveStationClaim = createAsyncThunk(
  'projects/approveStationClaim',
  async ({ id, stationId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.approveStationClaim(id, stationId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve claim');
    }
  }
);

export const rejectStationClaim = createAsyncThunk(
  'projects/rejectStationClaim',
  async ({ id, stationId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.rejectStationClaim(id, stationId, reason);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject claim');
    }
  }
);

export const markStationPaid = createAsyncThunk(
  'projects/markStationPaid',
  async ({ id, stationId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.markStationPaid(id, stationId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as paid');
    }
  }
);

export const addDailyReport = createAsyncThunk(
  'projects/addDailyReport',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.addDailyReport(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add daily report');
    }
  }
);

export const removeDailyReport = createAsyncThunk(
  'projects/removeDailyReport',
  async ({ id, reportId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.removeDailyReport(id, reportId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete daily report');
    }
  }
);

export const addStationDailyReport = createAsyncThunk(
  'projects/addStationDailyReport',
  async ({ id, stationId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.addStationDailyReport(id, stationId, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add station daily report');
    }
  }
);

export const removeStationDailyReport = createAsyncThunk(
  'projects/removeStationDailyReport',
  async ({ id, stationId, reportId }, { rejectWithValue }) => {
    try {
      const { data } = await projectApi.removeStationDailyReport(id, stationId, reportId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete station daily report');
    }
  }
);
