import { createResourceSlice } from '../../app/createResourceSlice';
import {
  fetchProjects,
  fetchProjectById,
  fetchProjectOptions,
  createProject,
  updateProject,
  deleteProject,
  addStation,
  updateStation,
  removeStation,
  submitStationClaim,
  approveStationClaim,
  rejectStationClaim,
  markStationPaid,
  addDailyReport,
  removeDailyReport,
  addStationDailyReport,
  removeStationDailyReport,
} from './projectsThunks';

const SYNC_CURRENT_THUNKS = [
  updateProject,
  addStation,
  updateStation,
  removeStation,
  submitStationClaim,
  approveStationClaim,
  rejectStationClaim,
  markStationPaid,
  addDailyReport,
  removeDailyReport,
  addStationDailyReport,
  removeStationDailyReport,
];

const { slice } = createResourceSlice(
  'projects',
  { fetchList: fetchProjects, fetchOne: fetchProjectById },
  {
    initialState: { options: [] },
    extraReducers: (builder) => {
      builder.addCase(fetchProjectOptions.fulfilled, (state, action) => {
        state.options = action.payload;
      });
      SYNC_CURRENT_THUNKS.forEach((thunk) => {
        builder.addCase(thunk.fulfilled, (state, action) => {
          state.current = action.payload;
        });
      });
    },
  }
);

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export {
  fetchProjects,
  fetchProjectById,
  fetchProjectOptions,
  createProject,
  updateProject,
  deleteProject,
  addStation,
  updateStation,
  removeStation,
  submitStationClaim,
  approveStationClaim,
  rejectStationClaim,
  markStationPaid,
};
