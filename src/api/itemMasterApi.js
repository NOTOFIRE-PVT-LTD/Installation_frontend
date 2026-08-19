import axiosInstance from './axiosInstance';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const itemMasterApi = {
  listCatalog: (params) => axiosInstance.get('/item-master/catalog', { params }),
  createCatalog: (payload) => axiosInstance.post('/item-master/catalog', payload),
  listItems: (params) => axiosInstance.get('/item-master/items', { params }),
  getItemById: (id) => axiosInstance.get(`/item-master/items/${id}`),
  createItem: (formData) => axiosInstance.post('/item-master/items', formData, multipart),
  updateItem: (id, formData) => axiosInstance.put(`/item-master/items/${id}`, formData, multipart),
  removeItem: (id) => axiosInstance.delete(`/item-master/items/${id}`),
};
