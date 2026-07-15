function escapeCsvValue(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv(filename, rows, columns) {
  const header = columns.map((c) => escapeCsvValue(c.headerName)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCsvValue(c.csvValue ? c.csvValue(row) : row[c.field])).join(','))
    .join('\n');
  const csvContent = `${header}\n${body}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
