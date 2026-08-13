import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchBoms, fetchBomById } from './bomThunks';

const { slice } = createResourceSlice('bom', {
  fetchList: fetchBoms,
  fetchOne: fetchBomById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
