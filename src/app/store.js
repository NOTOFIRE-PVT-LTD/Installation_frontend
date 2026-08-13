import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import projectsReducer from '../features/projects/projectsSlice';
import reportsReducer from '../features/reports/reportsSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import numbersReducer from '../features/numbers/numbersSlice';
import divisionsReducer from '../features/divisions/divisionsSlice';
import tendersReducer from '../features/tenders/tendersSlice';
import nitTendersReducer from '../features/nitTenders/nitTendersSlice';
import inspectionsReducer from '../features/inspections/inspectionsSlice';
import financialDocumentsReducer from '../features/financialDocuments/financialDocumentsSlice';
import contractAgreementsReducer from '../features/contractAgreements/contractAgreementsSlice';
import callLettersReducer from '../features/callLetters/callLettersSlice';
import bgApplicationsReducer from '../features/bgApplications/bgApplicationsSlice';
import stockItemsReducer from '../features/stockItems/stockItemsSlice';
import stockMovementsReducer from '../features/stockMovements/stockMovementsSlice';
import uiReducer from '../features/ui/uiSlice';
import { injectStore } from '../api/axiosInstance';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    projects: projectsReducer,
    reports: reportsReducer,
    payments: paymentsReducer,
    numbers: numbersReducer,
    divisions: divisionsReducer,
    tenders: tendersReducer,
    nitTenders: nitTendersReducer,
    inspections: inspectionsReducer,
    financialDocuments: financialDocumentsReducer,
    contractAgreements: contractAgreementsReducer,
    callLetters: callLettersReducer,
    bgApplications: bgApplicationsReducer,
    stockItems: stockItemsReducer,
    stockMovements: stockMovementsReducer,
    ui: uiReducer,
  },
});

injectStore(store);

export default store;
