import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchAttendance, fetchTodayAttendance } from './attendanceThunks';

const { slice } = createResourceSlice(
  'attendance',
  { fetchList: fetchAttendance },
  {
    initialState: { today: null },
    extraReducers: (builder) => {
      builder.addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.today = action.payload;
      });
    },
  }
);

export const { clearCurrent } = slice.actions;
export default slice.reducer;
