import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import RouteIcon from '@mui/icons-material/Route';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableRowsIcon from '@mui/icons-material/TableRows';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import SlidingPills from '../../components/common/SlidingPills';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import { exportToCsv } from '../../utils/csvExport';
import MultiVisitPlanDrawer from './MultiVisitPlanDrawer';
import DailyVisitsSummary from './DailyVisitsSummary';
import AdminVisitsDayBoard from './AdminVisitsDayBoard';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { ROLES } from '../../utils/constants';

const COLUMNS = [
  { field: 'visitDate', headerName: 'Date', minWidth: 120 },
  {
    field: 'plannedTime',
    headerName: 'Scheduled Time',
    minWidth: 140,
    valueGetter: (_v, row) =>
      `${formatPlanTime(row.plannedTime)}${row.endTime ? ` – ${formatPlanTime(row.endTime)}` : ''}`,
  },
  {
    field: 'customer',
    headerName: 'Customer',
    flex: 1,
    minWidth: 180,
    valueGetter: (_v, row) => row.customer?.companyName || '—',
  },
  {
    field: 'salesperson',
    headerName: 'Salesperson',
    minWidth: 160,
    valueGetter: (_v, row) => row.salesperson?.name || '—',
  },
  { field: 'purpose', headerName: 'Purpose', minWidth: 160 },
  { field: 'status', headerName: 'Status', minWidth: 140 },
  {
    field: 'duration',
    headerName: 'Duration',
    minWidth: 110,
    valueGetter: (_v, row) => (row.visitDurationMin != null ? `${row.visitDurationMin} mins` : '—'),
  },
  {
    field: 'travelKm',
    headerName: 'Travel (km)',
    minWidth: 110,
    valueGetter: (_v, row) => (row.travelKm != null ? `${row.travelKm} km` : '—'),
  },
];

export default function VisitsHomePage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isSalesperson } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'all'
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planDrawer, setPlanDrawer] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await visitApi.list(queryParams);
      setRows(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load visits', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'all') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams), viewMode]);

  const tableColumns = isAdmin ? COLUMNS : COLUMNS.filter((c) => c.field !== 'salesperson');
  const viewPills = (
    <SlidingPills
      value={viewMode}
      onChange={setViewMode}
      items={[
        {
          id: 'daily',
          label: (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
              <span>Daily Summary (Visits & Expenses)</span>
            </Stack>
          ),
        },
        {
          id: 'all',
          label: (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <TableRowsIcon sx={{ fontSize: 16 }} />
              <span>All Visits List</span>
            </Stack>
          ),
        },
      ]}
    />
  );

  return (
    <>
      {!embedded && (
        <PageHeader
          title="All Visits & Daily Summary"
          subtitle={
            isSalesperson
              ? 'View all your customer visits grouped by date with check-in/out details and expenses, or manage your schedule'
              : 'Day-wise visits by salesperson — filter any From / To range'
          }
          actions={
            <Stack direction="row" spacing={1}>
              {isSalesperson && (
                <Button
                  variant="outlined"
                  startIcon={<RouteIcon />}
                  onClick={() => navigate('/visits/today')}
                >
                  Today’s visits
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPlanDrawer(true)}
              >
                Plan Visits
              </Button>
            </Stack>
          }
        />
      )}

      {isAdmin ? (
        viewMode === 'daily' ? (
          <>
            <Box sx={{ mb: 2 }}>{viewPills}</Box>
            <AdminVisitsDayBoard
              key={boardKey}
              onPlanVisit={() => setPlanDrawer(true)}
            />
          </>
        ) : (
          <DataTable
            columns={tableColumns}
            rows={rows}
            totalCount={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
            onSortChange={(model) => model && setSort(model.field, model.sort)}
            searchValue={search}
            onSearchChange={setSearch}
            loading={loading}
            onRowClick={(row) => navigate(`/visits/${row._id}`)}
            onExportCsv={() => exportToCsv('visits', rows, buildCsvColumns(tableColumns))}
            toolbarStart={viewPills}
            toolbarEnd={
              embedded ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPlanDrawer(true)}
                  sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Plan Visits
                </Button>
              ) : null
            }
          />
        )
      ) : viewMode === 'daily' ? (
        <>
          <Box sx={{ mb: 2 }}>{viewPills}</Box>
          <DailyVisitsSummary onPlanVisit={() => setPlanDrawer(true)} />
        </>
      ) : (
        <DataTable
          columns={tableColumns}
          rows={rows}
          totalCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
          onSortChange={(model) => model && setSort(model.field, model.sort)}
          searchValue={search}
          onSearchChange={setSearch}
          loading={loading}
          onRowClick={(row) => navigate(`/visits/${row._id}`)}
          onExportCsv={() => exportToCsv('visits', rows, buildCsvColumns(tableColumns))}
          toolbarStart={viewPills}
          toolbarEnd={
            embedded ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPlanDrawer(true)}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Plan Visits
              </Button>
            ) : null
          }
        />
      )}

      <MultiVisitPlanDrawer
        open={planDrawer}
        onClose={() => setPlanDrawer(false)}
        onCreated={() => {
          if (viewMode === 'all') load();
          else setBoardKey((k) => k + 1);
        }}
      />
    </>
  );
}
