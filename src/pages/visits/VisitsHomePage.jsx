import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RouteIcon from '@mui/icons-material/Route';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import MultiVisitPlanDrawer from './MultiVisitPlanDrawer';
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
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams({});

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planDrawer, setPlanDrawer] = useState(false);

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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Visit Plan"
          subtitle={
            isSalesperson
              ? 'Plan your customer visits for the day or week, and track past visits'
              : 'Monitor planned visits across all salespeople'
          }
          actions={
            <>
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
            </>
          }
        />
      )}

      <DataTable
        columns={isAdmin ? COLUMNS : COLUMNS.filter((c) => c.field !== 'salesperson')}
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
        toolbarEnd={
          embedded ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPlanDrawer(true)}>
              Plan Visits
            </Button>
          ) : null
        }
      />

      <MultiVisitPlanDrawer
        open={planDrawer}
        onClose={() => setPlanDrawer(false)}
        onCreated={() => load()}
      />
    </>
  );
}
