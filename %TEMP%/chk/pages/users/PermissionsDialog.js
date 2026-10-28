import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import { PERMISSION_KEYS, ROLES } from "../../utils/constants";
const LABELS = {
  dashboard: "Dashboard",
  users: "Users",
  projects: "Projects",
  reports: "Reports",
  payments: "Payments",
  numbers: "Numbers",
  cadDrawing: "Cad Drawing (inside Projects)",
  claimApprovals: "Claim Approvals + WhatsApp alerts",
  tenders: "Tender",
  tenderWhatsappAlerts: "Tender WhatsApp alerts",
  inspections: "Inspection",
  financialDocuments: "Financial Document",
  bgWhatsappAlerts: "BG Deadline WhatsApp alerts",
  accounts: "Accounts (BG Application)",
  stockItems: "Stock Items",
  bom: "BOM",
  itemsMaster: "Items Master",
  billing: "Billing",
  quotations: "Quotations",
  quotationsOwnOnly: "Quotation user",
  proformaInvoices: "Proforma Invoices",
  deliveryChallans: "Delivery Challans",
  atlantaPayments: "Atlanta Payments",
  atlantaPaymentsOwnOnly: "Atlanta Payments user (own records only)",
  auditLogs: "Audit Logs",
  payflow: "Payflow (Vendors, Categories, Companies, Branches)",
  payflowUser: "Payflow user (submit & view own payment requests)"
};
const INSTALLER_PERMISSION_KEYS = ["projects", "reports", "cadDrawing", "atlantaPayments", "atlantaPaymentsOwnOnly", "payflowUser"];
const OPT_IN_KEYS = ["atlantaPayments", "atlantaPaymentsOwnOnly", "payflowUser"];
export default function PermissionsDialog({ open, user, onClose, onSubmit, submitting }) {
  const isAdmin = user?.role === ROLES.ADMIN;
  const keys = isAdmin ? PERMISSION_KEYS.filter((k) => k !== "payflowUser") : INSTALLER_PERMISSION_KEYS;
  const [values, setValues] = useState({});
  useEffect(() => {
    if (open) {
      setValues(
        keys.reduce((acc, key) => {
          if (!isAdmin) {
            if (OPT_IN_KEYS.includes(key)) {
              acc[key] = Boolean(user?.permissions?.[key]);
            } else {
              acc[key] = user?.permissions ? user.permissions[key] !== false : true;
            }
          } else {
            acc[key] = Boolean(user?.permissions?.[key]);
          }
          return acc;
        }, {})
      );
    }
  }, [open, user]);
  const handleCheckboxChange = (key, checked) => {
    setValues((prev) => {
      const next = { ...prev, [key]: checked };
      if (key === "atlantaPaymentsOwnOnly" && checked) {
        next.atlantaPayments = true;
      }
      if (key === "atlantaPayments" && !checked) {
        next.atlantaPaymentsOwnOnly = false;
      }
      return next;
    });
  };
  return /* @__PURE__ */ React.createElement(Dialog, { open, onClose, maxWidth: "xs", fullWidth: true }, /* @__PURE__ */ React.createElement(DialogTitle, null, "Permissions \u2014 ", user?.name), /* @__PURE__ */ React.createElement(DialogContent, null, !isAdmin && /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Installers can use Projects and Reports by default. For Atlanta Payments, enable ", /* @__PURE__ */ React.createElement("b", null, "Atlanta Payments"), " and", " ", /* @__PURE__ */ React.createElement("b", null, "Atlanta Payments user (own records only)"), " so they can only view and manage their own payment records."), isAdmin && /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Enable ", /* @__PURE__ */ React.createElement("b", null, "Claim Approvals + WhatsApp alerts"), " for claim notifications, ", /* @__PURE__ */ React.createElement("b", null, "Tender WhatsApp alerts"), " for tender-created notifications, and ", /* @__PURE__ */ React.createElement("b", null, "BG Deadline WhatsApp alerts"), " for BG reminders (14 days after LOA Date). For a ", /* @__PURE__ */ React.createElement("b", null, "quotation user"), ", tick only ", /* @__PURE__ */ React.createElement("b", null, "Quotations"), " and ", /* @__PURE__ */ React.createElement("b", null, "Quotation user"), ". For an", " ", /* @__PURE__ */ React.createElement("b", null, "Atlanta Payments user (own records only)"), ", tick ", /* @__PURE__ */ React.createElement("b", null, "Atlanta Payments"), " and", " ", /* @__PURE__ */ React.createElement("b", null, "Atlanta Payments user (own records only)"), "."), /* @__PURE__ */ React.createElement(FormGroup, null, keys.map((key) => /* @__PURE__ */ React.createElement(
    FormControlLabel,
    {
      key,
      control: /* @__PURE__ */ React.createElement(
        Checkbox,
        {
          checked: values[key] || false,
          onChange: (e) => handleCheckboxChange(key, e.target.checked)
        }
      ),
      label: LABELS[key]
    }
  )))), /* @__PURE__ */ React.createElement(DialogActions, null, /* @__PURE__ */ React.createElement(Button, { onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Button, { variant: "contained", onClick: () => onSubmit(values), disabled: submitting }, submitting ? "Saving\u2026" : "Save")));
}
