import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import { getRowKey } from './dataTableRowUtils';

const GRID_MAX_PAGE_SIZE = 100;

function SkeletonOverlay() {
  return (
    <Stack sx={{ p: 2 }} spacing={1.5}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={36} />
      ))}
    </Stack>
  );
}

function gridSlots(emptyMessage) {
  return {
    noRowsOverlay: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    ),
    loadingOverlay: SkeletonOverlay,
  };
}

function CustomTablePagination({ totalCount, page, pageSize, pageSizeOptions, onPageChange, onPageSizeChange }) {
  const options = pageSizeOptions.includes(Number(pageSize))
    ? pageSizeOptions
    : [...pageSizeOptions, Number(pageSize)].filter(Boolean).sort((a, b) => a - b);
  return (
    <TablePagination
      component="div"
      count={totalCount || 0}
      page={Math.max(page - 1, 0)}
      rowsPerPage={Number(pageSize) || pageSizeOptions[0]}
      rowsPerPageOptions={options}
      onPageChange={(_event, nextPage) => onPageChange(nextPage + 1)}
      onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
      sx={{ borderTop: '1px solid', borderColor: 'divider' }}
    />
  );
}

function MainDataGrid(props) {
  const {
    rows,
    finalColumns,
    loading,
    emptyMessage,
    pagingProps,
    sortModel,
    onSortChange,
    columnVisibilityModel,
    handleVisibilityChange,
    onRowClick,
    checkboxSelection,
    rowSelectionModel,
    onRowSelectionModelChange,
  } = props;

  return (
    <DataGrid
      autoHeight
      disableColumnMenu
      rows={rows}
      columns={finalColumns}
      getRowId={(row) => {
        const key = getRowKey(row);
        if (!key) throw new Error('DataTable row is missing _id');
        return key;
      }}
      loading={loading}
      paginationMode="server"
      sortingMode="server"
      {...pagingProps}
      sortModel={sortModel ? [sortModel] : []}
      onSortModelChange={(model) => onSortChange(model[0])}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={handleVisibilityChange}
      onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
      checkboxSelection={checkboxSelection}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={onRowSelectionModelChange}
      keepNonExistentRowsSelected
      disableRowSelectionOnClick
      sx={{ width: '100%', minWidth: 0, ...gridSx(onRowClick) }}
      slots={gridSlots(emptyMessage)}
    />
  );
}

export default function DataTableGrid(props) {
  const pagingProps = gridPagingProps(props);
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: (theme) => `${theme.shape?.borderRadius ?? 10}px`,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <MainDataGrid {...props} pagingProps={pagingProps} />
      {props.largePages ? <CustomTablePagination {...props} /> : null}
    </Box>
  );
}

function gridPagingProps({
  largePages,
  rows,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}) {
  if (largePages) {
    return {
      rowCount: rows.length,
      paginationModel: { page: 0, pageSize: GRID_MAX_PAGE_SIZE },
      onPaginationModelChange: () => {},
      pageSizeOptions: [GRID_MAX_PAGE_SIZE],
      hideFooterPagination: true,
    };
  }
  return {
    rowCount: totalCount,
    paginationModel: {
      page: Math.max(page - 1, 0),
      pageSize: Math.min(Math.max(Number(pageSize) || 10, 1), GRID_MAX_PAGE_SIZE),
    },
    onPaginationModelChange: (model) => {
      const nextSize = Math.min(Math.max(model.pageSize, 1), GRID_MAX_PAGE_SIZE);
      if (nextSize !== pageSize) onPageSizeChange(nextSize);
      else onPageChange(model.page + 1);
    },
    pageSizeOptions,
  };
}

function gridSx(onRowClick) {
  return {
    border: 'none',
    '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
    '& .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': { border: 'none' },
    ...(onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}),
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      outline: 'none',
      overflow: 'hidden',
    },
    '& .MuiDataGrid-cellContent': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    },
    '& .MuiDataGrid-columnHeader': { outline: 'none' },
  };
}
