import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PermissionGate from '../components/common/PermissionGate';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersListPage from '../pages/users/UsersListPage';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import StationDetailPage from '../pages/projects/StationDetailPage';
import ApprovalsQueuePage from '../pages/projects/ApprovalsQueuePage';
import ReportsListPage from '../pages/reports/ReportsListPage';
import ReportFormPage from '../pages/reports/ReportFormPage';
import ReportDetailPage from '../pages/reports/ReportDetailPage';
import PaymentsListPage from '../pages/payments/PaymentsListPage';
import NumbersPage from '../pages/numbers/NumbersPage';
import WhatsAppLogsPage from '../pages/whatsapp/WhatsAppLogsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import { useAuth } from '../hooks/useAuth';
import { getDefaultLandingPath } from './routeConfig';
import { ROLES } from '../utils/constants';

function DefaultLandingRedirect() {
  const { user, permissions } = useAuth();

  return <Navigate to={getDefaultLandingPath(user, permissions)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DefaultLandingRedirect />} />

          <Route
            path="/dashboard"
            element={
              <PermissionGate permission="dashboard" roles={[]}>
                <DashboardPage />
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

          <Route
            path="/payments"
            element={
              <PermissionGate permission="payments" roles={[]}>
                <PaymentsListPage />
              </PermissionGate>
            }
          />

          <Route
            path="/numbers"
            element={
              <PermissionGate permission="numbers" roles={[]}>
                <NumbersPage />
              </PermissionGate>
            }
          />

          <Route path="/cad-drawing" element={<Navigate to="/projects" replace />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
