import { stockApi } from '../api/stockApi';

export async function downloadStockItemsTemplate() {
  const { data } = await stockApi.downloadImportTemplate();
  const blob = data instanceof Blob ? data : new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stock-items-import-template.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
