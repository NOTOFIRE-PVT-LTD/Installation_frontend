import { createResourceSlice } from '../../app/createResourceSlice';
import { fetchReports, fetchReportById, createReport, updateReport, deleteReport, verifyReport } from './reportsThunks';

const { slice } = createResourceSlice('reports', { fetchList: fetchReports, fetchOne: fetchReportById });

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export { fetchReports, fetchReportById, createReport, updateReport, deleteReport, verifyReport };
