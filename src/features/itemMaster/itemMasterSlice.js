import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchMasterItems, fetchMasterItemById } from './itemMasterThunks';

const { slice } = createResourceSlice('itemMaster', {
  fetchList: fetchMasterItems,
  fetchOne: fetchMasterItemById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
