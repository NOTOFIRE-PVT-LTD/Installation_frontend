import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    snackbar: { open: false, message: '', severity: 'success' },
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showSnackbar(state, action) {
      state.snackbar = { open: true, message: action.payload.message, severity: action.payload.severity || 'success' };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { toggleSidebar, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
