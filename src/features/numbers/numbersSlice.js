import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchNumbers, createNumber, updateNumber, deleteNumber, importNumbers } from './numbersThunks';

const { slice } = createResourceSlice('numbers', { fetchList: fetchNumbers });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchNumbers, createNumber, updateNumber, deleteNumber, importNumbers };
