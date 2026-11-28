import { useMemo } from 'react';
import Box from '@mui/material/Box';
import StatusBadge from '../StatusBadge';
import DataTableToolbar from './DataTableToolbar';
import DataTableGrid from './DataTableGrid';
import DataTableRowActions from './DataTableRowActions';
import { useDataTableState } from './useDataTableState';

const GRID_MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export { extractSelectedRowIds } from './dataTableRowUtils';

function buildFinalColumns(columns, statusField, actions) {
  let cols = columns.map((col) => {
    const sized = col.flex == null && col.width == null ? { ...col, flex: 1 } : col;
    if (sized.field === statusField && !sized.renderCell) {
      return { ...sized, renderCell: (params) => <StatusBadge status={params.value} /> };
    }
    return sized;
  });
  if (actions.length > 0) {
    cols = [
      ...cols,
      {
        field: '__actions',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 52,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => <DataTableRowActions row={params.row} actions={actions} />,
      },
    ];
  }
  return cols;
}

export default function DataTable(props) {
  const {
    columns,
    rows,
    totalCount,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    sortModel,
    onSortChange,
    searchValue,
    onSearchChange,
    filters = [],
    filterValues = {},
    onFilterChange,
    statusField,
    actions = [],
    onExportCsv,
    loading,
    emptyMessage = 'No records found',
    storageKey,
    onRowClick,
    checkboxSelection = false,
    isRowSelectable,
    rowSelectionModel,
    onRowSelectionModelChange,
    onBulkDelete,
    bulkDeleteLabel = 'Delete selected',
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    toolbarStart,
    toolbarEnd,
  } = props;

  const state = useDataTableState({
    storageKey,
    searchValue,
    onSearchChange,
    filterValues,
    rowSelectionModel,
    rows,
  });

  const finalColumns = useMemo(
    () => buildFinalColumns(columns, statusField, actions),
    [columns, statusField, actions],
  );

  const largePages = pageSizeOptions.some((size) => size > GRID_MAX_PAGE_SIZE);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <DataTableToolbar
        toolbarStart={toolbarStart}
        toolbarEnd={toolbarEnd}
        onSearchChange={onSearchChange}
        localSearch={state.localSearch}
        setLocalSearch={state.setLocalSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        activeFilterCount={state.activeFilterCount}
        filtersAnchor={state.filtersAnchor}
        setFiltersAnchor={state.setFiltersAnchor}
        columns={columns}
        columnVisibilityModel={state.columnVisibilityModel}
        toggleColumn={state.toggleColumn}
        columnsMenuAnchor={state.columnsMenuAnchor}
        setColumnsMenuAnchor={state.setColumnsMenuAnchor}
        checkboxSelection={checkboxSelection}
        selectedCount={state.selectedIds.length}
        onBulkDelete={onBulkDelete}
        bulkDeleteLabel={bulkDeleteLabel}
        selectedIds={state.selectedIds}
        onExportCsv={onExportCsv}
      />
      <DataTableGrid
        rows={rows}
        finalColumns={finalColumns}
        loading={loading}
        emptyMessage={emptyMessage}
        largePages={largePages}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        sortModel={sortModel}
        onSortChange={onSortChange}
        columnVisibilityModel={state.columnVisibilityModel}
        handleVisibilityChange={state.handleVisibilityChange}
        onRowClick={onRowClick}
        checkboxSelection={checkboxSelection}
        isRowSelectable={isRowSelectable}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
      />
    </Box>
  );
}
