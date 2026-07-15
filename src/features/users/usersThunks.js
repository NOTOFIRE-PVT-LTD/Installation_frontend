import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';

export const fetchUsers = createAsyncThunk('users/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await userApi.list(params);
    return { items: data.data, meta: data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const fetchUserById = createAsyncThunk('users/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await userApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const createUser = createAsyncThunk('users/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await userApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await userApi.update(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user');
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await userApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
  }
});

export const toggleUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateStatus(id, status);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

export const resetUserPassword = createAsyncThunk('users/resetPassword', async (id, { rejectWithValue }) => {
  try {
    const { data } = await userApi.resetPassword(id);
    return data.message;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reset password');
  }
});

export const updateUserPermissions = createAsyncThunk(
  'users/updatePermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updatePermissions(id, permissions);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update permissions');
    }
  }
);

export const impersonateUser = createAsyncThunk('users/impersonate', async (id, { rejectWithValue }) => {
  try {
    const { data } = await userApi.impersonate(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to log in as this user');
  }
});
