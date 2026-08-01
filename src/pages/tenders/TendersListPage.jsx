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
import NitTenderDrawer from './NitTenderDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchNitTenders,
  createNitTender,
  updateNitTender,
  deleteNitTender,
} from '../../features/nitTenders/nitTendersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatCurrency, formatDate } from '../../utils/formatters';

const COLUMNS = [
  {
    field: 'tenderName',
    headerName: 'Tender Name',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'nitNumber',
    headerName: 'NIT Number',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'nitDate',
    headerName: 'NIT Date',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'itemsCount',
    headerName: 'Items',
    width: 90,
    valueGetter: (_value, row) => row.items?.length || 0,
    csvValue: (row) => row.items?.length || 0,
  },
  {
    field: 'loaNumber',
    headerName: 'LOA Number',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'loaDate',
    headerName: 'LOA Date',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'loaDivisionName',
    headerName: 'LOA Division / Name',
    flex: 1,
    minWidth: 160,
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
    field: 'loaValue',
    headerName: 'LOA Value',
    width: 140,
    valueFormatter: (value) => formatCurrency(value),
  },
  {
    field: 'loaWorkCompletion',
    headerName: 'LOA Work Completion',
    width: 160,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'loaItemsCount',
    headerName: 'LOA Items',
    width: 110,
    valueGetter: (_value, row) => row.loaItems?.length || 0,
    csvValue: (row) => row.loaItems?.length || 0,
  },
];

export default function TendersListPage() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.nitTenders);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', tender: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchNitTenders(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchNitTenders(queryParams));

  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', tender: null });

  const handleDrawerSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createNitTender(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Tender created successfully' }));
      } else {
        await dispatch(updateNitTender({ id: drawerState.tender._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Tender updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save tender', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteNitTender(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Tender deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete tender', severity: 'error' }));
    }
  };

  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'view', tender: row }),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', tender: row }),
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
        title="Tender"
        subtitle="Manage NIT and LOA tender records"
        actions={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setDrawerState({ open: true, mode: 'create', tender: null })}
          >
            Add Tender
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
        actions={actions}
        onExportCsv={() => exportToCsv('tenders', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No tenders found"
        storageKey="nit-tenders"
      />

      <NitTenderDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        tender={drawerState.tender}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Tender"
        message={`Are you sure you want to delete tender "${confirmDelete?.tenderName || confirmDelete?.nitNumber}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
