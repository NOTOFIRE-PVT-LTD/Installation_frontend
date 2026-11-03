import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PayflowDashboardTab from './PayflowDashboardTab';
import PayflowExportTab from './PayflowExportTab';
import PayflowCmsTab from './PayflowCmsTab';
import PayflowRequestsTab from './PayflowRequestsTab';
import { payflowRequestApi } from '../../api/payflowApi';

const TOP_TABS = ['Dashboard', 'Requests', 'Export', 'CMS', 'Trash'];

export default function PayflowPage() {
  const [topTab, setTopTab] = useState(0);
  const [requestStatus, setRequestStatus] = useState('All');
  const [stats, setStats] = useState({});

  const loadStats = useCallback(async () => {
    try {
      const { data } = await payflowRequestApi.stats();
      setStats(data.data);
    } catch {
      // dashboard falls back to zeros
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Dashboard cards jump to the Requests tab pre-filtered by status.
  const openRequests = (status = 'All') => {
    setRequestStatus(status);
    setTopTab(1);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={topTab} onChange={(_, value) => { if (value === 1) { setRequestStatus('All'); } setTopTab(value); }}>
          {TOP_TABS.map((label) => (
            <Tab
              key={label}
              label={label === 'Trash' && stats.trashCount > 0 ? `Trash (${stats.trashCount})` : label}
            />
          ))}
        </Tabs>
      </Box>

      {topTab === 0 && (
        <PayflowDashboardTab stats={stats} onOpenRequests={openRequests} onFundAdded={loadStats} />
      )}
      {topTab === 1 && (
        <PayflowRequestsTab
          key={requestStatus}
          initialStatus={requestStatus}
          allowCreate={false}
          isAdmin
          onChanged={loadStats}
        />
      )}
      {topTab === 2 && <PayflowExportTab />}
      {topTab === 3 && <PayflowCmsTab />}
      {topTab === 4 && (
        <PayflowRequestsTab
          key="trash-tab"
          allowCreate={false}
          isAdmin
          trashOnly
          onChanged={loadStats}
        />
      )}
    </>
  );
}
