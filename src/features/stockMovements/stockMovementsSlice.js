import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchStockMovements } from './stockMovementsThunks';

const { slice } = createResourceSlice('stockMovements', {
  fetchList: fetchStockMovements,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
