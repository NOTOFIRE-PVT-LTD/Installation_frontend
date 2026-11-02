import axiosInstance from './axiosInstance';

function toFormData(payload, files = []) {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  files.forEach((file) => formData.append('salesTravelProofs', file));
  return formData;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const salesTravelRequestApi = {
  list: (params) => axiosInstance.get('/sales-travel-requests', { params }),
  getById: (id) => axiosInstance.get(`/sales-travel-requests/${id}`),
  create: (payload, files) =>
    axiosInstance.post('/sales-travel-requests', toFormData(payload, files), multipart),
  update: (id, payload, files) =>
    axiosInstance.put(`/sales-travel-requests/${id}`, toFormData(payload, files), multipart),
  updateStatus: (id, data) => axiosInstance.patch(`/sales-travel-requests/${id}/status`, data),
  remove: (id) => axiosInstance.delete(`/sales-travel-requests/${id}`),
};

