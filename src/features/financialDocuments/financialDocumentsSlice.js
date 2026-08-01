import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchFinancialDocuments, fetchFinancialDocumentById } from './financialDocumentsThunks';

const { slice } = createResourceSlice('financialDocuments', {
  fetchList: fetchFinancialDocuments,
  fetchOne: fetchFinancialDocumentById,
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
