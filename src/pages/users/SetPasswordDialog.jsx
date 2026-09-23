import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import RHFTextField from "../../components/common/FormFields/RHFTextField";

const schema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm the password"),
});

const AVATAR_COLORS = ["#2f6fed", "#20b486", "#d97706", "#7c3aed", "#0891b2", "#ef4444"];

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function SetPasswordDialog({ open, user, submitting, onClose, onSubmit }) {
  const [showPasswords, setShowPasswords] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (open) {
      methods.reset({ password: "", confirmPassword: "" });
      setShowPasswords(false);
    }
  }, [open, methods]);

  const handleSubmit = (values) => {
    onSubmit(values.password);
  };

  const color = avatarColor(user?.name);

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockResetIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Set New Password
          </Typography>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {user && (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
            <Avatar
              src={user.profileImage?.url}
              sx={{
                width: 38,
                height: 38,
                fontSize: "0.875rem",
                fontWeight: 700,
                bgcolor: `${color}18`,
                color,
                border: `1.5px solid ${color}33`,
              }}
            >
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Stack>
        )}

        <Alert
          severity="warning"
          variant="outlined"
          sx={{ mb: 2.5, fontSize: "0.75rem", py: 0.75, px: 1.5, borderRadius: "8px" }}
        >
          All active sessions for this user will be revoked. They will be notified by email.
        </Alert>

        <FormProvider {...methods}>
          <Stack
            component="form"
            id="set-password-form"
            spacing={2}
            onSubmit={methods.handleSubmit(handleSubmit)}
          >
            <RHFTextField
              name="password"
              label="New Password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
            />
            <RHFTextField
              name="confirmPassword"
              label="Confirm Password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
            />
            <Button
              variant="text"
              size="small"
              onClick={() => setShowPasswords((v) => !v)}
              sx={{ alignSelf: "flex-start", fontSize: "0.75rem", textTransform: "none", p: 0 }}
            >
              {showPasswords ? "Hide" : "Show"} passwords
            </Button>
          </Stack>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="set-password-form"
          variant="contained"
          disabled={submitting}
          sx={{
            bgcolor: "#7c3aed",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            "&:hover": { bgcolor: "#6d28d9" },
          }}
        >
          {submitting ? "Saving..." : "Set Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
