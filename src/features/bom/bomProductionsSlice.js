import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchBomProductions } from './bomThunks';

const { slice } = createResourceSlice('bomProductions', {
  fetchList: fetchBomProductions,
});

export default slice.reducer;
