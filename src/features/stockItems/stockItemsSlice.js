import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchStockItems, fetchStockItemById, fetchStockItemOptions } from './stockItemsThunks';

const { slice } = createResourceSlice(
  'stockItems',
  {
    fetchList: fetchStockItems,
    fetchOne: fetchStockItemById,
  },
  {
    initialState: { options: [] },
    extraReducers: (builder) => {
      builder.addCase(fetchStockItemOptions.fulfilled, (state, action) => {
        state.options = action.payload || [];
      });
    },
  }
);

export const { clearCurrent } = slice.actions;
export default slice.reducer;
