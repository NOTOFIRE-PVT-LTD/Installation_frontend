import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PermissionGate from '../components/common/PermissionGate';
import BgApplicationPrintPage from '../pages/accounts/BgApplicationPrintPage';
import { attendanceRouteNodes } from './AppRoutesAttendance';
import { backOfficeRouteNodes } from './AppRoutesBackOffice';
import { dashboardComplaintRouteNodes } from './AppRoutesDashboardComplaints';
import { projectsReportsRouteNodes } from './AppRoutesProjectsReports';

export const protectedRouteNodes = (
  <Route element={<ProtectedRoute />}>
    <Route element={<DashboardLayout />}>
      {dashboardComplaintRouteNodes}
      {attendanceRouteNodes}
      {projectsReportsRouteNodes}
      {backOfficeRouteNodes}
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