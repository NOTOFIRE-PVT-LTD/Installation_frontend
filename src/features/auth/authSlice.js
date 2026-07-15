import { createSlice } from '@reduxjs/toolkit';
import { login, fetchMe, logout, updateProfile } from './authThunks';

const initialState = {
  user: null,
  permissions: null,
  accessToken: null,
  status: 'idle', // idle | loading | succeeded | failed
  bootstrapped: false,
  error: null,
  impersonatorAdmin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.accessToken = action.payload.accessToken;
    },
    sessionExpired(state) {
      state.user = null;
      state.permissions = null;
      state.accessToken = null;
      state.impersonatorAdmin = null;
      state.bootstrapped = true;
    },
    startImpersonation(state, action) {
      state.impersonatorAdmin = { user: state.user, permissions: state.permissions, accessToken: state.accessToken };
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.accessToken = action.payload.accessToken;
    },
    stopImpersonation(state) {
      if (!state.impersonatorAdmin) return;
      state.user = state.impersonatorAdmin.user;
      state.permissions = state.impersonatorAdmin.permissions;
      state.accessToken = state.impersonatorAdmin.accessToken;
      state.impersonatorAdmin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.accessToken = action.payload.accessToken;
        state.bootstrapped = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.bootstrapped = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.permissions = null;
        state.accessToken = null;
        state.bootstrapped = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.permissions = null;
        state.accessToken = null;
        state.impersonatorAdmin = null;
        state.status = 'idle';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setCredentials, sessionExpired, startImpersonation, stopImpersonation } = authSlice.actions;
export default authSlice.reducer;
