import { Route } from 'react-router-dom';
import PermissionGate from '../components/common/PermissionGate';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import StationDetailPage from '../pages/projects/StationDetailPage';
import ApprovalsQueuePage from '../pages/projects/ApprovalsQueuePage';
import ReportsListPage from '../pages/reports/ReportsListPage';
import ReportFormPage from '../pages/reports/ReportFormPage';
import ReportDetailPage from '../pages/reports/ReportDetailPage';
import WhatsAppLogsPage from '../pages/whatsapp/WhatsAppLogsPage';
import { ROLES } from '../utils/constants';

export const projectsReportsRouteNodes = (
  <>
      <Route
        path="/projects"
        element={
          <PermissionGate permission="projects" roles={[ROLES.USER]}>
            <ProjectsListPage />
          </PermissionGate>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <PermissionGate permission="projects" roles={[ROLES.USER]}>
            <ProjectDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/projects/:id/stations/:stationId"
        element={
          <PermissionGate permission="projects" roles={[ROLES.USER]}>
            <StationDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/approvals"
        element={
          <PermissionGate permission="claimApprovals" roles={[]}>
            <ApprovalsQueuePage />
          </PermissionGate>
        }
      />
      <Route
        path="/whatsapp-logs"
        element={
          <PermissionGate permission="users" roles={[]}>
            <WhatsAppLogsPage />
          </PermissionGate>
        }
      />
      <Route
        path="/reports"
        element={
          <PermissionGate permission="reports" roles={[ROLES.USER]}>
            <ReportsListPage />
          </PermissionGate>
        }
      />
      <Route
        path="/reports/new"
        element={
          <PermissionGate permission="reports" roles={[ROLES.USER]}>
            <ReportFormPage />
          </PermissionGate>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <PermissionGate permission="reports" roles={[ROLES.USER]}>
            <ReportDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/reports/:id/edit"
        element={
          <PermissionGate permission="reports" roles={[ROLES.USER]}>
            <ReportFormPage />
          </PermissionGate>
        }
      />
  </>
);