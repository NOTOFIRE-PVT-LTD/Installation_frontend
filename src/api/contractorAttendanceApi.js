import axiosInstance from './axiosInstance';

export const contractorAttendanceApi = {
  list: (params) => axiosInstance.get('/contractor-attendance', { params }),
  uploadExcel: (formData) =>
    axiosInstance.post('/contractor-attendance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadTemplate: () =>
    axiosInstance.get('/contractor-attendance/template', {
      responseType: 'blob',
    }),
  deleteRecord: (id) => axiosInstance.delete(`/contractor-attendance/${id}`),
  deleteBatch: (batchId) => axiosInstance.delete(`/contractor-attendance/batch/${batchId}`),
};

