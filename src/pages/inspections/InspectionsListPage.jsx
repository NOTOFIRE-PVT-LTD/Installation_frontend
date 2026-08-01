import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import InspectionDrawer from './InspectionDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchInspections,
  createInspection,
  updateInspection,
  deleteInspection,
} from '../../features/inspections/inspectionsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { INSPECTION_STATUS } from '../../utils/constants';

const COLUMNS = [
  {
    field: 'loaNumber',
    headerName: 'LOA No.',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'contractorName',
    headerName: 'Contractor',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'inspectionDate',
    headerName: 'Inspection Date',
    width: 140,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'inspectorName',
    headerName: 'Inspector',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'inspectionChargeBornBy',
    headerName: 'Charge Born By',
    width: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => <StatusBadge status={params.value} />,
  },
  {
    field: 'docsCount',
    headerName: 'Docs',
    width: 80,
    valueGetter: (_value, row) =>
      [row.dmFile, row.icCopy, row.firmCallLetter].filter(Boolean).length + (row.otherDetailsFiles?.length || 0),
    csvValue: (row) =>
      [row.dmFile, row.icCopy, row.firmCallLetter].filter(Boolean).length + (row.otherDetailsFiles?.length || 0),
  },
];

export default function InspectionsListPage() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.inspections);
  const {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilter,
    queryParams,
  } = useTableQueryParams({ filterKeys: ['status'] });

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', inspection: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchInspections(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchInspections(queryParams));

  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', inspection: null });

  const handleDrawerSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createInspection(formData)).unwrap();
        dispatch(showSnackbar({ message: 'Inspection created successfully' }));
      } else {
        await dispatch(updateInspection({ id: drawerState.inspection._id, formData })).unwrap();
        dispatch(showSnackbar({ message: 'Inspection updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save inspection', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteInspection(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Inspection deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete inspection', severity: 'error' }));
    }
  };

  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'view', inspection: row }),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', inspection: row }),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      onClick: setConfirmDelete,
    },
  ];

  return (
    <>
      <PageHeader
        title="Inspection"
        subtitle="Site inspections, checklists, and supporting documents"
        actions={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setDrawerState({ open: true, mode: 'create', inspection: null })}
          >
            Add Inspection
          </Button>
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
          {
            field: 'status',
            label: 'Status',
            options: Object.values(INSPECTION_STATUS).map((s) => ({ value: s, label: s })),
          },
        ]}
        filterValues={filters}
        onFilterChange={setFilter}
        actions={actions}
        onExportCsv={() => exportToCsv('inspections', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No inspections found"
        storageKey="inspections"
      />

      <InspectionDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        inspection={drawerState.inspection}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Inspection"
        message={`Delete inspection for LOA "${confirmDelete?.loaNumber || 'this record'}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
