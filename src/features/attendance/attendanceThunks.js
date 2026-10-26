import { createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../../api/attendanceApi';

export const fetchAttendance = createAsyncThunk('attendance/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance');
  }
});

export const fetchTodayAttendance = createAsyncThunk('attendance/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.today();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch today');
  }
});

export const punchAttendance = createAsyncThunk('attendance/punch', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.punch(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Punch failed');
  }
});
