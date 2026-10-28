import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserPen, faUserPlus, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import RHFTextField from "../../components/common/FormFields/RHFTextField";
import RHFSelect from "../../components/common/FormFields/RHFSelect";
import { ROLES, USER_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.USER, label: "User (Installer)" }
];
const ROLE_STYLE = {
  [ROLES.ADMIN]: { color: "#7c3aed", bg: "#f3e8ff" },
  [ROLES.USER]: { color: "#0891b2", bg: "#e0f7fa" }
};
function buildSchema(isEdit) {
  return yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    password: isEdit ? yup.string().notRequired() : yup.string().min(8, "Must be at least 8 characters").required("Password is required"),
    mobileNumber: yup.string().required("Mobile number is required"),
    role: yup.string().required("Role is required")
  });
}
function DetailRow({ icon, label, value }) {
  return /* @__PURE__ */ React.createElement(
    Box,
    {
      sx: {
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.25,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#fafbfc"
      }
    },
    /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          width: 28,
          height: 28,
          borderRadius: "7px",
          bgcolor: "#eaf2ff",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      },
      icon
    ),
    /* @__PURE__ */ React.createElement(Box, { sx: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.625rem", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em" } }, label), /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.8125rem", fontWeight: 600, mt: 0.15, wordBreak: "break-word" } }, value || "\u2014"))
  );
}
export default function UserFormDrawer({ open, mode = "create", user, onClose, onSubmit, submitting }) {
  const isEdit = mode === "edit";
  const readOnly = mode === "view";
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [atlantaAccess, setAtlantaAccess] = useState("none");
  const [payflowAccess, setPayflowAccess] = useState("none");
  const methods = useForm({
    resolver: yupResolver(buildSchema(isEdit)),
    defaultValues: { name: "", email: "", password: "", mobileNumber: "", role: ROLES.USER }
  });
  useEffect(() => {
    if (open) {
      methods.reset({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        mobileNumber: user?.mobileNumber || "",
        role: user?.role || ROLES.USER
      });
      setImagePreview(user?.profileImage?.url || "");
      setImageFile(null);
      if (user?.permissions?.atlantaPayments) {
        setAtlantaAccess(user?.permissions?.atlantaPaymentsOwnOnly ? "own" : "all");
      } else {
        setAtlantaAccess("none");
      }
      setPayflowAccess(user?.permissions?.payflowUser ? "user" : "none");
    }
  }, [open, user]);
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const submit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("mobileNumber", values.mobileNumber);
    formData.append("role", values.role);
    if (!isEdit) {
      formData.append("email", values.email);
      formData.append("password", values.password);
    }
    if (imageFile) formData.append("profileImage", imageFile);
    const perms = {};
    if (atlantaAccess !== "none") {
      perms.atlantaPayments = true;
      perms.atlantaPaymentsOwnOnly = atlantaAccess === "own";
    } else if (isEdit) {
      perms.atlantaPayments = false;
      perms.atlantaPaymentsOwnOnly = false;
    }
    if (values.role === ROLES.USER && payflowAccess === "user") {
      perms.payflowUser = true;
    } else if (isEdit) {
      perms.payflowUser = false;
    }
    if (Object.keys(perms).length) formData.append("permissions", JSON.stringify(perms));
    onSubmit(formData);
  };
  const titleMap = { create: "Add User", edit: "Edit User", view: "User Details" };
  const iconMap = { create: faUserPlus, edit: faUserPen, view: faUser };
  const roleStyle = ROLE_STYLE[user?.role] || { color: "#64748b", bg: "#f1f5f9" };
  const isActive = user?.status === USER_STATUS.ACTIVE;
  return /* @__PURE__ */ React.createElement(
    Drawer,
    {
      anchor: "right",
      open,
      onClose,
      PaperProps: {
        sx: {
          borderRadius: 0,
          boxShadow: "-8px 0 32px rgba(31, 42, 68, 0.1)"
        }
      }
    },
    /* @__PURE__ */ React.createElement(Box, { sx: { width: { xs: "100vw", sm: 420 }, display: "flex", flexDirection: "column", height: "100%", bgcolor: "#fff" } }, /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          px: 2,
          pt: 2,
          pb: readOnly ? 0 : 1.5,
          background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)",
          borderBottom: readOnly ? "none" : "1px solid",
          borderColor: "divider"
        }
      },
      /* @__PURE__ */ React.createElement(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", sx: { mb: readOnly ? 1.5 : 0 } }, /* @__PURE__ */ React.createElement(Stack, { direction: "row", spacing: 1, alignItems: "center" }, /* @__PURE__ */ React.createElement(
        Box,
        {
          sx: {
            width: 28,
            height: 28,
            borderRadius: "8px",
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12
          }
        },
        /* @__PURE__ */ React.createElement(FontAwesomeIcon, { icon: iconMap[mode] })
      ), /* @__PURE__ */ React.createElement(Typography, { sx: { fontWeight: 700, fontSize: "0.9375rem" } }, titleMap[mode])), /* @__PURE__ */ React.createElement(
        IconButton,
        {
          onClick: onClose,
          size: "small",
          sx: { borderRadius: "8px", bgcolor: "#fff", border: "1px solid", borderColor: "divider" }
        },
        /* @__PURE__ */ React.createElement(CloseIcon, { fontSize: "small" })
      )),
      readOnly && /* @__PURE__ */ React.createElement(Stack, { alignItems: "center", spacing: 1, sx: { pb: 2.5, pt: 0.5 } }, /* @__PURE__ */ React.createElement(
        Avatar,
        {
          src: imagePreview,
          sx: {
            width: 72,
            height: 72,
            fontWeight: 700,
            fontSize: "1.5rem",
            bgcolor: "#ede9fe",
            color: "#7c3aed",
            border: "3px solid #fff",
            boxShadow: "0 6px 18px rgba(124, 58, 237, 0.15)"
          }
        },
        user?.name?.[0]?.toUpperCase()
      ), /* @__PURE__ */ React.createElement(Box, { sx: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(Typography, { sx: { fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 } }, user?.name), /* @__PURE__ */ React.createElement(Typography, { color: "text.secondary", sx: { fontSize: "0.75rem", mt: 0.25 } }, user?.email)), /* @__PURE__ */ React.createElement(Stack, { direction: "row", spacing: 0.75 }, /* @__PURE__ */ React.createElement(
        Chip,
        {
          size: "small",
          label: user?.role || "\u2014",
          sx: { bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 600, border: "none", height: 22 }
        }
      ), /* @__PURE__ */ React.createElement(
        Chip,
        {
          size: "small",
          label: isActive ? "Active" : "Inactive",
          sx: {
            bgcolor: isActive ? "#ecfdf5" : "#f1f5f9",
            color: isActive ? "#059669" : "#64748b",
            fontWeight: 600,
            border: "none",
            height: 22
          }
        }
      )))
    ), /* @__PURE__ */ React.createElement(Box, { sx: { flex: 1, overflowY: "auto", p: 2 } }, readOnly ? /* @__PURE__ */ React.createElement(Stack, { spacing: 1 }, /* @__PURE__ */ React.createElement(DetailRow, { icon: /* @__PURE__ */ React.createElement(EmailOutlinedIcon, { sx: { fontSize: 15 } }), label: "Email", value: user?.email }), /* @__PURE__ */ React.createElement(DetailRow, { icon: /* @__PURE__ */ React.createElement(PhoneOutlinedIcon, { sx: { fontSize: 15 } }), label: "Mobile", value: user?.mobileNumber }), /* @__PURE__ */ React.createElement(DetailRow, { icon: /* @__PURE__ */ React.createElement(BadgeOutlinedIcon, { sx: { fontSize: 15 } }), label: "Role", value: user?.role }), /* @__PURE__ */ React.createElement(
      DetailRow,
      {
        icon: /* @__PURE__ */ React.createElement(FontAwesomeIcon, { icon: faMoneyBillWave, style: { fontSize: 13 } }),
        label: "Atlanta Payments",
        value: user?.permissions?.atlantaPayments ? user?.permissions?.atlantaPaymentsOwnOnly ? "User Flow (Own records only)" : "Admin Flow (All records)" : "No Access"
      }
    ), /* @__PURE__ */ React.createElement(
      DetailRow,
      {
        icon: /* @__PURE__ */ React.createElement(FontAwesomeIcon, { icon: faMoneyBillWave, style: { fontSize: 13 } }),
        label: "Payflow",
        value: user?.permissions?.payflowUser ? "Payflow User (Own requests)" : "No Access"
      }
    ), /* @__PURE__ */ React.createElement(
      DetailRow,
      {
        icon: /* @__PURE__ */ React.createElement(CalendarMonthOutlinedIcon, { sx: { fontSize: 15 } }),
        label: "Created",
        value: user?.createdAt ? formatDate(user.createdAt) : "\u2014"
      }
    )) : /* @__PURE__ */ React.createElement(FormProvider, { ...methods }, /* @__PURE__ */ React.createElement(Stack, { component: "form", id: "user-form", spacing: 2, onSubmit: methods.handleSubmit(submit) }, /* @__PURE__ */ React.createElement(Stack, { direction: "row", spacing: 1.5, alignItems: "center" }, /* @__PURE__ */ React.createElement(
      Avatar,
      {
        src: imagePreview,
        sx: {
          width: 56,
          height: 56,
          bgcolor: "#ede9fe",
          color: "#7c3aed",
          fontWeight: 700,
          border: "2px solid #f3e8ff"
        }
      },
      (methods.watch("name") || "U")[0]?.toUpperCase()
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        component: "label",
        variant: "outlined",
        size: "small",
        sx: { borderRadius: "8px", borderColor: "divider", color: "text.primary" }
      },
      "Upload Photo",
      /* @__PURE__ */ React.createElement("input", { type: "file", hidden: true, accept: "image/jpeg,image/png,image/webp", onChange: handleImageChange })
    )), /* @__PURE__ */ React.createElement(RHFTextField, { name: "name", label: "Name" }), /* @__PURE__ */ React.createElement(RHFTextField, { name: "email", label: "Email", disabled: isEdit }), !isEdit && /* @__PURE__ */ React.createElement(RHFTextField, { name: "password", label: "Password", type: "password" }), /* @__PURE__ */ React.createElement(RHFTextField, { name: "mobileNumber", label: "Mobile Number" }), /* @__PURE__ */ React.createElement(RHFSelect, { name: "role", label: "Role", options: ROLE_OPTIONS }), /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          p: 1.75,
          borderRadius: "10px",
          bgcolor: "#fbfbfe",
          border: "1px solid",
          borderColor: "#e9e8f4"
        }
      },
      /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", mb: 0.35 } }, "Atlanta Payments Access"),
      /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.725rem", color: "text.secondary", mb: 1.25 } }, "Configure whether this user can view Atlanta Payments records."),
      /* @__PURE__ */ React.createElement(FormControl, { fullWidth: true, size: "small" }, /* @__PURE__ */ React.createElement(
        Select,
        {
          value: atlantaAccess,
          onChange: (e) => setAtlantaAccess(e.target.value),
          sx: { bgcolor: "#fff", fontSize: "0.8125rem", borderRadius: "8px" }
        },
        /* @__PURE__ */ React.createElement(MenuItem, { value: "none", sx: { fontSize: "0.8125rem" } }, "No Access"),
        /* @__PURE__ */ React.createElement(MenuItem, { value: "own", sx: { fontSize: "0.8125rem" } }, "User Flow (Own Records Only)"),
        /* @__PURE__ */ React.createElement(MenuItem, { value: "all", sx: { fontSize: "0.8125rem" } }, "Admin Flow (All Records)")
      ))
    ), methods.watch("role") === ROLES.USER && /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          p: 1.75,
          borderRadius: "10px",
          bgcolor: "#fbfbfe",
          border: "1px solid",
          borderColor: "#e9e8f4"
        }
      },
      /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", mb: 0.35 } }, "Payflow Access"),
      /* @__PURE__ */ React.createElement(Typography, { sx: { fontSize: "0.725rem", color: "text.secondary", mb: 1.25 } }, "Payflow users can submit payment requests and see only their own. Admins see all requests."),
      /* @__PURE__ */ React.createElement(FormControl, { fullWidth: true, size: "small" }, /* @__PURE__ */ React.createElement(
        Select,
        {
          value: payflowAccess,
          onChange: (e) => setPayflowAccess(e.target.value),
          sx: { bgcolor: "#fff", fontSize: "0.8125rem", borderRadius: "8px" }
        },
        /* @__PURE__ */ React.createElement(MenuItem, { value: "none", sx: { fontSize: "0.8125rem" } }, "No Access"),
        /* @__PURE__ */ React.createElement(MenuItem, { value: "user", sx: { fontSize: "0.8125rem" } }, "Payflow User (Submit & view own requests)")
      ))
    )))), /* @__PURE__ */ React.createElement(
      Stack,
      {
        direction: "row",
        justifyContent: "flex-end",
        spacing: 1,
        sx: { p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fafbfc" }
      },
      /* @__PURE__ */ React.createElement(Button, { onClick: onClose, sx: { borderRadius: "8px" } }, readOnly ? "Close" : "Cancel"),
      !readOnly && /* @__PURE__ */ React.createElement(
        Button,
        {
          type: "submit",
          form: "user-form",
          variant: "contained",
          disabled: submitting,
          sx: { borderRadius: "8px", bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }
        },
        submitting ? "Saving\u2026" : "Save"
      )
    ))
  );
}
