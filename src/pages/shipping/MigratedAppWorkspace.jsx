import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Navigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SlidingPills from '../../components/common/SlidingPills';
import DataTable from '../../components/common/DataTable/DataTable';
import { useAuth } from '../../hooks/useAuth';
import { pickColumns } from './migratedAppColumns';
import ShipmentDetailDrawer from './ShipmentDetailDrawer';
import ShippingEmbedFrame from './ShippingEmbedFrame';
import { hasShippingAppUrl } from './shippingAppUrl';
import { withGridIds } from './migratedWorkspaceBits';
import MigratedHomePanel from './MigratedHomePanel';
import {
  isDeepEmbed,
  pathBelongsToTab,
  tabRootPath,
} from './shippingEmbedPath';

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
  const [detail, setDetail] = useState(null);
  const canEmbedShipping = app === 'shipping' && hasShippingAppUrl();
  const [embedPath, setEmbedPath] = useState(() => {
    if (!(app === 'shipping' && hasShippingAppUrl())) return null;
    const tab = tabs.find((t) => t.id === current) || tabs[0];
    return tab?.path || '/';
  });
  const [livePath, setLivePath] = useState(null);

  const allowed = isSuperAdmin || Boolean(permissions?.[permissionKey]);
  const isHome = current === 'home' || current === 'reports';
  const rootPath = tabRootPath(tabs, current);
  // Ignore stale iframe polls from the previous tab (avoids Back button flash).
  const effectivePath =
    livePath && pathBelongsToTab(livePath, rootPath)
      ? livePath
      : embedPath || '/';
  const deep = canEmbedShipping && isDeepEmbed(effectivePath, rootPath);

  const setTab = (id) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
    setPage(1);
    setSearch('');
  };

  // Sidebar Links only change ?tab= — drive the iframe from that (same as LeadTrack).
  useEffect(() => {
    if (!canEmbedShipping) {
      setEmbedPath(null);
      return;
    }
    setLivePath(null);
    setEmbedPath(tabRootPath(tabs, current));
  }, [canEmbedShipping, current, tabs]);

  const load = useCallback(async () => {
    if (canEmbedShipping) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isHome) {
        const res = await fetchDashboard();
        const data = res.data?.data || res.data;
        setDashboard(data);
        setRows([]);
        setTotalCount(0);
      } else {
        const res = await fetchTab(current, { page, pageSize, search: search || undefined });
        const data = res.data?.data || res.data;
        setRows(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setDashboard(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Could not load ${title}`);
    } finally {
      setLoading(false);
    }
  }, [canEmbedShipping, current, fetchDashboard, fetchTab, isHome, page, pageSize, search, title]);

  useEffect(() => {
    load();
  }, [load]);

  const openShipment = useCallback(
    (row) => {
      const shipmentId = row?.pgId || row?.id;
      if (canEmbedShipping && shipmentId) {
        setEmbedPath(`/shipments/${shipmentId}`);
        return;
      }
      setDetail(row);
    },
    [canEmbedShipping]
  );

  const columnOpts = useMemo(
    () => (app === 'shipping' ? { onOpenShipment: openShipment } : {}),
    [app, openShipment]
  );
  const columns = useMemo(
    () => pickColumns(current, rows[0], columnOpts),
    [columnOpts, current, rows]
  );
  if (!allowed) return <Navigate to="/dashboard" replace />;

  const goEmbedBack = () => {
    if (deep) {
      setLivePath(rootPath);
      setEmbedPath(rootPath);
      return;
    }
    const next = new URLSearchParams(params);
    next.set('tab', 'home');
    setParams(next, { replace: true });
    setLivePath('/');
    setEmbedPath('/');
  };

  // Horizontal tab strip is Super Admin only — regular users use the sidebar.
  const showTopTabs = isSuperAdmin && !deep;

  if (canEmbedShipping) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: 'calc(100dvh - 52px)',
          m: { xs: -2, sm: -2.5 },
          width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 40px)' },
        }}
      >
        {showTopTabs ? (
          <SlidingPills
            fullWidth
            value={current}
            onChange={setTab}
            items={tabs.map((item, index) => ({
              id: item.id,
              label: `${index + 1}. ${item.label}`,
            }))}
          />
        ) : null}
        <ShippingEmbedFrame
          path={embedPath || '/'}
          onBack={goEmbedBack}
          onLivePath={setLivePath}
          showBack={deep}
          backToPath={rootPath}
          backLabel={
            current === 'dispatch' ? 'Back to New dispatch' : 'Back'
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PageHeader title={title} subtitle={subtitle} />

      {isSuperAdmin ? (
        <SlidingPills
          fullWidth
          value={current}
          onChange={setTab}
          items={tabs.map((item, index) => ({
            id: item.id,
            label: `${index + 1}. ${item.label}`,
          }))}
        />
      ) : null}

      {error ? (
        <Typography sx={{ color: '#B91C1C', fontWeight: 700 }}>{error}</Typography>
      ) : null}

      {loading ? (
        <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#C99846' }} />
        </Box>
      ) : null}

      {!loading && isHome && dashboard ? (
        <MigratedHomePanel
          dashboard={dashboard}
          columnOpts={columnOpts}
          search={search}
          onSearchChange={setSearch}
        />
      ) : null}

      {!loading && !isHome ? (
        <DataTable
          columns={columns}
          rows={withGridIds(Array.isArray(rows) ? rows : [])}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          search={search}
          onSearchChange={setSearch}
        />
      ) : null}

      <ShipmentDetailDrawer open={Boolean(detail)} row={detail} onClose={() => setDetail(null)} />
    </Box>
  );
}
