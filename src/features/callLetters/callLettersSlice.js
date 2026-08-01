import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchCallLetters, fetchCallLetterById } from './callLettersThunks';

const { slice } = createResourceSlice('callLetters', {
  fetchList: fetchCallLetters,
  fetchOne: fetchCallLetterById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
