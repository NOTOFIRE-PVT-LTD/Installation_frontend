import { stockApi } from '../api/stockApi';

export async function downloadReceiveImportTemplate() {
  const { data } = await stockApi.downloadReceiveImportTemplate();
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'receive-from-supplier-import-template.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
