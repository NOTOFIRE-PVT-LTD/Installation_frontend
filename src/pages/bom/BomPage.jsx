import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BomDrawer from './BomDrawer';
import UseBomDrawer from './UseBomDrawer';
import ProductionDetailDialog from './ProductionDetailDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchBoms,
  createBom,
  updateBom,
  deleteBom,
  fetchBomProductions,
} from '../../features/bom/bomThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatDate } from '../../utils/formatters';
import { bomApi } from '../../api/bomApi';
import { downloadBomCsv, downloadBomPdf } from './bomExport';

const BOM_COLUMNS = [
  {
    field: 'name',
    headerName: 'BOM Name',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'version',
    headerName: 'Version',
    width: 100,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'finishedItem',
    headerName: 'Finished Item',
    flex: 1.2,
    minWidth: 180,
    valueGetter: (_value, row) => {
      const item = row.finishedItem;
      if (!item) return '-';
      return (
        [item.categoryName, item.componentName, item.subComponentName || item.name].filter(Boolean).join(' / ') ||
        item.name ||
        '-'
      );
    },
    csvValue: (row) => {
      const item = row.finishedItem;
      if (!item) return '-';
      return (
        [item.categoryName, item.componentName, item.subComponentName || item.name].filter(Boolean).join(' / ') ||
        item.name ||
        '-'
      );
    },
  },
  {
    field: 'components',
    headerName: 'Components',
    width: 120,
    valueGetter: (_value, row) => row.components?.length || 0,
  },
  {
    field: 'effectiveDate',
    headerName: 'Effective Date',
    width: 140,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'isActive',
    headerName: 'Status',
    width: 110,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.value ? 'Active' : 'Inactive'}
        color={params.value ? 'success' : 'default'}
        variant="outlined"
      />
    ),
    csvValue: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];

const PRODUCTION_COLUMNS = [
  {
    field: 'bomName',
    headerName: 'BOM',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) =>
      row.bomName ? `${row.bomName}${row.bomVersion ? ` v${row.bomVersion}` : ''}` : row.bom?.name || '-',
  },
  {
    field: 'productionQty',
    headerName: 'Production Qty',
    width: 130,
    valueGetter: (value) => value ?? 0,
  },
  {
    field: 'person',
    headerName: 'Person',
    flex: 1,
    minWidth: 130,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'productionDate',
    headerName: 'Date',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'referenceNo',
    headerName: 'Reference',
    width: 130,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'lines',
    headerName: 'Lines',
    width: 90,
    valueGetter: (_value, row) => row.lines?.length || 0,
  },
];

function BomListPanel() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.bom);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', bom: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBoms(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchBoms(queryParams));

  const openViewOrEdit = async (row, mode) => {
    try {
      const { data } = await bomApi.getById(row._id);
      setDrawer({ open: true, mode, bom: data.data });
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load BOM', severity: 'error' }));
    }
  };

  // The list rows are not populated deeply enough for component labels.
  const handleDownload = async (row, format) => {
    try {
      const { data } = await bomApi.getById(row._id);
      if (format === 'pdf') downloadBomPdf(data.data);
      else downloadBomCsv(data.data);
    } catch (err) {
      dispatch(
        showSnackbar({ message: err.response?.data?.message || 'Failed to download BOM', severity: 'error' })
      );
    }
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawer.mode === 'create') {
        await dispatch(createBom(payload)).unwrap();
        dispatch(showSnackbar({ message: 'BOM created' }));
      } else {
        await dispatch(updateBom({ id: drawer.bom._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'BOM updated' }));
      }
      setDrawer({ open: false, mode: 'create', bom: null });
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save BOM', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteBom(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'BOM deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete BOM', severity: 'error' }));
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setDrawer({ open: true, mode: 'create', bom: null })}
        >
          Create BOM
        </Button>
      </Box>
      <DataTable
        columns={BOM_COLUMNS}
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
        actions={[
          {
            label: 'View',
            icon: <VisibilityIcon fontSize="small" />,
            onClick: (row) => openViewOrEdit(row, 'view'),
          },
          {
            label: 'Edit',
            icon: <EditIcon fontSize="small" />,
            onClick: (row) => openViewOrEdit(row, 'edit'),
          },
          {
            label: 'Download CSV',
            icon: <DownloadIcon fontSize="small" />,
            onClick: (row) => handleDownload(row, 'csv'),
          },
          {
            label: 'Download PDF',
            icon: <PictureAsPdfIcon fontSize="small" />,
            onClick: (row) => handleDownload(row, 'pdf'),
          },
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" color="error" />,
            onClick: setConfirmDelete,
          },
        ]}
        onExportCsv={() => exportToCsv('bom-list', items, buildCsvColumns(BOM_COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No BOMs yet. Create a BOM with qty required for 1 PCS."
        storageKey="bom-list"
      />
      <BomDrawer
        open={drawer.open}
        mode={drawer.mode}
        bom={drawer.bom}
        submitting={submitting}
        onClose={() => setDrawer({ open: false, mode: 'create', bom: null })}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete BOM"
        message={`Delete "${confirmDelete?.name}"? BOMs with production history cannot be deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

function ProductionPanel() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.bomProductions);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();
  const [useOpen, setUseOpen] = useState(false);
  const [activeBoms, setActiveBoms] = useState([]);
  const [detail, setDetail] = useState({ open: false, production: null, loading: false });

  useEffect(() => {
    dispatch(fetchBomProductions(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    bomApi
      .list({ page: 1, pageSize: 100, isActive: 'true' })
      .then((res) => setActiveBoms(res.data?.data || []))
      .catch(() => setActiveBoms([]));
  }, [useOpen]);

  const refresh = () => dispatch(fetchBomProductions(queryParams));

  const openDetail = async (row) => {
    setDetail({ open: true, production: row, loading: true });
    try {
      const { data } = await bomApi.getProductionById(row._id);
      setDetail({ open: true, production: data.data, loading: false });
    } catch (err) {
      setDetail({ open: false, production: null, loading: false });
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to load production details',
          severity: 'error',
        })
      );
    }
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a BOM and production qty. Required = Qty/1 PCS × Production Qty. Confirm creates utilize
        records for the person and updates warehouse.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setUseOpen(true)}>
          Use BOM / Create Production
        </Button>
      </Box>
      <DataTable
        columns={PRODUCTION_COLUMNS}
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
        onRowClick={openDetail}
        actions={[
          {
            label: 'View',
            icon: <VisibilityIcon fontSize="small" />,
            onClick: openDetail,
          },
        ]}
        onExportCsv={() => exportToCsv('bom-productions', items, buildCsvColumns(PRODUCTION_COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No BOM productions yet."
        storageKey="bom-productions"
      />
      <UseBomDrawer
        open={useOpen}
        bomOptions={activeBoms}
        onClose={() => setUseOpen(false)}
        onSuccess={refresh}
      />
      <ProductionDetailDialog
        open={detail.open}
        production={detail.production}
        loading={detail.loading}
        onClose={() => setDetail({ open: false, production: null, loading: false })}
      />
    </>
  );
}

export default function BomPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <PageHeader
        title="BOM"
        subtitle="Bill of Materials recipe and production. Stock is deducted only when production is confirmed."
      />

      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}
      >
        {`Item Master → Receive → Warehouse
Create BOM (Qty / 1 PCS)
Use BOM → Production Qty → Auto Calculate → Check Stock
Person → Confirm → Utilize → Warehouse Update → Return`}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_e, next) => setTab(next)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="1. BOM Master" />
          <Tab label="2. Use BOM / Production" />
        </Tabs>
      </Box>

      {tab === 0 && <BomListPanel />}
      {tab === 1 && <ProductionPanel />}
    </>
  );
}
