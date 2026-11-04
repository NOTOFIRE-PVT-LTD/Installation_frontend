import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { Navigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SlidingPills from '../../components/common/SlidingPills';
import DataTable from '../../components/common/DataTable/DataTable';
import { useAuth } from '../../hooks/useAuth';

function MetricCard({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: '1px solid #E2D3BE',
        bgcolor: '#FFFDF8',
        minWidth: 0,
      }}
    >
      <Typography variant="caption" sx={{ color: '#8A6A3D', fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#3A230B', mt: 0.5 }}>
        {value ?? 0}
      </Typography>
    </Paper>
  );
}

function formatCell(v) {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function pickColumns(tab, sample) {
  const preferred = {
    shipments: ['shipment_number', 'customer_name', 'stage', 'destination_city', 'dispatch_date'],
    products: ['sku', 'name', 'category', 'unit_weight', 'active'],
    cartons: ['name', 'length', 'width', 'height', 'active'],
    locations: ['name', 'city', 'state', 'pincode'],
    couriers: ['name', 'code', 'active'],
    invoices: ['invoice_number', 'courier_name', 'status', 'invoice_date'],
    discrepancies: ['shipment_number', 'status', 'notes'],
    packing: ['shipment_number', 'packed_at', 'notes'],
    people: ['full_name', 'email', 'role', 'active'],
    reconciliation: ['status', 'created_at'],
    dispatches: ['dispatch_number', 'status', 'dispatch_date'],
    dispatch: ['title', 'status', 'needed_by'],
    settings: ['key', 'value'],
    audit: ['action', 'actor_email', 'created_at'],
    imports: ['import_no', 'title', 'status', 'po_number', 'currency'],
    suppliers: ['name', 'country', 'is_active'],
    documents: ['name', 'doc_type', 'status'],
    tasks: ['title', 'status', 'due_date'],
    payments: ['amount', 'currency', 'status', 'paid_at'],
    cha: ['name', 'code', 'is_active'],
    inbox: ['subject', 'status', 'created_at'],
    review: ['request_no', 'status', 'created_at'],
  };

  const keys =
    preferred[tab] ||
    Object.keys(sample || {})
      .filter((k) => !['mongoId', '_pgId', 'id'].includes(k))
      .slice(0, 5);

  return keys.map((field) => ({
    field,
    headerName: field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    flex: 1,
    minWidth: 120,
    valueGetter: (_value, row) => formatCell(row?.[field]),
  }));
}

export default function MigratedAppWorkspace({
  app,
  title,
  subtitle,
  tabs,
  permissionKey,
  fetchDashboard,
  fetchTab,
}) {
  const { isSuperAdmin, permissions } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const current = tabs.some((t) => t.id === requested) ? requested : tabs[0].id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [cacheNote, setCacheNote] = useState('');

  const allowed = isSuperAdmin || Boolean(permissions?.[permissionKey]);
  const isHome = current === 'home' || current === 'reports';

  const setTab = (id) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
    setPage(1);
    setSearch('');
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isHome) {
        const res = await fetchDashboard();
        const data = res.data?.data || res.data;
        setDashboard(data);
        setCacheNote(data?.cachedForSeconds ? `Cached ~${data.cachedForSeconds}s` : '');
        setRows([]);
        setTotalCount(0);
      } else {
        const res = await fetchTab(current, { page, pageSize, search: search || undefined });
        const data = res.data?.data || res.data;
        setRows(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setCacheNote(data?.cachedForSeconds ? `Mongo · cache ~${data.cachedForSeconds}s` : 'Mongo');
        setDashboard(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Could not load ${title}`);
    } finally {
      setLoading(false);
    }
  }, [current, fetchDashboard, fetchTab, isHome, page, pageSize, search, title]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(() => pickColumns(current, rows[0]), [current, rows]);
  const recentRows = dashboard?.recentShipments || dashboard?.recentImports || [];
  const metrics = dashboard?.metrics || {};

  if (!allowed) return <Navigate to="/home" replace />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader title={title} subtitle={`${subtitle} · Live from Workspace MongoDB`} />

      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Chip size="small" label="No iframe / no Supabase SSO" sx={{ bgcolor: '#E8F5E9', color: '#1B5E20' }} />
        {cacheNote ? <Chip size="small" label={cacheNote} sx={{ bgcolor: '#FFF8E7', color: '#583714' }} /> : null}
      </Stack>

      <SlidingPills
        fullWidth
        value={current}
        onChange={setTab}
        items={tabs.map((item, index) => ({
          id: item.id,
          label: `${index + 1}. ${item.label}`,
        }))}
      />

      {error ? (
        <Typography sx={{ color: '#B91C1C', fontWeight: 700 }}>{error}</Typography>
      ) : null}

      {loading ? (
        <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#C99846' }} />
        </Box>
      ) : isHome ? (
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 1.5,
              mb: 2,
            }}
          >
            {Object.entries(metrics).map(([key, value]) => (
              <MetricCard key={key} label={key} value={value} />
            ))}
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#583714' }}>
            Recent {app === 'shipping' ? 'shipments' : 'imports'}
          </Typography>
          <DataTable
            rows={recentRows.map((r, i) => ({ id: r.mongoId || r.id || `r-${i}`, ...r }))}
            columns={pickColumns(app === 'shipping' ? 'shipments' : 'imports', recentRows[0])}
            emptyMessage="No rows in Mongo yet — re-run migration if empty."
            totalCount={recentRows.length}
            page={1}
            pageSize={Math.max(recentRows.length, 1)}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            loading={false}
          />
        </Box>
      ) : (
        <DataTable
          rows={rows.map((r, i) => ({ id: r.mongoId || r.id || `r-${i}`, ...r }))}
          columns={columns}
          emptyMessage="No rows for this tab."
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          loading={false}
          storageKey={`${app}-${current}`}
        />
      )}
    </Box>
  );
}
