import { bomApi } from '../api/bomApi';

export async function downloadBomComponentsImportTemplate() {
  const { data } = await bomApi.downloadComponentsImportTemplate();
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bom-components-import-template.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
