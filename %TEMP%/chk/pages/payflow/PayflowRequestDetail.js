import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { payflowRequestApi } from "../../api/payflowApi";
import { useAppDispatch } from "../../app/hooks";
import { showSnackbar } from "../../features/ui/uiSlice";
import {
  ACTION_ORDER,
  PRIORITY_STYLES,
  REQUEST_STATUS_STYLES,
  STATUS_ACTIONS,
  formatInr
} from "./payflowRequestConfig";
const fmtDate = (d, opts = { day: "2-digit", month: "short", year: "numeric" }) => d ? new Date(d).toLocaleDateString("en-IN", opts) : "\u2014";
export function StatusPill({ status }) {
  const style = REQUEST_STATUS_STYLES[status] || REQUEST_STATUS_STYLES.Postponed;
  return /* @__PURE__ */ React.createElement(
    Chip,
    {
      label: status,
      size: "small",
      sx: { bgcolor: style.bg, color: style.color, fontWeight: 600, height: 22, fontSize: "0.72rem" }
    }
  );
}
function Row({ label, value, strong }) {
  return /* @__PURE__ */ React.createElement(Stack, { direction: "row", justifyContent: "space-between", spacing: 2, sx: { py: 0.75 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: strong ? { fontWeight: 700, color: "text.primary" } : void 0 }, label), /* @__PURE__ */ React.createElement(Typography, { variant: "body2", sx: { fontWeight: strong ? 800 : 600, textAlign: "right" } }, value || "\u2014"));
}
function SectionTitle({ children }) {
  return /* @__PURE__ */ React.createElement(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontWeight: 700, mb: 1 } }, children);
}
export default function PayflowRequestDetail({ requestId, onBack, onChanged }) {
  const dispatch = useAppDispatch();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await payflowRequestApi.get(requestId);
      setRequest(data.data);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || "Failed to load payment request", severity: "error" }));
      onBack();
    } finally {
      setLoading(false);
    }
  }, [requestId]);
  useEffect(() => {
    load();
  }, [load]);
  const openAction = (status) => {
    setRemark("");
    setPendingStatus(status);
  };
  const confirmStatus = async () => {
    setSaving(true);
    try {
      const { data } = await payflowRequestApi.changeStatus(requestId, { status: pendingStatus, remark });
      setRequest(data.data);
      dispatch(showSnackbar({ message: data.message }));
      setPendingStatus(null);
      onChanged?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || "Failed to update status", severity: "error" }));
    } finally {
      setSaving(false);
    }
  };
  if (loading && !request) {
    return /* @__PURE__ */ React.createElement(Box, { sx: { display: "grid", placeItems: "center", py: 10 } }, /* @__PURE__ */ React.createElement(CircularProgress, null));
  }
  if (!request) return null;
  const priority = PRIORITY_STYLES[request.priority] || PRIORITY_STYLES.Medium;
  const balance = request.balanceAmount ?? Math.max((request.totalOutstanding || 0) - (request.amount || 0), 0);
  const bills = request.bills?.length ? request.bills : request.billNumber ? [{ billNumber: request.billNumber, billDate: request.billDate }] : [];
  const people = [
    ["Price Check Guaranteed By", request.priceCheckBy],
    ["Quantity Checked By", request.quantityCheckedBy],
    ["Quality Checked By", request.qualityCheckedBy],
    ["Purchase Owner", request.purchaseOwner]
  ].filter(([, p]) => p?.name);
  const actions = ACTION_ORDER.filter((s) => request.allowedStatuses?.includes(s));
  const pendingAction = pendingStatus ? STATUS_ACTIONS[pendingStatus] : null;
  return /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Stack, { direction: "row", alignItems: "center", spacing: 1.5, sx: { mb: 2.5 } }, /* @__PURE__ */ React.createElement(Button, { startIcon: /* @__PURE__ */ React.createElement(ArrowBackIcon, null), color: "inherit", onClick: onBack, sx: { fontWeight: 600 } }, "Back"), /* @__PURE__ */ React.createElement(Typography, { variant: "h5", sx: { fontWeight: 700 } }, "Payment Details")), /* @__PURE__ */ React.createElement(Paper, { variant: "outlined", sx: { p: { xs: 2, md: 3 }, borderRadius: 3, maxWidth: 900 } }, /* @__PURE__ */ React.createElement(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.2 } }, request.vendor), /* @__PURE__ */ React.createElement(Box, { sx: { mt: 0.75 } }, /* @__PURE__ */ React.createElement(StatusPill, { status: request.status }), /* @__PURE__ */ React.createElement(Typography, { component: "span", variant: "caption", color: "text.secondary", sx: { ml: 1 } }, "SR No. ", request.srNo))), /* @__PURE__ */ React.createElement(Stack, { alignItems: "flex-end", spacing: 0.75 }, /* @__PURE__ */ React.createElement(Chip, { label: `${request.priority} Priority`, size: "small", sx: { bgcolor: priority.bg, color: priority.color, fontWeight: 700 } }), /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary" }, fmtDate(request.requestDate, { month: "short", day: "2-digit", year: "numeric" })))), /* @__PURE__ */ React.createElement(Divider, { sx: { my: 2 } }), /* @__PURE__ */ React.createElement(SectionTitle, null, "Item Description"), /* @__PURE__ */ React.createElement(Box, { sx: { bgcolor: "action.hover", borderRadius: 2, px: 2, py: 1.5, mb: 3 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", sx: { fontWeight: 500 } }, request.description || "\u2014")), /* @__PURE__ */ React.createElement(Box, { sx: { display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } } }, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(SectionTitle, null, "Payment Details"), /* @__PURE__ */ React.createElement(Box, { sx: { bgcolor: "action.hover", borderRadius: 2, px: 2, py: 1.5 } }, /* @__PURE__ */ React.createElement(Row, { label: "Vendor Name:", value: request.vendor }), /* @__PURE__ */ React.createElement(Row, { label: "Account Number:", value: request.vendorAccountNumber }), /* @__PURE__ */ React.createElement(Row, { label: "IFSC Code:", value: request.vendorIfsc }), /* @__PURE__ */ React.createElement(Row, { label: "Category:", value: request.category }), /* @__PURE__ */ React.createElement(Row, { label: "Subcategory:", value: request.subcategory }), /* @__PURE__ */ React.createElement(Row, { label: "Item Type:", value: request.itemType }), /* @__PURE__ */ React.createElement(Row, { label: "Company/Branch:", value: `${request.company}, ${request.branch}` }), /* @__PURE__ */ React.createElement(Row, { label: "Total Outstanding:", value: formatInr(request.totalOutstanding) }), /* @__PURE__ */ React.createElement(Row, { label: "Pay Against:", value: request.payAgainst }), /* @__PURE__ */ React.createElement(Row, { label: "Bank Name:", value: request.bankName }), /* @__PURE__ */ React.createElement(Row, { label: "Payment Mode:", value: request.paymentMode }), /* @__PURE__ */ React.createElement(Row, { label: "Payment Amount:", value: formatInr(request.amount), strong: true }), /* @__PURE__ */ React.createElement(Divider, { sx: { my: 0.75 } }), /* @__PURE__ */ React.createElement(Row, { label: "Balance Amount:", value: formatInr(balance) }))), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(SectionTitle, null, "Bill Information"), /* @__PURE__ */ React.createElement(Box, { sx: { bgcolor: "action.hover", borderRadius: 2, px: 2, py: 1.5 } }, bills.length === 0 && /* @__PURE__ */ React.createElement(Row, { label: "Bills:", value: "" }), bills.map((b, i) => /* @__PURE__ */ React.createElement(Box, { key: i }, i > 0 && /* @__PURE__ */ React.createElement(Divider, { sx: { my: 0.75 } }), /* @__PURE__ */ React.createElement(Row, { label: `Bill Number${bills.length > 1 ? ` ${i + 1}` : ""}:`, value: b.billNumber }), /* @__PURE__ */ React.createElement(Row, { label: "Bill Date:", value: b.billDate ? fmtDate(b.billDate) : "\u2014" })))), /* @__PURE__ */ React.createElement(Box, { sx: { mt: 3 } }, /* @__PURE__ */ React.createElement(SectionTitle, null, "Other Details"), /* @__PURE__ */ React.createElement(Box, { sx: { bgcolor: "action.hover", borderRadius: 2, px: 2, py: 1.5 } }, /* @__PURE__ */ React.createElement(Row, { label: "Department:", value: request.department }), /* @__PURE__ */ React.createElement(Row, { label: "End Use:", value: request.endUse }), /* @__PURE__ */ React.createElement(Row, { label: "LPR:", value: request.lpr }), /* @__PURE__ */ React.createElement(Row, { label: "IOA:", value: request.ioa }), /* @__PURE__ */ React.createElement(Row, { label: "CPP (days):", value: request.cpp != null ? String(request.cpp) : "" }))))), people.length > 0 && /* @__PURE__ */ React.createElement(Box, { sx: { mt: 3 } }, /* @__PURE__ */ React.createElement(SectionTitle, null, "Additional Details"), /* @__PURE__ */ React.createElement(Box, { sx: { bgcolor: "action.hover", borderRadius: 2, p: 1.5, display: "flex", gap: 1.5, flexWrap: "wrap" } }, people.map(([label, p]) => /* @__PURE__ */ React.createElement(Paper, { key: label, sx: { p: 2, borderRadius: 2, minWidth: 220 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 600 } }, label), /* @__PURE__ */ React.createElement(Typography, { sx: { fontWeight: 700 } }, p.name), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "text.secondary" }, p.email))))), request.attachments?.length > 0 && /* @__PURE__ */ React.createElement(Box, { sx: { mt: 3 } }, /* @__PURE__ */ React.createElement(SectionTitle, null, "Attachments"), /* @__PURE__ */ React.createElement(Stack, { spacing: 0.5 }, request.attachments.map((a, i) => /* @__PURE__ */ React.createElement(Typography, { key: i, variant: "body2" }, /* @__PURE__ */ React.createElement("a", { href: a.url, target: "_blank", rel: "noreferrer" }, a.name || `Attachment ${i + 1}`))))), /* @__PURE__ */ React.createElement(Divider, { sx: { my: 3 } }), /* @__PURE__ */ React.createElement(SectionTitle, null, "Requested By"), /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, request.requestedBy?.name || "\u2014"), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "text.secondary" }, request.requestedBy?.email), request.history?.length > 0 && /* @__PURE__ */ React.createElement(Box, { sx: { mt: 3 } }, /* @__PURE__ */ React.createElement(SectionTitle, null, "Status History"), /* @__PURE__ */ React.createElement(Stack, { spacing: 1 }, [...request.history].reverse().map((h, i) => /* @__PURE__ */ React.createElement(Stack, { key: i, direction: "row", spacing: 1.5, alignItems: "baseline", flexWrap: "wrap" }, /* @__PURE__ */ React.createElement(StatusPill, { status: h.to }), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "text.secondary" }, fmtDate(h.at, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), h.by?.name ? ` \xB7 ${h.by.name}` : ""), h.remark && /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, "\u2014 ", h.remark))))), /* @__PURE__ */ React.createElement(Stack, { direction: "row", spacing: 1.5, flexWrap: "wrap", useFlexGap: true, sx: { mt: 4 } }, actions.length === 0 ? /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "This request is ", request.status.toLowerCase(), " \u2014 no further actions available.") : actions.map((s) => {
    const a = STATUS_ACTIONS[s];
    return /* @__PURE__ */ React.createElement(
      Button,
      {
        key: s,
        variant: "contained",
        disableElevation: true,
        onClick: () => openAction(s),
        sx: { bgcolor: a.color, color: a.textColor || "#fff", fontWeight: 600, "&:hover": { bgcolor: a.color, filter: "brightness(0.92)" } }
      },
      a.label
    );
  }))), /* @__PURE__ */ React.createElement(Dialog, { open: Boolean(pendingStatus), onClose: () => !saving && setPendingStatus(null), fullWidth: true, maxWidth: "xs" }, /* @__PURE__ */ React.createElement(DialogTitle, { sx: { fontWeight: 700 } }, pendingAction?.label, " request #", request.srNo, "?"), /* @__PURE__ */ React.createElement(DialogContent, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Status will change from ", /* @__PURE__ */ React.createElement("b", null, request.status), " to ", /* @__PURE__ */ React.createElement("b", null, pendingStatus), "."), /* @__PURE__ */ React.createElement(
    TextField,
    {
      autoFocus: true,
      fullWidth: true,
      multiline: true,
      minRows: 2,
      size: "small",
      label: pendingAction?.needsRemark ? "Remark (required)" : "Remark (optional)",
      value: remark,
      onChange: (e) => setRemark(e.target.value),
      slotProps: { htmlInput: { maxLength: 500 } }
    }
  )), /* @__PURE__ */ React.createElement(DialogActions, { sx: { px: 3, pb: 2 } }, /* @__PURE__ */ React.createElement(Button, { onClick: () => setPendingStatus(null), disabled: saving }, "Cancel"), /* @__PURE__ */ React.createElement(
    Button,
    {
      variant: "contained",
      onClick: confirmStatus,
      disabled: saving || pendingAction?.needsRemark && !remark.trim()
    },
    saving ? "Saving\u2026" : "Confirm"
  ))));
}
