// Strips grid-only columns (actions) so the same column list can drive CSV export.
export function buildCsvColumns(columns) {
  return columns.filter((c) => c.field !== '__actions').map((c) => ({ field: c.field, headerName: c.headerName, csvValue: c.csvValue }));
}
