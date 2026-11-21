import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AnimatedActionButton from '../AnimatedActionButton';
import DataTableFiltersPopover from './DataTableFiltersPopover';
import DataTableColumnsMenu from './DataTableColumnsMenu';

const iconBtnSx = {
  width: 34,
  height: 34,
  borderRadius: '999px',
  bgcolor: 'primary.light',
  color: 'primary.main',
  border: '1px solid',
  borderColor: 'divider',
  flex: '0 0 auto',
  '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.28)', borderColor: '#D4A34E', color: '#3A230B' },
};

function SearchInput({ localSearch, setLocalSearch }) {
  return (
    <TextField
      size="small"
      placeholder="Search…"
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      sx={{
        flex: '1 1 auto',
        minWidth: 0,
        '& .MuiOutlinedInput-root': {
          borderRadius: 999,
          minHeight: 38,
          bgcolor: '#FFFDF8',
          '& .MuiOutlinedInput-notchedOutline': { border: '1px solid', borderColor: 'divider' },
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon sx={{ color: 'primary.main', fontSize: 16 }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

function FilterButton({ activeFilterCount, setFiltersAnchor }) {
  return (
    <Tooltip title="Filters">
      <IconButton onClick={(e) => setFiltersAnchor(e.currentTarget)} sx={iconBtnSx}>
        <Badge
          badgeContent={activeFilterCount}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'primary.main',
              color: '#fff',
              fontSize: '0.625rem',
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <FilterListIcon sx={{ fontSize: 18 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

function BulkDeleteButton({ count, label, ids, onBulkDelete }) {
  return (
    <Button
      size="small"
      color="error"
      variant="outlined"
      startIcon={<DeleteOutlineIcon />}
      onClick={() => onBulkDelete(ids)}
      sx={{ textTransform: 'none', fontWeight: 600 }}
    >
      {label} ({count})
    </Button>
  );
}

function ToolbarActions(props) {
  const {
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
  } = props;
  const showBulk = checkboxSelection && selectedCount > 0 && onBulkDelete;

  return (
    <>
      {showBulk ? (
        <BulkDeleteButton
          count={selectedCount}
          label={bulkDeleteLabel}
          ids={selectedIds}
          onBulkDelete={onBulkDelete}
        />
      ) : null}
      {filters.length > 0 ? (
        <FilterButton
          activeFilterCount={activeFilterCount}
          setFiltersAnchor={setFiltersAnchor}
        />
      ) : null}
      <Tooltip title="Columns">
        <IconButton onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} sx={iconBtnSx}>
          <ViewColumnIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      {onExportCsv ? <AnimatedActionButton kind="download" label="Download" onClick={onExportCsv} /> : null}
      {toolbarEnd}
    </>
  );
}

function DesktopToolbarRow({ toolbarStart, onSearchChange, localSearch, setLocalSearch, actionProps }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ minWidth: 0, width: '100%' }}
    >
      {toolbarStart ? (
        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 auto' }, minWidth: 0 }}>
          {toolbarStart}
        </Box>
      ) : null}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flex: 1, minWidth: 0, width: '100%' }}
      >
        {onSearchChange ? (
          <SearchInput localSearch={localSearch} setLocalSearch={setLocalSearch} />
        ) : !toolbarStart ? (
          <Box sx={{ flex: 1 }} />
        ) : null}
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ display: { xs: 'flex', md: 'none' }, flex: '0 0 auto' }}
        >
          <ToolbarActions {...actionProps} />
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{ display: { xs: 'none', md: 'flex' }, flex: '0 0 auto' }}
      >
        <ToolbarActions {...actionProps} />
      </Stack>
    </Stack>
  );
}

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
      <DesktopToolbarRow
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
