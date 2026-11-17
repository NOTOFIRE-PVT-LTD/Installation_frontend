import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { complaintApi } from '../api/complaintApi';

function readUnassignedFromMetrics(res) {
  const kpis = res.data?.data?.kpis || res.data?.kpis;
  if (kpis?.unassignedCount != null) return kpis.unassignedCount;
  if (kpis?.newTicketsCount != null) return kpis.newTicketsCount;
  return null;
}

export function useUnassignedComplaintsCount() {
  const location = useLocation();
  const { permissions, isSuperAdmin } = useAuth();
  const hasComplaintsApp = Boolean(isSuperAdmin || permissions?.complaints);
  const [unassignedComplaints, setUnassignedComplaints] = useState(0);

  useEffect(() => {
    if (!hasComplaintsApp) {
      setUnassignedComplaints(0);
      return undefined;
    }
    let mounted = true;
    const fetchUnassigned = async () => {
      try {
        const res = await complaintApi.dashboardMetrics();
        const count = readUnassignedFromMetrics(res);
        if (mounted && count != null) setUnassignedComplaints(count);
      } catch {
        // ignore
      }
    };
    fetchUnassigned();
    const interval = setInterval(fetchUnassigned, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [hasComplaintsApp, location.pathname]);

  return unassignedComplaints;
}