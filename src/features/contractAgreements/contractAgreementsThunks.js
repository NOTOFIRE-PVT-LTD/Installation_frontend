import { createAsyncThunk } from '@reduxjs/toolkit';
import { contractAgreementApi } from '../../api/contractAgreementApi';

export const fetchContractAgreements = createAsyncThunk(
  'contractAgreements/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await contractAgreementApi.list(params);
      return { items: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contract agreements');
    }
  }
);

export const fetchContractAgreementById = createAsyncThunk(
  'contractAgreements/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await contractAgreementApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contract agreement');
    }
  }
);

export const createContractAgreement = createAsyncThunk(
  'contractAgreements/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await contractAgreementApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create contract agreement');
    }
  }
);

export const updateContractAgreement = createAsyncThunk(
  'contractAgreements/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await contractAgreementApi.update(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update contract agreement');
    }
  }
);

export const deleteContractAgreement = createAsyncThunk(
  'contractAgreements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await contractAgreementApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete contract agreement');
    }
  }
);
