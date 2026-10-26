import axiosInstance from './axiosInstance';

export const payflowApi = {
  list: (resource, params) => axiosInstance.get(`/payflow/${resource}`, { params }),
  create: (resource, payload) => axiosInstance.post(`/payflow/${resource}`, payload),
  update: (resource, id, payload) => axiosInstance.put(`/payflow/${resource}/${id}`, payload),
  remove: (resource, id) => axiosInstance.delete(`/payflow/${resource}/${id}`),
};

export const payflowRequestApi = {
  list: (params) => axiosInstance.get('/payflow/payment-requests', { params }),
  stats: () => axiosInstance.get('/payflow/payment-requests/stats'),
  addFund: (payload) => axiosInstance.post('/payflow/payment-requests/funds', payload),
  exportSummary: (params) => axiosInstance.get('/payflow/payment-requests/export/summary', { params }),
  exportExcel: (params) => axiosInstance.get('/payflow/payment-requests/export/excel', { params, responseType: 'blob' }),
  get: (id) => axiosInstance.get(`/payflow/payment-requests/${id}`),
  create: (payload) => axiosInstance.post('/payflow/payment-requests', payload),
  changeStatus: (id, payload) => axiosInstance.patch(`/payflow/payment-requests/${id}/status`, payload),
};
