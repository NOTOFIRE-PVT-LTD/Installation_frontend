import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import PermissionGate from "../components/common/PermissionGate";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UsersListPage from "../pages/users/UsersListPage";
import ProjectsListPage from "../pages/projects/ProjectsListPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import StationDetailPage from "../pages/projects/StationDetailPage";
import ApprovalsQueuePage from "../pages/projects/ApprovalsQueuePage";
import ReportsListPage from "../pages/reports/ReportsListPage";
import ReportFormPage from "../pages/reports/ReportFormPage";
import ReportDetailPage from "../pages/reports/ReportDetailPage";
import PaymentsListPage from "../pages/payments/PaymentsListPage";
import NumbersPage from "../pages/numbers/NumbersPage";
import WhatsAppLogsPage from "../pages/whatsapp/WhatsAppLogsPage";
import TendersListPage from "../pages/tenders/TendersListPage";
import InspectionsListPage from "../pages/inspections/InspectionsListPage";
import FinancialDocumentsListPage from "../pages/financialDocuments/FinancialDocumentsListPage";
import AccountsListPage from "../pages/accounts/AccountsListPage";
import BgApplicationPrintPage from "../pages/accounts/BgApplicationPrintPage";
import StockItemsPage from "../pages/stock/StockItemsPage";
import BomPage from "../pages/bom/BomPage";
import ItemsMasterPage from "../pages/itemMaster/ItemsMasterPage";
import BillingPage from "../pages/billing/BillingPage";
import QuotationsPage from "../pages/quotations/QuotationsPage";
import QuotationFormPage from "../pages/quotations/QuotationFormPage";
import ProformaInvoicesPage from "../pages/proformaInvoices/ProformaInvoicesPage";
import DeliveryChallansPage from "../pages/deliveryChallans/DeliveryChallansPage";
import AtlantaPaymentsPage from "../pages/atlantaPayments/AtlantaPaymentsPage";
import AuditLogsPage from "../pages/auditLogs/AuditLogsPage";
import PayflowPage from "../pages/payflow/PayflowPage";
import PayflowUserPage from "../pages/payflow/PayflowUserPage";
import ProfilePage from "../pages/profile/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import { useAuth } from "../hooks/useAuth";
import { getDefaultLandingPath } from "./routeConfig";
import { ROLES } from "../utils/constants";
function DefaultLandingRedirect() {
  const { user, permissions } = useAuth();
  return /* @__PURE__ */ React.createElement(Navigate, { to: getDefaultLandingPath(user, permissions), replace: true });
}
export default function AppRoutes() {
  return /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { element: /* @__PURE__ */ React.createElement(AuthLayout, null) }, /* @__PURE__ */ React.createElement(Route, { path: "/login", element: /* @__PURE__ */ React.createElement(LoginPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/forgot-password", element: /* @__PURE__ */ React.createElement(ForgotPasswordPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/reset-password/:token", element: /* @__PURE__ */ React.createElement(ResetPasswordPage, null) })), /* @__PURE__ */ React.createElement(Route, { element: /* @__PURE__ */ React.createElement(ProtectedRoute, null) }, /* @__PURE__ */ React.createElement(Route, { element: /* @__PURE__ */ React.createElement(DashboardLayout, null) }, /* @__PURE__ */ React.createElement(Route, { path: "/", element: /* @__PURE__ */ React.createElement(DefaultLandingRedirect, null) }), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/dashboard",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "dashboard", roles: [] }, /* @__PURE__ */ React.createElement(DashboardPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/users",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "users", roles: [] }, /* @__PURE__ */ React.createElement(UsersListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/projects",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "projects", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ProjectsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/projects/:id",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "projects", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ProjectDetailPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/projects/:id/stations/:stationId",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "projects", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(StationDetailPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/approvals",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "claimApprovals", roles: [] }, /* @__PURE__ */ React.createElement(ApprovalsQueuePage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/whatsapp-logs",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "users", roles: [] }, /* @__PURE__ */ React.createElement(WhatsAppLogsPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/reports",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "reports", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ReportsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/reports/new",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "reports", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ReportFormPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/reports/:id",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "reports", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ReportDetailPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/reports/:id/edit",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "reports", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(ReportFormPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/payments",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "payments", roles: [] }, /* @__PURE__ */ React.createElement(PaymentsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/numbers",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "numbers", roles: [] }, /* @__PURE__ */ React.createElement(NumbersPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/tenders",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "tenders", roles: [] }, /* @__PURE__ */ React.createElement(TendersListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/inspections",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "inspections", roles: [] }, /* @__PURE__ */ React.createElement(InspectionsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/financial-documents",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "financialDocuments", roles: [] }, /* @__PURE__ */ React.createElement(FinancialDocumentsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(Route, { path: "/contract-agreements", element: /* @__PURE__ */ React.createElement(Navigate, { to: "/financial-documents", replace: true }) }), /* @__PURE__ */ React.createElement(Route, { path: "/call-letters", element: /* @__PURE__ */ React.createElement(Navigate, { to: "/financial-documents", replace: true }) }), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/accounts",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "accounts", roles: [] }, /* @__PURE__ */ React.createElement(AccountsListPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/stock-items",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "stockItems", roles: [] }, /* @__PURE__ */ React.createElement(StockItemsPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/bom",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "bom", roles: [] }, /* @__PURE__ */ React.createElement(BomPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/items-master",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "itemsMaster", roles: [] }, /* @__PURE__ */ React.createElement(ItemsMasterPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/billing",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "billing", roles: [] }, /* @__PURE__ */ React.createElement(BillingPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/quotations",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "quotations", roles: [] }, /* @__PURE__ */ React.createElement(QuotationsPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/quotations/new",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "quotations", roles: [] }, /* @__PURE__ */ React.createElement(QuotationFormPage, { mode: "create" }))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/quotations/:id/edit",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "quotations", roles: [] }, /* @__PURE__ */ React.createElement(QuotationFormPage, { mode: "edit" }))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/quotations/:id",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "quotations", roles: [] }, /* @__PURE__ */ React.createElement(QuotationFormPage, { mode: "view" }))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/proforma-invoices",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "proformaInvoices", roles: [] }, /* @__PURE__ */ React.createElement(ProformaInvoicesPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/delivery-challans",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "deliveryChallans", roles: [] }, /* @__PURE__ */ React.createElement(DeliveryChallansPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/atlanta-payments",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "atlantaPayments", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(AtlantaPaymentsPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/audit-logs",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "auditLogs", roles: [] }, /* @__PURE__ */ React.createElement(AuditLogsPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/payflow",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "payflow", roles: [] }, /* @__PURE__ */ React.createElement(PayflowPage, null))
    }
  ), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/payflow-requests",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "payflowUser", roles: [ROLES.USER] }, /* @__PURE__ */ React.createElement(PayflowUserPage, null))
    }
  ), /* @__PURE__ */ React.createElement(Route, { path: "/cad-drawing", element: /* @__PURE__ */ React.createElement(Navigate, { to: "/projects", replace: true }) }), /* @__PURE__ */ React.createElement(Route, { path: "/profile", element: /* @__PURE__ */ React.createElement(ProfilePage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/403", element: /* @__PURE__ */ React.createElement(ForbiddenPage, null) })), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/accounts/:id/print",
      element: /* @__PURE__ */ React.createElement(PermissionGate, { permission: "accounts", roles: [] }, /* @__PURE__ */ React.createElement(BgApplicationPrintPage, null))
    }
  )), /* @__PURE__ */ React.createElement(Route, { path: "*", element: /* @__PURE__ */ React.createElement(NotFoundPage, null) }));
}
