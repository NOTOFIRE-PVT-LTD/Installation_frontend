import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import { fetchProjectOptions } from '../../features/projects/projectsThunks';
import { fetchReports, deleteReport, verifyReport } from '../../features/reports/reportsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate, formatPercent } from '../../utils/formatters';
import { REPORT_STATUS } from '../../utils/constants';

const COLUMNS = [
  {
    field: 'project',
    headerName: 'Project',
    flex: 1,
    minWidth: 160,
    valueGetter: (value, row) => row.project?.projectName || '-',
    csvValue: (row) => row.project?.projectName,
  },
  {
    field: 'submittedBy',
    headerName: 'Submitted By',
    width: 150,
    valueGetter: (value, row) => row.submittedBy?.name || '-',
    csvValue: (row) => row.submittedBy?.name,
  },
  { field: 'date', headerName: 'Date', width: 120, valueFormatter: (value) => formatDate(value) },
  {
    field: 'progressPercentage',
    headerName: 'Progress',
    width: 110,
    valueFormatter: (value) => formatPercent(value),
  },
  { field: 'status', headerName: 'Status', width: 130 },
];

export default function ReportsListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isInstaller } = useAuth();
  const canManage = usePermission('reports');
  const { items, total, status } = useAppSelector((state) => state.reports);
  const { options: projectOptions } = useAppSelector((state) => state.projects);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['status', 'project'] });

  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProjectOptions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchReports(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchReports(queryParams));

  const handleDelete = async () => {
    try {
      await dispatch(deleteReport(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Report deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete report', severity: 'error' }));
    }
  };

  const handleVerify = async (row) => {
    try {
      await dispatch(verifyReport(row._id)).unwrap();
      dispatch(showSnackbar({ message: 'Report verified' }));
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to verify report', severity: 'error' }));
    }
  };

  const canCreate = isInstaller || canManage;

  const actions = [
    { label: 'View', icon: <VisibilityIcon fontSize="small" />, onClick: (row) => navigate(`/reports/${row._id}`) },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      show: (row) => row.status === REPORT_STATUS.PENDING,
      onClick: (row) => navigate(`/reports/${row._id}/edit`),
    },
    ...(canManage
      ? [
          {
            label: 'Verify',
            icon: <CheckCircleIcon fontSize="small" color="success" />,
            show: (row) => row.status === REPORT_STATUS.PENDING,
            onClick: handleVerify,
          },
          { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Daily Reports"
        subtitle="Site installation progress reports"
        actions={
          canCreate && (
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/reports/new')}>
              Submit Report
            </Button>
          )
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={items}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
        onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search}
        onSearchChange={setSearch}
        statusField="status"
        filters={[
          { field: 'status', label: 'Status', options: Object.values(REPORT_STATUS).map((s) => ({ value: s, label: s })) },
          { field: 'project', label: 'Project', options: projectOptions.map((p) => ({ value: p._id, label: p.projectName })) },
        ]}
        filterValues={filters}
        onFilterChange={setFilter}
        actions={actions}
        onExportCsv={() => exportToCsv('reports', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No reports found"
        storageKey="reports"
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Report"
        message="Are you sure you want to delete this report? This cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
