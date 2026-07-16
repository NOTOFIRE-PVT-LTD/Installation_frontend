import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ManageDivisionsDialog from './ManageDivisionsDialog';
import TenderDetailDrawer from './TenderDetailDrawer';
import TenderFormDrawer from './TenderFormDrawer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { fetchDivisions } from '../../features/divisions/divisionsThunks';
import { fetchTenders, deleteTender } from '../../features/tenders/tendersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatDate } from '../../utils/formatters';

const COLUMNS = [
  {
    field: 'zone',
    headerName: 'Zone',
    width: 130,
    sortable: false,
    valueGetter: (value, row) => row.division?.zone || '-',
    csvValue: (row) => row.division?.zone,
  },
  {
    field: 'divisionName',
    headerName: 'Division Name',
    width: 180,
    sortable: false,
    valueGetter: (value, row) => row.division?.name || '-',
    csvValue: (row) => row.division?.name,
  },
  { field: 'tenderName', headerName: 'Tender Name', flex: 1, minWidth: 200 },
  {
    field: 'projectName',
    headerName: 'Project Name',
    width: 180,
    sortable: false,
    valueGetter: (value, row) => row.project?.projectName || '-',
    csvValue: (row) => row.project?.projectName,
  },
  { field: 'date', headerName: 'Date', width: 140, valueFormatter: (value) => formatDate(value) },
  {
    field: 'files',
    headerName: 'Files',
    width: 100,
    sortable: false,
    valueFormatter: (value) => `${value?.length || 0}`,
  },
];

export default function CadDrawingPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const { items, total, status } = useAppSelector((state) => state.tenders);
  const { items: divisions } = useAppSelector((state) => state.divisions);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilters, queryParams } =
    useTableQueryParams({ filterKeys: ['zone', 'division'] });

  const [manageDivisionsOpen, setManageDivisionsOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tenderDrawerOpen, setTenderDrawerOpen] = useState(false);
  const [editingTenderId, setEditingTenderId] = useState(null);

  useEffect(() => {
    dispatch(fetchDivisions({ pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTenders(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchTenders(queryParams));

  const zoneOptions = useMemo(() => {
    const zones = [...new Set(divisions.map((d) => d.zone).filter(Boolean))];
    return zones.map((z) => ({ value: z, label: z }));
  }, [divisions]);

  const divisionOptions = useMemo(
    () =>
      divisions
        .filter((d) => !filters.zone || d.zone === filters.zone)
        .map((d) => ({ value: d._id, label: d.name })),
    [divisions, filters.zone]
  );

  const handleFilterChange = (key, value) => {
    if (key === 'zone') {
      // Division belongs to whichever zone was previously selected; changing zone invalidates it.
      setFilters({ zone: value, division: '' });
    } else {
      setFilters({ [key]: value });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteTender(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Tender deleted' }));
      setConfirmDelete(null);
      setSelectedTender(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete tender', severity: 'error' }));
    }
  };

  const openAddTender = () => {
    setEditingTenderId(null);
    setTenderDrawerOpen(true);
  };

  const openEditTender = (row) => {
    setEditingTenderId(row._id);
    setTenderDrawerOpen(true);
  };

  const handleTenderSaved = () => {
    setTenderDrawerOpen(false);
    setEditingTenderId(null);
    refresh();
  };

  const actions = isAdmin
    ? [
        { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: openEditTender },
        { label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Cad Drawing"
        subtitle="View linked tenders and drawing files across every division and zone"
        actions={
          isAdmin ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button startIcon={<SettingsIcon />} variant="outlined" onClick={() => setManageDivisionsOpen(true)}>
                Manage Divisions
              </Button>
              <Button startIcon={<AddIcon />} variant="contained" onClick={openAddTender}>
                Add Tender
              </Button>
            </Stack>
          ) : null
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
        filters={[
          { field: 'zone', label: 'Zone', options: zoneOptions },
          { field: 'division', label: 'Division', options: divisionOptions },
        ]}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        actions={actions}
        onRowClick={setSelectedTender}
        loading={status === 'loading'}
        emptyMessage="No tenders found"
        storageKey="cad-drawing"
      />

      <TenderDetailDrawer
        open={Boolean(selectedTender)}
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
        canEdit={isAdmin}
        onEdit={(tender) => {
          setSelectedTender(null);
          openEditTender(tender);
        }}
      />

      <TenderFormDrawer
        open={tenderDrawerOpen}
        tenderId={editingTenderId}
        onClose={() => {
          setTenderDrawerOpen(false);
          setEditingTenderId(null);
        }}
        onSaved={handleTenderSaved}
      />

      {isAdmin && (
        <ManageDivisionsDialog
          open={manageDivisionsOpen}
          onClose={() => setManageDivisionsOpen(false)}
          onChanged={() => dispatch(fetchDivisions({ pageSize: 100 }))}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Tender"
        message={`Are you sure you want to delete "${confirmDelete?.tenderName}"? All attached files will be permanently deleted too.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
