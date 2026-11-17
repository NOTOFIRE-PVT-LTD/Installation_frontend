import { Navigate, Route } from 'react-router-dom';
import PermissionGate from '../components/common/PermissionGate';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersListPage from '../pages/users/UsersListPage';
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import ComplaintDashboardPage from '../pages/complaints/ComplaintDashboardPage';
import ComplaintIntakePage from '../pages/complaints/ComplaintIntakePage';
import ComplaintDetailPage from '../pages/complaints/ComplaintDetailPage';
import PublicTrackPage from '../pages/complaints/PublicTrackPage';
import { ROLES } from '../utils/constants';
import { DefaultLandingRedirect } from './AppRoutesLanding';

export const dashboardComplaintRouteNodes = (
  <>
      <Route path="/" element={<DefaultLandingRedirect />} />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <PermissionGate permission="dashboard" roles={[]}>
            <DashboardPage />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints/dashboard"
        element={
          <PermissionGate permission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <ComplaintDashboardPage />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints/new"
        element={
          <PermissionGate permission="complaints" userPermission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <ComplaintIntakePage />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints/track"
        element={
          <PermissionGate permission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <PublicTrackPage embedded />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints/desk"
        element={
          <PermissionGate permission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <ComplaintsPage />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <PermissionGate permission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <ComplaintDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/complaints"
        element={
          <PermissionGate permission="complaints" roles={[ROLES.ADMIN, ROLES.USER]}>
            <ComplaintsPage />
          </PermissionGate>
        }
      />
      <Route
        path="/users"
        element={
          <PermissionGate permission="users" roles={[]}>
            <UsersListPage />
          </PermissionGate>
        }
      />
  </>
);