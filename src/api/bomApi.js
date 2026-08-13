import axiosInstance from './axiosInstance';

export const bomApi = {
  list: (params) => axiosInstance.get('/bom', { params }),
  getById: (id) => axiosInstance.get(`/bom/${id}`),
  create: (payload) => axiosInstance.post('/bom', payload),
  update: (id, payload) => axiosInstance.put(`/bom/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/bom/${id}`),
  listProductions: (params) => axiosInstance.get('/bom/productions', { params }),
  getProductionById: (id) => axiosInstance.get(`/bom/productions/${id}`),
  previewProduction: (payload) => axiosInstance.post('/bom/productions/preview', payload),
  confirmProduction: (payload) => axiosInstance.post('/bom/productions/confirm', payload),
};
