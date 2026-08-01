import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchNitTenders, fetchNitTenderById } from './nitTendersThunks';

const { slice } = createResourceSlice('nitTenders', {
  fetchList: fetchNitTenders,
  fetchOne: fetchNitTenderById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
