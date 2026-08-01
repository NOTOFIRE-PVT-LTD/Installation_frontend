import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchInspections, fetchInspectionById } from './inspectionsThunks';

const { slice } = createResourceSlice('inspections', {
  fetchList: fetchInspections,
  fetchOne: fetchInspectionById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
