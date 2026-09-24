import axiosInstance from './axiosInstance';

export const bomApi = {
  list: (params) => axiosInstance.get('/bom', { params }),
  getById: (id) => axiosInstance.get(`/bom/${id}`),
  create: (payload) => axiosInstance.post('/bom', payload),
  update: (id, payload) => axiosInstance.put(`/bom/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/bom/${id}`),
  downloadComponentsImportTemplate: () =>
    axiosInstance.get('/bom/components/import-template', { responseType: 'blob' }),
  importComponents: (formData) =>
    axiosInstance.post('/bom/components/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listProductions: (params) => axiosInstance.get('/bom/productions', { params }),
  getProductionById: (id) => axiosInstance.get(`/bom/productions/${id}`),
  removeProduction: (id) => axiosInstance.delete(`/bom/productions/${id}`),
  previewProduction: (payload) => axiosInstance.post('/bom/productions/preview', payload),
  confirmProduction: (payload) => axiosInstance.post('/bom/productions/confirm', payload),
  issuePendingProduction: (id) => axiosInstance.post(`/bom/productions/${id}/issue-pending`),
};
