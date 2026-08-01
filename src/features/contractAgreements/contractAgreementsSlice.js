import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchContractAgreements, fetchContractAgreementById } from './contractAgreementsThunks';

const { slice } = createResourceSlice('contractAgreements', {
  fetchList: fetchContractAgreements,
  fetchOne: fetchContractAgreementById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
