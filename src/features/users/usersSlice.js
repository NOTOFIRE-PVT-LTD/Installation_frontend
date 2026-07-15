import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchUsers, fetchUserById, createUser, updateUser, deleteUser, toggleUserStatus } from './usersThunks';

const { slice } = createResourceSlice('users', { fetchList: fetchUsers, fetchOne: fetchUserById });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchUsers, fetchUserById, createUser, updateUser, deleteUser, toggleUserStatus };
