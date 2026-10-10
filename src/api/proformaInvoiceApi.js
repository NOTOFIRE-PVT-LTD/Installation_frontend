import axiosInstance from './axiosInstance';

export const proformaInvoiceApi = {
  list: (params) => axiosInstance.get('/proforma-invoices', { params }),
  getById: (id) => axiosInstance.get(`/proforma-invoices/${id}`),
  create: (payload) => axiosInstance.post('/proforma-invoices', payload),
  update: (id, payload) => axiosInstance.put(`/proforma-invoices/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/proforma-invoices/${id}`),
  nextNumber: (params) => axiosInstance.get('/proforma-invoices/next-number', { params }),
  companies: () => axiosInstance.get('/proforma-invoices/options/companies'),
  parties: () => axiosInstance.get('/proforma-invoices/options/parties'),
  quotations: (params) => axiosInstance.get('/proforma-invoices/options/quotations', { params }),
  getQuotation: (id) => axiosInstance.get(`/proforma-invoices/options/quotations/${id}`),
};
