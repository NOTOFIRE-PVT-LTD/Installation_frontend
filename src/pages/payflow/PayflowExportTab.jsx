import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import { formatInr } from './payflowRequestConfig';
import { payflowApi, payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';

const PAGE_SIZE = 100;

// value = backend status, label = chip text.
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Processed', label: 'Processed' },
  { value: 'Query', label: 'Query raised' },
  { value: 'Postponed', label: 'Postponed' },
];

const toInputDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtLong = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

// Blob error responses need decoding to surface the API message.
async function blobErrorMessage(err, fallback) {
  const blob = err.response?.data;
  if (blob instanceof Blob) {
    try {
      return JSON.parse(await blob.text()).message || fallback;
    } catch {
      return fallback;
    }
  }
  return err.response?.data?.message || fallback;
}

function Section({ label, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <Chip
      label={label}
      clickable
      onClick={onClick}
      sx={{
        fontWeight: 500,
        bgcolor: active ? '#dbe4ff' : 'grey.100',
        color: active ? '#1d3bff' : 'text.primary',
        '&:hover': { bgcolor: active ? '#cbd8ff' : 'grey.200' },
      }}
    />
  );
}

export default function PayflowExportTab() {
  const dispatch = useAppDispatch();
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [statuses, setStatuses] = useState([]); // empty = all statuses
  const [companies, setCompanies] = useState([]); // empty = all companies
  const [companyOptions, setCompanyOptions] = useState([]);

  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState(false);

  const buildParams = useCallback(
    () => ({
      startDate,
      endDate,
      ...(statuses.length ? { statuses: statuses.join(',') } : {}),
      ...(companies.length ? { companies: companies.join(',') } : {}),
    }),
    [startDate, endDate, statuses, companies]
  );

  const applyFilter = useCallback(async () => {
    if (startDate && endDate && startDate > endDate) {
      dispatch(showSnackbar({ message: 'Start date must be before end date', severity: 'error' }));
      return;
    }
    setLoadingPreview(true);
    try {
      const params = buildParams();
      const { data } = await payflowRequestApi.exportSummary(params);
      setPreview(data.data);
      setApplied({ startDate, endDate });
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load preview', severity: 'error' }));
    } finally {
      setLoadingPreview(false);
    }
  }, [buildParams, startDate, endDate, dispatch]);

  useEffect(() => {
    applyFilter();
    (async () => {
      try {
        const { data } = await payflowApi.list('companies', { pageSize: PAGE_SIZE });
        setCompanyOptions(data.data.map((c) => ({ value: c.name, label: `${c.code} - ${c.name}` })));
      } catch {
        // company chips are optional; export still works for all companies
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (list, setList, value) => setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await payflowRequestApi.exportExcel(buildParams());
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-${startDate}_to_${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'Export downloaded' }));
    } catch (err) {
      dispatch(showSnackbar({ message: await blobErrorMessage(err, 'Export failed'), severity: 'error' }));
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = statuses.length || STATUS_OPTIONS.length;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Export Payments
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Export payments data to Excel for processing
      </Typography>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, alignItems: 'start' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 3 }}>
            Export Settings
          </Typography>

          <Section label="Date Range">
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: endDate || undefined } }}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate || undefined } }}
              />
            </Box>
          </Section>

          <Section label="Status Filter">
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              <FilterChip label="All Statuses" active={statuses.length === 0} onClick={() => setStatuses([])} />
              {STATUS_OPTIONS.map((s) => (
                <FilterChip key={s.value} label={s.label} active={statuses.includes(s.value)} onClick={() => toggle(statuses, setStatuses, s.value)} />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Selected: {selectedCount} status{selectedCount === 1 ? '' : 'es'}
            </Typography>
          </Section>

          <Section label="Company Filter">
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              <FilterChip label="All Companies" active={companies.length === 0} onClick={() => setCompanies([])} />
              {companyOptions.map((c) => (
                <FilterChip key={c.value} label={c.label} active={companies.includes(c.value)} onClick={() => toggle(companies, setCompanies, c.value)} />
              ))}
            </Stack>
          </Section>

          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" disableElevation startIcon={<FilterListIcon />} onClick={applyFilter} disabled={loadingPreview} sx={{ bgcolor: '#2437ff' }}>
              Filter
            </Button>
            <Button variant="contained" disableElevation startIcon={<DownloadIcon />} onClick={handleExportExcel} disabled={exporting} sx={{ bgcolor: '#2437ff' }}>
              {exporting ? 'Exporting…' : 'Export to Excel'}
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Export Preview
            </Typography>
            <FilterListIcon fontSize="small" color="disabled" />
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
            <DescriptionIcon sx={{ fontSize: 44, color: '#2437ff' }} />
          </Box>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 700 }}>{loadingPreview ? '…' : `${preview?.totalPayments ?? 0} Payments`}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {applied ? `From ${fmtLong(applied.startDate)} to ${fmtLong(applied.endDate)}` : ''}
          </Typography>

          <Stack spacing={1}>
            {[
              ['Pending', 'Pending'],
              ['Approved', 'Approved'],
              ['Rejected', 'Rejected'],
              ['Processed', 'Processed'],
              ['Query', 'Query raised'],
              ['Postponed', 'Postponed'],
            ].map(([key, label]) => (
              <Stack key={key} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{label}:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{preview?.counts?.[key] ?? 0}</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatInr(preview?.totalAmount)}</Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
