import Stack from '@mui/material/Stack';
import DataTableFiltersPopover from './DataTableFiltersPopover';
import DataTableColumnsMenu from './DataTableColumnsMenu';
import DataTableToolbarLayout from './DataTableToolbarLayout';

export default function DataTableToolbar(props) {
  const {
    toolbarStart,
    toolbarEnd,
    onSearchChange,
    localSearch,
    setLocalSearch,
    filters,
    filterValues,
    onFilterChange,
    activeFilterCount,
    filtersAnchor,
    setFiltersAnchor,
    columns,
    columnVisibilityModel,
    toggleColumn,
    columnsMenuAnchor,
    setColumnsMenuAnchor,
    checkboxSelection,
    selectedCount,
    onBulkDelete,
    bulkDeleteLabel,
    selectedIds,
    onExportCsv,
  } = props;

  const actionProps = {
    filters,
    activeFilterCount,
    setFiltersAnchor,
    setColumnsMenuAnchor,
    checkboxSelection,
    selectedCount,
    onBulkDelete,
    bulkDeleteLabel,
    selectedIds,
    onExportCsv,
    toolbarEnd,
  };

  return (
    <Stack spacing={1.25} sx={{ mb: 2, minWidth: 0 }}>
      <DataTableToolbarLayout
        toolbarStart={toolbarStart}
        onSearchChange={onSearchChange}
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        actionProps={actionProps}
      />
      <DataTableFiltersPopover
        filters={filters}
        filterValues={filterValues || {}}
        onFilterChange={onFilterChange}
        activeFilterCount={activeFilterCount}
        filtersAnchor={filtersAnchor}
        setFiltersAnchor={setFiltersAnchor}
      />
      <DataTableColumnsMenu
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        toggleColumn={toggleColumn}
        columnsMenuAnchor={columnsMenuAnchor}
        setColumnsMenuAnchor={setColumnsMenuAnchor}
      />
    </Stack>
  );
}
