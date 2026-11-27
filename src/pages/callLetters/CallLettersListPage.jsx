import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CallLetterDrawer from './CallLetterDrawer';
import { callLetterApi } from '../../api/callLetterApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchCallLetters,
  createCallLetter,
  updateCallLetter,
  deleteCallLetter,
} from '../../features/callLetters/callLettersThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatCurrency } from '../../utils/formatters';

const COLUMNS = [
  {
    field: 'tenderName',
    headerName: 'Work / Tender Name',
    flex: 1.4,
    minWidth: 200,
    valueGetter: (_value, row) => row?.nameOfWork || row?.tenderName || '-',
  },
  {
    field: 'loaNoAndDate',
    headerName: 'LOA / CA No. & Date',
    flex: 1.2,
    minWidth: 180,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'contractorName',
    headerName: 'Contractor',
    flex: 1,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'zone',
    headerName: 'Consignee / Zone',
    width: 150,
    valueGetter: (_value, row) => row?.consignee || row?.zone || '-',
  },
  {
    field: 'callLetter',
    headerName: 'Call Letter No.',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) => row?.callLetterNoAndDate || row?.callLetter || row?.forwardedLetterNo || '-',
  },
  {
    field: 'itemsCount',
    headerName: 'Items',
    width: 90,
    sortable: false,
    renderCell: (params) => (
      <Chip
        size="small"
        label={`${params.row?.items?.length || 0} items`}
        color={params.row?.items?.length ? 'primary' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'totalMaterialCost',
    headerName: 'Material Value',
    width: 140,
    valueFormatter: (value) => formatCurrency(value || 0),
  },
];

export default function CallLettersListPage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.callLetters);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', document: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCallLetters(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchCallLetters(queryParams));
  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', document: null });

  const handleDrawerSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createCallLetter(payload)).unwrap();
        dispatch(showSnackbar({ message: 'Call letter saved successfully' }));
      } else {
        await dispatch(updateCallLetter({ id: drawerState.document._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'Call letter updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save call letter', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCallLetter(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'Call letter deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete call letter', severity: 'error' }));
    }
  };

  const handleDownloadRowExcel = async (row) => {
    try {
      const res = await callLetterApi.exportExcelById(row._id);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `RDSO-Call-Letter-${row.contractorShortName || stamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'RDSO Call Letter Excel downloaded!' }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to download Excel file',
          severity: 'error',
        })
      );
    }
  };

  const actions = [
    {
      label: 'Download RDSO Excel',
      icon: <DownloadIcon fontSize="small" color="success" />,
      onClick: handleDownloadRowExcel,
    },
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'view', document: row }),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', document: row }),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      onClick: setConfirmDelete,
    },
  ];

  const addButton = (
    <Button
      startIcon={<AutoAwesomeIcon />}
      endIcon={<AddIcon />}
      variant="contained"
      onClick={() => setDrawerState({ open: true, mode: 'create', document: null })}
      sx={{ fontWeight: 700 }}
    >
      Upload PDF & Generate RDSO Excel
    </Button>
  );

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Call Letter (PDF to RDSO Excel Generator)"
          subtitle="Extract RDSO Proforma / Call Letter PDF details with Gemini AI and generate the 9-sheet RDSO Inspection & Call Letter Excel workbook"
          actions={addButton}
        />
      )}
      {embedded && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {addButton}
        </Box>
      )}

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
        onExportCsv={() => exportToCsv('call-letters', items, buildCsvColumns(COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No call letters found — click 'Upload PDF & Generate RDSO Excel' to extract a Call Letter PDF"
        storageKey="call-letters"
      />

      <CallLetterDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        document={drawerState.document}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Call Letter"
        message={`Delete call letter "${confirmDelete?.callLetter || confirmDelete?.loaNoAndDate || 'this record'}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
