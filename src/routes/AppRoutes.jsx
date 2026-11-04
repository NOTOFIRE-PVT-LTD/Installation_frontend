import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PermissionGate from '../components/common/PermissionGate';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import CentralLoginRedirect from '../pages/auth/CentralLoginRedirect';
import CentralSsoPage from '../pages/auth/CentralSsoPage';
import WorkspaceHomePage from '../pages/home/WorkspaceHomePage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersListPage from '../pages/users/UsersListPage';
import SalespersonTrackingPage from '../pages/salespersonTracking/SalespersonTrackingPage';
import TrackingApprovalsPage from '../pages/salespersonTracking/TrackingApprovalsPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import LeavePage from '../pages/leave/LeavePage';
import VisitsHomePage from '../pages/visits/VisitsHomePage';
import VisitCreatePage from '../pages/visits/VisitCreatePage';
import VisitDayPage from '../pages/visits/VisitDayPage';
import VisitDetailPage from '../pages/visits/VisitDetailPage';
import MyExpensesPage from '../pages/expenses/MyExpensesPage';
import ExpenseDayPage from '../pages/expenses/ExpenseDayPage';
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
import TendersListPage from '../pages/tenders/TendersListPage';
import InspectionsListPage from '../pages/inspections/InspectionsListPage';
import FinancialDocumentsListPage from '../pages/financialDocuments/FinancialDocumentsListPage';
import AccountsListPage from '../pages/accounts/AccountsListPage';
import BgApplicationPrintPage from '../pages/accounts/BgApplicationPrintPage';
import StockItemsPage from '../pages/stock/StockItemsPage';
import BomPage from '../pages/bom/BomPage';
import ItemsMasterPage from '../pages/itemMaster/ItemsMasterPage';
import BillingPage from '../pages/billing/BillingPage';
import QuotationsPage from '../pages/quotations/QuotationsPage';
import QuotationFormPage from '../pages/quotations/QuotationFormPage';
import ProformaInvoicesPage from '../pages/proformaInvoices/ProformaInvoicesPage';
import DeliveryChallansPage from '../pages/deliveryChallans/DeliveryChallansPage';
import AtlantaPaymentsPage from '../pages/atlantaPayments/AtlantaPaymentsPage';
import AuditLogsPage from '../pages/auditLogs/AuditLogsPage';
import ShippingControlPage, { ImportControlPage } from '../pages/shipping/ShippingControlPage';
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import ComplaintRegisterPage from '../pages/complaints/ComplaintRegisterPage';
import PublicTrackPage from '../pages/complaints/PublicTrackPage';
import ComplaintDashboardPage from '../pages/complaints/ComplaintDashboardPage';
import ComplaintIntakePage from '../pages/complaints/ComplaintIntakePage';
import ComplaintDetailPage from '../pages/complaints/ComplaintDetailPage';
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
        {/* Staff auth is Centralisation only — no Workspace login UI */}
        <Route path="/login" element={<CentralLoginRedirect />} />
        <Route path="/central-sso" element={<CentralSsoPage />} />
        <Route path="/forgot-password" element={<CentralLoginRedirect />} />
        <Route path="/reset-password/:token" element={<CentralLoginRedirect />} />
      </Route>

      {/* Public Customer Self-Service & Support URLs */}
      <Route path="/submit" element={<ComplaintRegisterPage />} />
      <Route path="/track" element={<PublicTrackPage />} />
      <Route path="/support" element={<ComplaintRegisterPage />} />
      <Route path="/support/track" element={<PublicTrackPage />} />
      <Route path="/help" element={<ComplaintRegisterPage />} />
      <Route path="/complaint/register" element={<ComplaintRegisterPage />} />
      <Route path="/complaint/track" element={<PublicTrackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DefaultLandingRedirect />} />

          <Route path="/home" element={<WorkspaceHomePage />} />

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
          <Route
            path="/salesperson-tracking"
            element={<Navigate to="/attendance" replace />}
          />
          <Route
            path="/attendance"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <SalespersonTrackingPage />
              </PermissionGate>
            }
          />
          <Route
            path="/visits/new"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <VisitCreatePage />
              </PermissionGate>
            }
          />
          <Route
            path="/visits/today"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <VisitDayPage />
              </PermissionGate>
            }
          />
          <Route
            path="/visits/:id"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <VisitDetailPage />
              </PermissionGate>
            }
          />
          <Route
            path="/visits"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <VisitsHomePage />
              </PermissionGate>
            }
          />
          <Route
            path="/expenses"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <MyExpensesPage />
              </PermissionGate>
            }
          />
          <Route
            path="/expenses/:id"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <ExpenseDayPage />
              </PermissionGate>
            }
          />
          <Route
            path="/leave"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <LeavePage />
              </PermissionGate>
            }
          />
          <Route
            path="/my-approvals"
            element={
              <PermissionGate
                permission="attendance"
                roles={[ROLES.ADMIN, ROLES.USER]}
                userPermission="attendance"
              >
                <TrackingApprovalsPage
                  title="Approvals"
                  subtitle="Track attendance, visit, expense, and leave approval status"
                />
              </PermissionGate>
            }
          />
          <Route path="/people" element={<Navigate to="/salesperson-tracking?tab=people" replace />} />
          <Route path="/customers" element={<Navigate to="/salesperson-tracking?tab=customers" replace />} />
          <Route path="/visit-approvals" element={<Navigate to="/salesperson-tracking?tab=approvals" replace />} />

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

          <Route
            path="/tenders"
            element={
              <PermissionGate permission="tenders" roles={[]}>
                <TendersListPage />
              </PermissionGate>
            }
          />

          <Route
            path="/inspections"
            element={
              <PermissionGate permission="inspections" roles={[]}>
                <InspectionsListPage />
              </PermissionGate>
            }
          />

          <Route
            path="/financial-documents"
            element={
              <PermissionGate permission="financialDocuments" roles={[]}>
                <FinancialDocumentsListPage />
              </PermissionGate>
            }
          />

          <Route path="/contract-agreements" element={<Navigate to="/financial-documents" replace />} />
          <Route path="/call-letters" element={<Navigate to="/financial-documents" replace />} />

          <Route
            path="/accounts"
            element={
              <PermissionGate permission="accounts" roles={[]}>
                <AccountsListPage />
              </PermissionGate>
            }
          />

          <Route
            path="/stock-items"
            element={
              <PermissionGate permission="stockItems" roles={[]}>
                <StockItemsPage />
              </PermissionGate>
            }
          />

          <Route
            path="/bom"
            element={
              <PermissionGate permission="bom" roles={[]}>
                <BomPage />
              </PermissionGate>
            }
          />

          <Route
            path="/items-master"
            element={
              <PermissionGate permission="itemsMaster" roles={[]}>
                <ItemsMasterPage />
              </PermissionGate>
            }
          />

          <Route
            path="/billing"
            element={
              <PermissionGate permission="billing" roles={[]}>
                <BillingPage />
              </PermissionGate>
            }
          />

          <Route
            path="/quotations"
            element={
              <PermissionGate permission="quotations" roles={[]}>
                <QuotationsPage />
              </PermissionGate>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <PermissionGate permission="quotations" roles={[]}>
                <QuotationFormPage mode="create" />
              </PermissionGate>
            }
          />
          <Route
            path="/quotations/:id/edit"
            element={
              <PermissionGate permission="quotations" roles={[]}>
                <QuotationFormPage mode="edit" />
              </PermissionGate>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <PermissionGate permission="quotations" roles={[]}>
                <QuotationFormPage mode="view" />
              </PermissionGate>
            }
          />
          <Route
            path="/proforma-invoices"
            element={
              <PermissionGate permission="proformaInvoices" roles={[]}>
                <ProformaInvoicesPage />
              </PermissionGate>
            }
          />
          <Route
            path="/delivery-challans"
            element={
              <PermissionGate permission="deliveryChallans" roles={[]}>
                <DeliveryChallansPage />
              </PermissionGate>
            }
          />
          <Route
            path="/atlanta-payments"
            element={
              <PermissionGate permission="atlantaPayments" roles={[ROLES.USER]}>
                <AtlantaPaymentsPage />
              </PermissionGate>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PermissionGate permission="auditLogs" userPermission="complaints" roles={[ROLES.USER]}>
                <AuditLogsPage />
              </PermissionGate>
            }
          />
          <Route
            path="/shipping"
            element={
              <PermissionGate permission="shipping" userPermission="shipping" roles={[ROLES.USER]}>
                <ShippingControlPage />
              </PermissionGate>
            }
          />
          <Route
            path="/import-control"
            element={
              <PermissionGate permission="importControl" userPermission="importControl" roles={[ROLES.USER]}>
                <ImportControlPage />
              </PermissionGate>
            }
          />

          <Route path="/cad-drawing" element={<Navigate to="/projects" replace />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/403" element={<ForbiddenPage />} />
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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
