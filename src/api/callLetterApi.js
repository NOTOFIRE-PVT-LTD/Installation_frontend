import axiosInstance from './axiosInstance';

export const callLetterApi = {
  list: (params) => axiosInstance.get('/call-letters', { params }),
  getById: (id) => axiosInstance.get(`/call-letters/${id}`),
  create: (payload) => axiosInstance.post('/call-letters', payload),
  update: (id, payload) => axiosInstance.put(`/call-letters/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/call-letters/${id}`),
  parsePdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/call-letters/parse-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportExcelById: (id) =>
    axiosInstance.get(`/call-letters/${id}/export-excel`, { responseType: 'blob' }),
  exportExcelDirect: (payload) =>
    axiosInstance.post('/call-letters/export-excel', payload, { responseType: 'blob' }),
};
