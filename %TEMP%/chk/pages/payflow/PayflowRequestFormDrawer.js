import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { payflowApi, payflowRequestApi } from "../../api/payflowApi";
import { uploadFileToCloudinary } from "../../utils/cloudinaryUpload";
import { useAppDispatch } from "../../app/hooks";
import { showSnackbar } from "../../features/ui/uiSlice";
import {
  BANK_OPTIONS,
  ITEM_TYPE_OPTIONS,
  PAY_AGAINST_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  PRIORITY_OPTIONS
} from "./payflowRequestConfig";
const MAX_FILE_MB = 10;
const ACCEPTED_FILES = "image/jpeg,image/png,image/webp,application/pdf";
const num = (label) => yup.number().transform((v, orig) => orig === "" || orig == null ? void 0 : v).typeError(`${label} must be a number`).min(0, `${label} cannot be negative`);
const req = (label) => yup.string().trim().required(`${label} is required`);
const schema = yup.object({
  vendor: req("Vendor name"),
  isNewVendor: yup.boolean(),
  vendorAccountNumber: yup.string().when("isNewVendor", {
    is: true,
    then: (s) => s.trim().matches(/^[A-Za-z0-9]{8,20}$/, "Account number must be alphanumeric (8-20 characters)"),
    otherwise: (s) => s
  }),
  vendorIfsc: yup.string().when("isNewVendor", {
    is: true,
    then: (s) => s.trim().matches(/^[A-Za-z0-9]{8,11}$/, "IFSC code must be alphanumeric (8-11 characters)"),
    otherwise: (s) => s
  }),
  company: req("Company name"),
  branch: req("Company branch"),
  category: req("Category"),
  subcategory: req("Sub-category"),
  itemType: req("Item type"),
  totalOutstanding: num("Total outstanding"),
  bankName: req("Bank name"),
  paymentMode: req("Payment mode"),
  priority: req("Urgency level"),
  payAgainst: req("Pay against"),
  amount: num("Payment amount").required("Payment amount is required"),
  priceCheckBy: req("Price check guaranteed by"),
  quantityCheckedBy: yup.string(),
  qualityCheckedBy: yup.string(),
  purchaseOwner: yup.string(),
  description: req("Item description"),
  department: yup.string(),
  endUse: yup.string(),
  lpr: yup.string(),
  ioa: yup.string(),
  cpp: num("CPP"),
  bills: yup.array().of(
    yup.object({
      billNumber: req("Bill number"),
      billDate: req("Bill date")
    })
  ).min(1, "At least one bill is required")
});
const EMPTY_BILL = { billNumber: "", billDate: "" };
const EMPTY = {
  vendor: "",
  isNewVendor: false,
  vendorAccountNumber: "",
  vendorIfsc: "",
  company: "",
  branch: "",
  category: "",
  subcategory: "",
  itemType: "",
  totalOutstanding: "",
  bankName: "",
  paymentMode: "",
  priority: "",
  payAgainst: "Tax Invoice",
  amount: "",
  priceCheckBy: "",
  quantityCheckedBy: "",
  qualityCheckedBy: "",
  purchaseOwner: "",
  description: "",
  department: "",
  endUse: "",
  lpr: "",
  ioa: "",
  cpp: "",
  bills: [{ ...EMPTY_BILL }]
};
const MASTERS = [
  ["categories", "category"],
  ["subcategories", "subcategory"],
  ["companies", "company"],
  ["branches", "branch"]
];
const labelSx = { "& .MuiInputLabel-root": { fontWeight: 600 } };
export default function PayflowRequestFormDrawer({ open, submitting, onClose, onSubmit }) {
  const dispatch = useAppDispatch();
  const [options, setOptions] = useState({});
  const [users, setUsers] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [vendorMatch, setVendorMatch] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const vendorTimer = useRef(null);
  const { control, handleSubmit, reset, watch, setValue } = useForm({ resolver: yupResolver(schema), defaultValues: EMPTY });
  const { fields: billFields, append, remove } = useFieldArray({ control, name: "bills" });
  const outstanding = Number(watch("totalOutstanding")) || 0;
  const payment = Number(watch("amount")) || 0;
  const balance = Math.max(outstanding - payment, 0);
  const isNewVendor = watch("isNewVendor");
  const searchVendors = (term) => {
    clearTimeout(vendorTimer.current);
    vendorTimer.current = setTimeout(async () => {
      try {
        const { data } = await payflowApi.list("vendors", { pageSize: 20, search: term || void 0 });
        setVendorOptions(data.data);
      } catch {
      }
    }, 250);
  };
  useEffect(() => {
    if (!open) return void 0;
    reset(EMPTY);
    setFiles([]);
    setVendorMatch(null);
    searchVendors("");
    MASTERS.forEach(async ([resource, key]) => {
      try {
        const { data } = await payflowApi.list(resource, { pageSize: 100 });
        setOptions((prev) => ({ ...prev, [key]: data.data.map((d) => d.name) }));
      } catch {
      }
    });
    payflowRequestApi.userOptions().then(({ data }) => setUsers(data.data)).catch(() => {
    });
    return () => clearTimeout(vendorTimer.current);
  }, [open, reset]);
  const handleVendorInput = (text2) => {
    setValue("vendor", text2, { shouldValidate: false });
    const match = vendorOptions.find((v) => v.name.toLowerCase() === text2.trim().toLowerCase());
    setVendorMatch(match || null);
    setValue("isNewVendor", !match && Boolean(text2.trim()));
    setValue("vendorAccountNumber", match ? match.accountNumber : "");
    setValue("vendorIfsc", match ? match.ifscCode : "");
    searchVendors(text2);
  };
  const text = (name, label, extra = {}) => /* @__PURE__ */ React.createElement(
    Controller,
    {
      name,
      control,
      render: ({ field, fieldState: { error } }) => /* @__PURE__ */ React.createElement(
        TextField,
        {
          ...field,
          label,
          size: "small",
          fullWidth: true,
          error: Boolean(error),
          helperText: error?.message,
          sx: labelSx,
          slotProps: { inputLabel: { shrink: true } },
          ...extra
        }
      )
    }
  );
  const select = (name, label, items, extra = {}) => text(name, label, {
    select: true,
    slotProps: { inputLabel: { shrink: true }, select: { displayEmpty: true } },
    children: [
      /* @__PURE__ */ React.createElement(MenuItem, { key: "__empty", value: "", sx: { color: "text.disabled" } }, extra.emptyLabel || `Select ${label.toLowerCase()}`),
      ...items.map((i) => {
        const [value, display] = typeof i === "string" ? [i, i] : [i.value, i.label];
        return /* @__PURE__ */ React.createElement(MenuItem, { key: value, value }, display);
      })
    ],
    required: extra.required
  });
  const userSelect = (name, label, required = false) => select(
    name,
    label,
    users.map((u) => ({ value: u._id, label: u.name })),
    { required, emptyLabel: "Select user" }
  );
  const combo = (name, label, placeholder, required = true) => /* @__PURE__ */ React.createElement(
    Controller,
    {
      name,
      control,
      render: ({ field, fieldState: { error } }) => /* @__PURE__ */ React.createElement(
        Autocomplete,
        {
          options: options[name] || [],
          value: field.value || null,
          onChange: (_, v) => field.onChange(v || ""),
          renderInput: (params) => /* @__PURE__ */ React.createElement(
            TextField,
            {
              ...params,
              label,
              required,
              placeholder,
              size: "small",
              error: Boolean(error),
              helperText: error?.message,
              sx: labelSx,
              slotProps: { inputLabel: { shrink: true } }
            }
          )
        }
      )
    }
  );
  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      dispatch(showSnackbar({ message: `${tooBig.name} is larger than ${MAX_FILE_MB} MB`, severity: "error" }));
      return;
    }
    setFiles((prev) => [...prev, ...picked].slice(0, 20));
  };
  const pickUser = (id) => {
    const u = users.find((x) => x._id === id);
    return u ? { user: u._id, name: u.name, email: u.email } : void 0;
  };
  const submit = handleSubmit(async (v) => {
    setUploading(true);
    try {
      const attachments = [];
      for (const file of files) {
        const kind = file.type === "application/pdf" ? "document" : "image";
        const { url, publicId } = await uploadFileToCloudinary(file, kind);
        attachments.push({ url, publicId, name: file.name });
      }
      const payload = { ...v };
      delete payload.isNewVendor;
      await onSubmit({
        ...payload,
        vendorAccountNumber: v.vendorAccountNumber || void 0,
        vendorIfsc: v.vendorIfsc || void 0,
        totalOutstanding: v.totalOutstanding === "" ? 0 : v.totalOutstanding,
        cpp: v.cpp === "" ? void 0 : v.cpp,
        priceCheckBy: pickUser(v.priceCheckBy),
        quantityCheckedBy: pickUser(v.quantityCheckedBy),
        qualityCheckedBy: pickUser(v.qualityCheckedBy),
        purchaseOwner: pickUser(v.purchaseOwner),
        attachments
      });
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || "Failed to upload attachments", severity: "error" }));
    } finally {
      setUploading(false);
    }
  });
  const busy = submitting || uploading;
  const grid = useMemo(() => ({ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }), []);
  return /* @__PURE__ */ React.createElement(Dialog, { open, onClose: busy ? void 0 : onClose, fullWidth: true, maxWidth: "md", scroll: "paper" }, /* @__PURE__ */ React.createElement(DialogTitle, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 } }, "Submit Payment Request", /* @__PURE__ */ React.createElement(IconButton, { onClick: onClose, size: "small", "aria-label": "Close", disabled: busy, sx: { color: "error.light" } }, /* @__PURE__ */ React.createElement(CloseIcon, null))), /* @__PURE__ */ React.createElement(DialogContent, { dividers: true }, /* @__PURE__ */ React.createElement(Stack, { spacing: 2.5, sx: { pt: 0.5 } }, /* @__PURE__ */ React.createElement(Box, { sx: grid }, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(
    Controller,
    {
      name: "vendor",
      control,
      render: ({ field, fieldState: { error } }) => /* @__PURE__ */ React.createElement(
        Autocomplete,
        {
          freeSolo: true,
          options: vendorOptions.map((v) => v.name),
          inputValue: field.value,
          onInputChange: (_, v) => handleVendorInput(v),
          renderInput: (params) => /* @__PURE__ */ React.createElement(
            TextField,
            {
              ...params,
              label: "Vendor Name",
              required: true,
              placeholder: "Type to search vendors...",
              size: "small",
              error: Boolean(error),
              helperText: error?.message || "Type to search vendors or add new one",
              sx: labelSx,
              slotProps: { inputLabel: { shrink: true } }
            }
          )
        }
      )
    }
  )), text("vendorAccountNumber", isNewVendor ? "Account Number" : "Account Number (Auto-filled)", {
    placeholder: vendorMatch ? "" : "Select vendor to view account number",
    disabled: !isNewVendor,
    required: isNewVendor
  }), text("vendorIfsc", isNewVendor ? "IFSC Code/ Swift Code" : "IFSC Code/ Swift Code (Auto-filled)", {
    placeholder: vendorMatch ? "" : "Select vendor to view IFSC code",
    disabled: !isNewVendor,
    required: isNewVendor
  }), combo("company", "Company", "Select Company"), combo("branch", "Company Branch", "Select Branch"), combo("category", "Category", "Type to search categories..."), combo("subcategory", "Sub-category", "Type to search sub-categories..."), select("itemType", "Item Type", ITEM_TYPE_OPTIONS, { required: true }), text("totalOutstanding", "Total Outstanding Amount", { type: "number" }), select("bankName", "Bank Name", BANK_OPTIONS, { required: true }), select("paymentMode", "Payment Mode", PAYMENT_MODE_OPTIONS, { required: true }), select("priority", "Urgency Level", PRIORITY_OPTIONS, { required: true }), select("payAgainst", "Pay Against", PAY_AGAINST_OPTIONS, { required: true }), text("amount", "Payment Amount", { type: "number", required: true }), /* @__PURE__ */ React.createElement(
    TextField,
    {
      label: "Balance Amount",
      size: "small",
      fullWidth: true,
      value: balance,
      disabled: true,
      sx: labelSx,
      slotProps: { inputLabel: { shrink: true } }
    }
  ), userSelect("priceCheckBy", "Price Check Guaranteed By", true), userSelect("quantityCheckedBy", "Quantity Checked By"), userSelect("qualityCheckedBy", "Quality Checked By"), userSelect("purchaseOwner", "Purchase Owner")), text("description", "Item Description", { required: true, multiline: true, minRows: 2 }), /* @__PURE__ */ React.createElement(Box, { sx: grid }, text("department", "Department", { placeholder: "Enter department" }), text("endUse", "End Use", { placeholder: "Enter end use" }), text("lpr", "LPR (Last Purchase Rate)", { placeholder: "Enter last purchase rate" }), text("ioa", "IOA (Internal Order Accounting)", { placeholder: "Enter internal order accounting" }), text("cpp", "CPP (Credit Payment Period)", { type: "number", placeholder: "Enter credit payment period (days)" })), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1 } }, "Bills ", /* @__PURE__ */ React.createElement("span", { style: { color: "#d32f2f" } }, "*")), /* @__PURE__ */ React.createElement(Stack, { spacing: 1.5 }, billFields.map((bill, i) => /* @__PURE__ */ React.createElement(Box, { key: bill.id, sx: { bgcolor: "action.hover", borderRadius: 2, p: 2, position: "relative" } }, /* @__PURE__ */ React.createElement(Box, { sx: grid }, text(`bills.${i}.billNumber`, "Bill Number", { required: true }), text(`bills.${i}.billDate`, "Bill Date", { type: "date", required: true })), billFields.length > 1 && /* @__PURE__ */ React.createElement(
    IconButton,
    {
      size: "small",
      "aria-label": "Remove bill",
      onClick: () => remove(i),
      sx: { position: "absolute", top: 4, right: 4, color: "error.main" }
    },
    /* @__PURE__ */ React.createElement(DeleteOutlineIcon, { fontSize: "small" })
  )))), /* @__PURE__ */ React.createElement(Button, { startIcon: /* @__PURE__ */ React.createElement(AddIcon, null), variant: "outlined", color: "inherit", sx: { mt: 1.5, fontWeight: 600 }, onClick: () => append({ ...EMPTY_BILL }) }, "Add Another Bill")), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1 } }, "Attachments"), files.length > 0 && /* @__PURE__ */ React.createElement(Stack, { spacing: 0.5, sx: { mb: 1.5 } }, files.map((f, i) => /* @__PURE__ */ React.createElement(Stack, { key: `${f.name}-${i}`, direction: "row", alignItems: "center", justifyContent: "space-between", sx: { bgcolor: "action.hover", borderRadius: 1.5, pl: 1.5 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", noWrap: true, sx: { maxWidth: "85%" } }, f.name), /* @__PURE__ */ React.createElement(IconButton, { size: "small", "aria-label": "Remove attachment", onClick: () => setFiles((prev) => prev.filter((_, idx) => idx !== i)) }, /* @__PURE__ */ React.createElement(CloseIcon, { fontSize: "small" }))))), /* @__PURE__ */ React.createElement("input", { ref: fileInput, type: "file", hidden: true, multiple: true, accept: ACCEPTED_FILES, onChange: addFiles }), /* @__PURE__ */ React.createElement(Button, { startIcon: /* @__PURE__ */ React.createElement(AddIcon, null), variant: "outlined", color: "inherit", sx: { fontWeight: 600 }, onClick: () => fileInput.current?.click() }, "Add Attachment")))), /* @__PURE__ */ React.createElement(DialogActions, { sx: { px: 3, py: 2 } }, /* @__PURE__ */ React.createElement(Button, { variant: "contained", color: "error", disableElevation: true, onClick: onClose, disabled: busy, sx: { fontWeight: 600 } }, "Cancel"), /* @__PURE__ */ React.createElement(Button, { variant: "contained", disableElevation: true, onClick: submit, disabled: busy, sx: { fontWeight: 600 } }, busy ? uploading ? "Uploading\u2026" : "Submitting\u2026" : "Submit Request")));
}
