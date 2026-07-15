import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchDivisions, fetchDivisionById, createDivision, updateDivision, deleteDivision } from './divisionsThunks';

const { slice } = createResourceSlice('divisions', { fetchList: fetchDivisions, fetchOne: fetchDivisionById });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchDivisions, fetchDivisionById, createDivision, updateDivision, deleteDivision };
