import axiosInstance from './axiosInstance';

export const quotationApi = {
  list: (params) => axiosInstance.get('/quotations', { params }),
  getById: (id) => axiosInstance.get(`/quotations/${id}`),
  create: (payload) => axiosInstance.post('/quotations', payload),
  update: (id, payload) => axiosInstance.put(`/quotations/${id}`, payload),
  duplicate: (id) => axiosInstance.post(`/quotations/${id}/duplicate`),
  setStatus: (id, status) => axiosInstance.patch(`/quotations/${id}/status`, { status }),
  moveToTrash: (id) => axiosInstance.post(`/quotations/${id}/trash`),
  restore: (id) => axiosInstance.post(`/quotations/${id}/restore`),
  removePermanently: (id) => axiosInstance.delete(`/quotations/${id}`),
  productOptions: () => axiosInstance.get('/quotations/product-options'),
  listProducts: (params) => axiosInstance.get('/quotations/products', { params }),
  productCategories: () => axiosInstance.get('/quotations/products/categories'),
  createProduct: (formData) =>
    axiosInstance.post('/quotations/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, formData) =>
    axiosInstance.put(`/quotations/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeProduct: (id) => axiosInstance.delete(`/quotations/products/${id}`),
  listMasters: (kind) => axiosInstance.get(`/quotations/masters/${kind}`),
  createMaster: (kind, payload) => axiosInstance.post(`/quotations/masters/${kind}`, payload),
  updateMaster: (id, payload) => axiosInstance.put(`/quotations/masters/item/${id}`, payload),
  removeMaster: (id) => axiosInstance.delete(`/quotations/masters/item/${id}`),
};
