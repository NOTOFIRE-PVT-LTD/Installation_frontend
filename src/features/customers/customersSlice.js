import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchCustomers } from './customersThunks';

const { slice } = createResourceSlice('customers', { fetchList: fetchCustomers });

export const { clearCurrent } = slice.actions;
export default slice.reducer;
