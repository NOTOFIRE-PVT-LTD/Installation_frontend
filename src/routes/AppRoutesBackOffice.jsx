import { Navigate, Route } from 'react-router-dom';
import PermissionGate from '../components/common/PermissionGate';
import PaymentsListPage from '../pages/payments/PaymentsListPage';
import NumbersPage from '../pages/numbers/NumbersPage';
import TendersListPage from '../pages/tenders/TendersListPage';
import InspectionsListPage from '../pages/inspections/InspectionsListPage';
import FinancialDocumentsListPage from '../pages/financialDocuments/FinancialDocumentsListPage';
import CallLettersListPage from '../pages/callLetters/CallLettersListPage';
import AccountsListPage from '../pages/accounts/AccountsListPage';
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
import ContractorAttendancePage from '../pages/contractorAttendance/ContractorAttendancePage';
import PayflowPage from '../pages/payflow/PayflowPage';
import PayflowUserPage from '../pages/payflow/PayflowUserPage';
import SalesTravelRequestsPage from '../pages/salesTravelRequests/SalesTravelRequestsPage';
import LeadTrackWorkspacePage from '../pages/leadTrack/LeadTrackWorkspacePage';
import ProfilePage from '../pages/profile/ProfilePage';
import ForbiddenPage from '../pages/ForbiddenPage';
import { ROLES } from '../utils/constants';

export const backOfficeRouteNodes = (
  <>
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
    <Route
      path="/call-letters"
      element={
        <PermissionGate permission="financialDocuments" roles={[]}>
          <CallLettersListPage />
        </PermissionGate>
      }
    />
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
    <Route
      path="/contractor-attendance"
      element={
        <PermissionGate
          permission="contractorAttendance"
          userPermission="contractorAttendance"
          roles={[ROLES.ADMIN, ROLES.USER]}
        >
          <ContractorAttendancePage />
        </PermissionGate>
      }
    />
    <Route
      path="/payflow"
      element={
        <PermissionGate permission="payflow" roles={[]}>
          <PayflowPage />
        </PermissionGate>
      }
    />
    <Route
      path="/payflow-requests"
      element={
        <PermissionGate permission="payflowUser" roles={[ROLES.USER]}>
          <PayflowUserPage />
        </PermissionGate>
      }
    />
    <Route
      path="/sales-travel-requests"
      element={
        <PermissionGate permission="salesTravelRequests" roles={[ROLES.USER]}>
          <SalesTravelRequestsPage />
        </PermissionGate>
      }
    />
    <Route
      path="/lead-track"
      element={
        <PermissionGate
          permission="leadTrack"
          userPermission="leadTrack"
          roles={[ROLES.ADMIN, ROLES.USER]}
        >
          <LeadTrackWorkspacePage />
        </PermissionGate>
      }
    />
    <Route path="/cad-drawing" element={<Navigate to="/projects" replace />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/403" element={<ForbiddenPage />} />
  </>
);
