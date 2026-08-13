import axiosInstance from './axiosInstance';

export const stockApi = {
  listCatalog: (params) => axiosInstance.get('/stock/catalog', { params }),
  createCatalog: (payload) => axiosInstance.post('/stock/catalog', payload),
  listItems: (params) => axiosInstance.get('/stock/items', { params }),
  itemOptions: () => axiosInstance.get('/stock/items/options'),
  getItemById: (id) => axiosInstance.get(`/stock/items/${id}`),
  createItem: (formData) =>
    axiosInstance.post('/stock/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem: (id, formData) =>
    axiosInstance.put(`/stock/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeItem: (id) => axiosInstance.delete(`/stock/items/${id}`),
  summary: () => axiosInstance.get('/stock/summary'),
  listMovements: (params) => axiosInstance.get('/stock/movements', { params }),
  createMovement: (payload) => axiosInstance.post('/stock/movements', payload),
  removeMovement: (id) => axiosInstance.delete(`/stock/movements/${id}`),
};
