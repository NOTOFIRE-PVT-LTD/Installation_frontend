import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { visitExpenseApi } from '../../api/visitExpenseApi';

const COLUMNS = [
  { field: 'date', headerName: 'Date', minWidth: 130 },
  {
    field: 'visits',
    headerName: 'Visits',
    minWidth: 90,
    valueGetter: (_v, row) => row.items?.length || 0,
  },
  { field: 'totalKm', headerName: 'Km', minWidth: 90 },
  {
    field: 'totalAmount',
    headerName: 'Amount',
    minWidth: 120,
    valueGetter: (_v, row) => `₹${Number(row.totalAmount || 0).toLocaleString('en-IN')}`,
  },
  { field: 'status', headerName: 'Status', minWidth: 160 },
];

export default function MyExpensesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    visitExpenseApi
      .list({ pageSize: 50 })
      .then(({ data }) => setRows(data.data || []))
      .catch((err) => dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load expenses', severity: 'error' })))
      .finally(() => setLoading(false));
  }, [dispatch]);

  return (
    <>
      <PageHeader title="My Expenses" subtitle="Day-wise travel expenses after you submit today’s visits." />
      <DataTable
        columns={COLUMNS}
        rows={rows}
        totalCount={rows.length}
        page={0}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={loading}
        onRowClick={(row) => navigate(`/expenses/${row._id}`)}
      />
    </>
  );
}
