import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchBgApplications, fetchBgApplicationById } from './bgApplicationsThunks';

const { slice } = createResourceSlice('bgApplications', {
  fetchList: fetchBgApplications,
  fetchOne: fetchBgApplicationById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
