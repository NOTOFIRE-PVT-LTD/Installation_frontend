import { createSlice } from '@reduxjs/toolkit';

// Shared shape for server-paginated CRUD resources (Users/Projects/Reports/Payments).
// `thunks` must include at least `fetchList`; `create`/`update`/`remove` are optional.
export function createResourceSlice(name, thunks, extend) {
  const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    status: 'idle',
    error: null,
    current: null,
    currentStatus: 'idle',
    ...(extend?.initialState || {}),
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearCurrent(state) {
        state.current = null;
        state.currentStatus = 'idle';
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(thunks.fetchList.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(thunks.fetchList.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload.items;
          state.total = action.payload.meta.total;
          state.page = action.payload.meta.page;
          state.pageSize = action.payload.meta.pageSize;
          state.totalPages = action.payload.meta.totalPages;
        })
        .addCase(thunks.fetchList.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });

      if (thunks.fetchOne) {
        builder
          .addCase(thunks.fetchOne.pending, (state) => {
            state.currentStatus = 'loading';
          })
          .addCase(thunks.fetchOne.fulfilled, (state, action) => {
            state.currentStatus = 'succeeded';
            state.current = action.payload;
          })
          .addCase(thunks.fetchOne.rejected, (state, action) => {
            state.currentStatus = 'failed';
            state.error = action.payload;
          });
      }

      extend?.extraReducers?.(builder);
    },
  });

  return { slice, initialState };
}
