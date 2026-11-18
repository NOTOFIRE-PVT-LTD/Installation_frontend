import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContractorStatCards from './ContractorStatCards';
import ContractorUploadDialog from './ContractorUploadDialog';
import { getContractorColumns } from './contractorAttendanceColumns';
import { contractorAttendanceApi } from '../../api/contractorAttendanceApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';

export default function ContractorAttendancePage() {
  const dispatch = useAppDispatch();
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['contractor', 'monthYear'] });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalWorkers: 0, totalContractors: 0, totalDays: 0, totalWages: 0 });
  const [filterOptions, setFilterOptions] = useState({ contractors: [], months: [] });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await contractorAttendanceApi.list(queryParams);
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
      if (data.summary) setSummary(data.summary);
      if (data.filterOptions) setFilterOptions(data.filterOptions);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load data', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const handleDownload = async () => {
    try {
      const res = await contractorAttendanceApi.downloadTemplate();
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Contractor_Attendance_Template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      dispatch(showSnackbar({ message: 'Template download failed', severity: 'error' }));
    }
  };

  const handleUpload = async (file, monthYear) => {
    const formData = new FormData();
    formData.append('file', file);
    if (monthYear) formData.append('monthYear', monthYear);
    const res = await contractorAttendanceApi.uploadExcel(formData);
    dispatch(showSnackbar({ message: res.data?.message || 'Excel uploaded successfully' }));
    loadData();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await contractorAttendanceApi.deleteRecord(confirmDelete._id);
      dispatch(showSnackbar({ message: 'Record deleted' }));
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to delete record', severity: 'error' }));
    }
  };

  const actions = [{ label: 'Delete', icon: <DeleteIcon fontSize="small" color="error" />, onClick: setConfirmDelete }];

  const headerActions = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>Download Template</Button>
      <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setUploadOpen(true)}>Upload Excel</Button>
    </Stack>
  );

  return (
    <>
      <PageHeader title="Contractor Attendance" subtitle="HR contractor attendance & wage calculation" actions={headerActions} />
      <ContractorStatCards summary={summary} />

      <Paper elevation={0} sx={{ p: 1.5, mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', border: '1px solid #E2D3BE' }}>
        {filterOptions.contractors.length > 0 && (
          <TextField select size="small" label="Contractor" value={filters.contractor || ''} onChange={(e) => setFilter('contractor', e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="">All Contractors</MenuItem>
            {filterOptions.contractors.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        )}
        {filterOptions.months.length > 0 && (
          <TextField select size="small" label="Month" value={filters.monthYear || ''} onChange={(e) => setFilter('monthYear', e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All Periods</MenuItem>
            {filterOptions.months.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        )}
        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ ml: 'auto' }}>Refresh</Button>
      </Paper>

      <DataTable
        columns={getContractorColumns()}
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
        loading={loading}
      />

      <ContractorUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadSuccess={handleUpload} />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Record"
        message={`Delete record for ${confirmDelete?.workerName || 'this worker'}?`}
        confirmLabel="Delete"
        confirmColor="error"
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
