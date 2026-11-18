import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PermissionGate from '../components/common/PermissionGate';
import BgApplicationPrintPage from '../pages/accounts/BgApplicationPrintPage';
import PortalAppsPage from '../pages/portal/PortalAppsPage';
import { attendanceRouteNodes } from './AppRoutesAttendance';
import { backOfficeRouteNodes } from './AppRoutesBackOffice';
import { dashboardComplaintRouteNodes } from './AppRoutesDashboardComplaints';
import { projectsReportsRouteNodes } from './AppRoutesProjectsReports';
import { payflowRouteNodes } from './AppRoutesPayflow';

export const protectedRouteNodes = (
  <Route element={<ProtectedRoute />}>
    <Route path="/apps" element={<PortalAppsPage />} />
    <Route element={<DashboardLayout />}>
      {dashboardComplaintRouteNodes}
      {attendanceRouteNodes}
      {projectsReportsRouteNodes}
      {backOfficeRouteNodes}
      {payflowRouteNodes}
    </Route>

    <Route
      path="/accounts/:id/print"
      element={
        <PermissionGate permission="accounts" roles={[]}>
          <BgApplicationPrintPage />
        </PermissionGate>
      }
    />
  </Route>
);