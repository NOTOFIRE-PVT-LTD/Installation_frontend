import Box from '@mui/material/Box';
import DataTable from '../../components/common/DataTable/DataTable';
import { pickColumns } from './migratedAppColumns';
import { MetricCard, withGridIds } from './migratedWorkspaceBits';

/** Dashboard home for Shipping/Import Mongo workspace (not iframe). */
export default function MigratedHomePanel({
  dashboard,
  columnOpts,
  search,
  onSearchChange,
}) {
  const recentRaw = dashboard?.recentShipments || dashboard?.recentImports || [];
  const recentRows = Array.isArray(recentRaw) ? recentRaw : [];
  const metrics =
    dashboard?.metrics && typeof dashboard.metrics === 'object' && !Array.isArray(dashboard.metrics)
      ? dashboard.metrics
      : {};
  const metricEntries = Object.entries(metrics);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {metricEntries.map(([key, value]) => (
          <MetricCard key={key} label={key} value={value} />
        ))}
      </Box>
      <DataTable
        columns={pickColumns('home', recentRows[0], columnOpts)}
        rows={withGridIds(recentRows)}
        page={1}
        pageSize={recentRows.length || 10}
        totalCount={recentRows.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        search={search}
        onSearchChange={onSearchChange}
      />
    </Box>
  );
}
