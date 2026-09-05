import axiosInstance from './axiosInstance';

export const stockApi = {
  listCatalog: (params) => axiosInstance.get('/stock/catalog', { params }),
  createCatalog: (payload) => axiosInstance.post('/stock/catalog', payload),
  listItems: (params) => axiosInstance.get('/stock/items', { params }),
  itemOptions: () => axiosInstance.get('/stock/items/options'),
  getItemById: (id) => axiosInstance.get(`/stock/items/${id}`),
  createItem: (formData) =>
    axiosInstance.post('/stock/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importItems: (formData) =>
    axiosInstance.post('/stock/items/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadImportTemplate: () =>
    axiosInstance.get('/stock/items/import-template', { responseType: 'blob' }),
  updateItem: (id, formData) =>
    axiosInstance.put(`/stock/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeItem: (id) => axiosInstance.delete(`/stock/items/${id}`),
  removeItems: (ids) =>
    axiosInstance.post('/stock/items/bulk-delete', {
      ids: normalizeMongoIds(ids),
    }),
  summary: () => axiosInstance.get('/stock/summary'),
  listMovements: (params) => axiosInstance.get('/stock/movements', { params }),
  createMovement: (payload) => axiosInstance.post('/stock/movements', payload),
  updateMovement: (id, payload) => axiosInstance.put(`/stock/movements/${id}`, payload),
  removeMovement: (id) => axiosInstance.delete(`/stock/movements/${id}`),
  removeMovements: (ids) =>
    axiosInstance.post('/stock/movements/bulk-delete', {
      ids: normalizeMongoIds(ids),
    }),
};

function normalizeMongoIds(ids) {
  const list = Array.isArray(ids) ? ids : [];
  return [
    ...new Set(
      list
        .map((value) => {
          if (value == null) return '';
          if (typeof value === 'object') {
            const nested = value._id ?? value.id;
            return nested == null ? '' : String(nested).trim();
          }
          return String(value).trim();
        })
        .filter((id) => /^[a-f\d]{24}$/i.test(id))
    ),
  ];
}
