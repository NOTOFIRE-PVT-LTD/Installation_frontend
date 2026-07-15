import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchTenders, fetchTenderById, createTender, updateTender, deleteTender } from './tendersThunks';

const { slice } = createResourceSlice('tenders', { fetchList: fetchTenders, fetchOne: fetchTenderById });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchTenders, fetchTenderById, createTender, updateTender, deleteTender };
