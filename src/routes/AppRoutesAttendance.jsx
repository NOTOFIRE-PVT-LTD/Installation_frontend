import { Navigate, Route } from 'react-router-dom';
import PermissionGate from '../components/common/PermissionGate';
import SalespersonTrackingPage from '../pages/salespersonTracking/SalespersonTrackingPage';
import TrackingApprovalsPage from '../pages/salespersonTracking/TrackingApprovalsPage';
import LeavePage from '../pages/leave/LeavePage';
import VisitsHomePage from '../pages/visits/VisitsHomePage';
import VisitCreatePage from '../pages/visits/VisitCreatePage';
import VisitDayPage from '../pages/visits/VisitDayPage';
import VisitDetailPage from '../pages/visits/VisitDetailPage';
import MyExpensesPage from '../pages/expenses/MyExpensesPage';
import ExpenseDayPage from '../pages/expenses/ExpenseDayPage';
import { ROLES } from '../utils/constants';

const attendanceGateProps = {
  permission: 'attendance',
  roles: [ROLES.ADMIN, ROLES.USER],
  userPermission: 'attendance',
};

export const attendanceRouteNodes = (
  <>
      <Route path="/salesperson-tracking" element={<Navigate to="/attendance" replace />} />
      <Route path="/people" element={<Navigate to="/attendance?tab=people" replace />} />
      <Route path="/customers" element={<Navigate to="/attendance?tab=customers" replace />} />
      <Route path="/visit-approvals" element={<Navigate to="/attendance?tab=approvals" replace />} />
      <Route
        path="/attendance"
        element={
          <PermissionGate {...attendanceGateProps}>
            <SalespersonTrackingPage />
          </PermissionGate>
        }
      />
      <Route
        path="/visits/new"
        element={
          <PermissionGate {...attendanceGateProps}>
            <VisitCreatePage />
          </PermissionGate>
        }
      />
      <Route
        path="/visits/today"
        element={
          <PermissionGate {...attendanceGateProps}>
            <VisitDayPage />
          </PermissionGate>
        }
      />
      <Route
        path="/visits/:id"
        element={
          <PermissionGate {...attendanceGateProps}>
            <VisitDetailPage />
          </PermissionGate>
        }
      />
      <Route
        path="/visits"
        element={
          <PermissionGate {...attendanceGateProps}>
            <VisitsHomePage />
          </PermissionGate>
        }
      />
      <Route
        path="/expenses"
        element={
          <PermissionGate {...attendanceGateProps}>
            <MyExpensesPage />
          </PermissionGate>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <PermissionGate {...attendanceGateProps}>
            <ExpenseDayPage />
          </PermissionGate>
        }
      />
      <Route
        path="/leave"
        element={
          <PermissionGate {...attendanceGateProps}>
            <LeavePage />
          </PermissionGate>
        }
      />
      <Route
        path="/my-approvals"
        element={
          <PermissionGate {...attendanceGateProps}>
            <TrackingApprovalsPage
              title="Approvals"
              subtitle="Track attendance, visit, expense, and leave approval status"
            />
          </PermissionGate>
        }
      />
  </>
);