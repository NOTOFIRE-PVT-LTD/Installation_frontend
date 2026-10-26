import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import VisitFormDrawer from './VisitFormDrawer';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitApi } from '../../api/visitApi';
import { customerApi } from '../../api/customerApi';
import { peopleApi } from '../../api/peopleApi';
import { formatPlanTime } from '../../utils/readLocation';
import { ROLES } from '../../utils/constants';

const COLUMNS = [
  {
    field: 'plannedTime',
    headerName: 'Time',
    minWidth: 110,
    valueGetter: (_v, row) => formatPlanTime(row.plannedTime),
  },
  {
    field: 'customer',
    headerName: 'Customer',
    flex: 1,
    minWidth: 160,
    valueGetter: (_v, row) => row.customer?.companyName || '—',
  },
  {
    field: 'salesperson',
    headerName: 'Salesperson',
    minWidth: 160,
    valueGetter: (_v, row) => row.salesperson?.name || '—',
  },
  { field: 'purpose', headerName: 'Purpose', minWidth: 160 },
  { field: 'visitType', headerName: 'Type', minWidth: 110 },
  { field: 'status', headerName: 'Status', minWidth: 150 },
  { field: 'visitDate', headerName: 'Date', minWidth: 120 },
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
  const [drawer, setDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [salespeople, setSalespeople] = useState([]);
  const [customers, setCustomers] = useState([]);

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

  useEffect(() => {
    if (!drawer) return;
    peopleApi
      .list({ pageSize: 100 })
      .then(({ data }) => setSalespeople((data.data || []).map((u) => ({ value: u._id, label: u.name }))))
      .catch(() => setSalespeople([]));
    customerApi
      .list({ pageSize: 100, active: 'true' })
      .then(({ data }) => setCustomers((data.data || []).map((c) => ({ value: c._id, label: c.companyName }))))
      .catch(() => setCustomers([]));
  }, [drawer]);

  const createVisit = async (values) => {
    setSubmitting(true);
    try {
      await visitApi.create(values);
      dispatch(showSnackbar({ message: 'Visit created' }));
      setDrawer(false);
      await load();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not create visit', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Visit Plan"
          subtitle={isSalesperson ? 'Every visit you create shows here' : 'Assign visits to salespeople'}
          actions={
            <>
              {isSalesperson && (
                <Button variant="outlined" onClick={() => navigate('/visits/today')}>
                  Today’s visits
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => (isSalesperson ? navigate('/visits/new') : setDrawer(true))}
              >
                Create Visit
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawer(true)}>
              Create Visit
            </Button>
          ) : null
        }
      />
      <VisitFormDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onSubmit={createVisit}
        submitting={submitting}
        showSalesperson
        salespersonOptions={salespeople}
        customerOptions={customers}
      />
    </>
  );
}
