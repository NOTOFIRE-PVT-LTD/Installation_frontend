import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPen, faUserPlus, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { ROLES, USER_STATUS, ADMIN_TYPES, ADMIN_TYPE_LABELS, GENDER, APP_ACCESS_OPTIONS, ACCOUNT_LEVEL } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const ACCOUNT_LEVEL_OPTIONS = [
  { value: ACCOUNT_LEVEL.USER, label: 'User (Field Engineer / Salesperson)' },
  { value: ACCOUNT_LEVEL.ADMIN, label: 'Admin' },
  { value: ACCOUNT_LEVEL.SUPER_ADMIN, label: 'Super Admin' },
];

const ROLE_STYLE = {
  [ROLES.ADMIN]: { color: '#7c3aed', bg: '#f3e8ff' },
  [ROLES.USER]: { color: '#0891b2', bg: '#e0f7fa' },
};

function buildSchema(isEdit) {
  return yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: isEdit ? yup.string().notRequired() : yup.string().min(8, 'Must be at least 8 characters').required('Password is required'),
    mobileNumber: yup.string().required('Mobile number is required'),
    gender: yup.string().oneOf([GENDER.MALE, GENDER.FEMALE]).required('Gender is required'),
    accountLevel: yup.string().required('Select User, Admin, or Super Admin'),
    appAccess: yup.string().when('accountLevel', {
      is: ACCOUNT_LEVEL.USER,
      then: (schema) => schema.required('Select an app'),
      otherwise: (schema) => schema.required('Select an app'),
    }),
  });
}

const GENDER_OPTIONS = [
  { value: GENDER.MALE, label: 'Male (10:00–7:00 · 9 hours)' },
  { value: GENDER.FEMALE, label: 'Female (10:00–6:30 · 8:30 hours)' },
];

function DetailRow({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
        p: 1.25,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fafbfc',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          bgcolor: '#FFE8EA',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, mt: 0.15, wordBreak: 'break-word' }}>{value || '—'}</Typography>
      </Box>
    </Box>
  );
}

function accountLevelFromUser(user) {
  if (!user) return ACCOUNT_LEVEL.USER;
  if (user.adminType === ADMIN_TYPES.SUPER_ADMIN) return ACCOUNT_LEVEL.SUPER_ADMIN;
  if (user.appSuperAdmin) return ACCOUNT_LEVEL.SUPER_ADMIN;
  if (user.role === ROLES.ADMIN) return ACCOUNT_LEVEL.ADMIN;
  return ACCOUNT_LEVEL.USER;
}

function appAccessFromUser(user) {
  if (user?.adminType === ADMIN_TYPES.SUPER_ADMIN) return 'ALL';
  if (user?.adminType === ADMIN_TYPES.COMPLAINT_COORDINATOR || user?.permissions?.complaints) return 'complaints';
  if (user?.adminType === ADMIN_TYPES.SALES_COORDINATOR || user?.jobRole === 'SALESPERSON') return 'attendance';
  if (user?.adminType === ADMIN_TYPES.TENDER_COORDINATOR || user?.permissions?.tenders) return 'tenders';
  if (user?.permissions?.projects) return 'projects';
  if (user?.permissions?.billing) return 'billing';
  if (user?.permissions?.accounts) return 'accounts';
  if (user?.permissions?.inspections) return 'inspections';
  if (user?.permissions?.financialDocuments) return 'financialDocuments';
  if (user?.permissions?.atlantaPayments) return 'atlantaPayments';
  return 'complaints';
}

export default function UserFormDrawer({ open, mode = 'create', user, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const readOnly = mode === 'view';
  const { isPlatformOwner, isSuperAdmin, permissions } = useAuth();
  const [imagePreview, setImagePreview] = useState('');

  const methods = useForm({
    resolver: yupResolver(buildSchema(isEdit)),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      mobileNumber: '',
      gender: GENDER.MALE,
      accountLevel: ACCOUNT_LEVEL.USER,
      appAccess: 'COMPLAINTS',
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        mobileNumber: user?.mobileNumber || '',
        gender: user?.gender || GENDER.MALE,
        accountLevel: accountLevelFromUser(user),
        appAccess: user ? appAccessFromUser(user) : 'COMPLAINTS',
      });
      setImagePreview(user?.profileImage?.url || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const accountLevel = methods.watch('accountLevel');

  const adminAppOptions = useMemo(() => {
    const allowed =
      isPlatformOwner || isSuperAdmin
        ? APP_ACCESS_OPTIONS
        : APP_ACCESS_OPTIONS.filter((opt) => permissions?.[opt.value]);
    return allowed.length ? allowed : APP_ACCESS_OPTIONS.filter((opt) => opt.value === 'complaints');
  }, [isPlatformOwner, isSuperAdmin, permissions]);

  useEffect(() => {
    const app = methods.getValues('appAccess');
    if (accountLevel === ACCOUNT_LEVEL.USER && !['COMPLAINTS', 'ATTENDANCE', 'PROJECTS'].includes(app)) {
      methods.setValue('appAccess', 'COMPLAINTS');
      return;
    }
    if (accountLevel === ACCOUNT_LEVEL.USER) return;
    if (accountLevel === ACCOUNT_LEVEL.SUPER_ADMIN && isPlatformOwner && app === 'ALL') return;
    const mapped =
      app === 'ATTENDANCE' ? 'attendance' : app === 'PROJECTS' ? 'projects' : app === 'COMPLAINTS' || app === 'ALL' ? 'complaints' : app;
    const allowed = adminAppOptions.map((opt) => opt.value);
    if (!allowed.includes(mapped)) {
      methods.setValue('appAccess', allowed[0] || 'complaints');
    } else if (mapped !== app) {
      methods.setValue('appAccess', mapped);
    }
  }, [accountLevel, adminAppOptions, isPlatformOwner, methods]);

  const appOptions =
    accountLevel === ACCOUNT_LEVEL.SUPER_ADMIN && isPlatformOwner
      ? [{ value: 'ALL', label: 'All Apps' }, ...APP_ACCESS_OPTIONS]
      : accountLevel === ACCOUNT_LEVEL.USER
        ? [
            { value: 'COMPLAINTS', label: 'Complaint Resolution (Field Engineer)' },
            { value: 'ATTENDANCE', label: 'Attendance System (Field Salesperson)' },
            { value: 'PROJECTS', label: 'Projects & Installation (Site Installer)' },
          ]
        : adminAppOptions;

  const submit = (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('mobileNumber', values.mobileNumber);
    formData.append('gender', values.gender);
    formData.append('accountLevel', values.accountLevel);
    formData.append('appAccess', values.appAccess);
    if (values.accountLevel === ACCOUNT_LEVEL.USER) {
      formData.append('role', ROLES.USER);
      const app = String(values.appAccess || 'COMPLAINTS').toUpperCase();
      formData.append('appAccess', app);
      formData.append('jobRole', app === 'ATTENDANCE' ? 'SALESPERSON' : 'INSTALLER');
    } else {
      formData.append('role', ROLES.ADMIN);
    }
    if (!isEdit) {
      formData.append('email', values.email);
      formData.append('password', values.password);
    }
    onSubmit(formData);
  };

  const titleMap = {
    create: user?.role === ROLES.ADMIN ? 'Add Admin / Coordinator' : 'Add Salesperson / User',
    edit: user?.role === ROLES.ADMIN ? 'Edit Admin / Coordinator' : 'Edit User',
    view: 'User Details',
  };
  const iconMap = { create: faUserPlus, edit: faUserPen, view: faUser };
  const roleStyle = ROLE_STYLE[user?.role] || { color: '#64748b', bg: '#f1f5f9' };
  const isActive = user?.status === USER_STATUS.ACTIVE;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: '-8px 0 32px rgba(31, 42, 68, 0.1)',
        },
      }}
    >
      <Box sx={{ width: { xs: '100vw', sm: 420 }, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: readOnly ? 0 : 1.5,
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
            borderBottom: readOnly ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: readOnly ? 1.5 : 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#f3e8ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                <FontAwesomeIcon icon={iconMap[mode]} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{titleMap[mode]}</Typography>
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ borderRadius: '8px', bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {readOnly && (
            <Stack alignItems="center" spacing={1} sx={{ pb: 2.5, pt: 0.5 }}>
              <Avatar
                src={imagePreview}
                sx={{
                  width: 72,
                  height: 72,
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  bgcolor: '#ede9fe',
                  color: '#7c3aed',
                  border: '3px solid #fff',
                  boxShadow: '0 6px 18px rgba(124, 58, 237, 0.15)',
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{user?.name}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
                  {user?.email}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75}>
                <Chip
                  size="small"
                  label={user?.role || '—'}
                  sx={{ bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 600, border: 'none', height: 22 }}
                />
                <Chip
                  size="small"
                  label={isActive ? 'Active' : 'Inactive'}
                  sx={{
                    bgcolor: isActive ? '#ecfdf5' : '#f1f5f9',
                    color: isActive ? '#059669' : '#64748b',
                    fontWeight: 600,
                    border: 'none',
                    height: 22,
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {readOnly ? (
            <Stack spacing={1}>
              <DetailRow icon={<EmailOutlinedIcon sx={{ fontSize: 15 }} />} label="Email" value={user?.email} />
              <DetailRow icon={<PhoneOutlinedIcon sx={{ fontSize: 15 }} />} label="Mobile" value={user?.mobileNumber} />
              <DetailRow icon={<BadgeOutlinedIcon sx={{ fontSize: 15 }} />} label="Gender" value={user?.gender || '—'} />
              <DetailRow icon={<BadgeOutlinedIcon sx={{ fontSize: 15 }} />} label="Role" value={user?.role} />
              {user?.adminType && (
                <DetailRow
                  icon={<BadgeOutlinedIcon sx={{ fontSize: 15 }} />}
                  label="Admin type"
                  value={ADMIN_TYPE_LABELS[user.adminType] || user.adminType}
                />
              )}
              <DetailRow
                icon={<FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: 13 }} />}
                label="Atlanta Payments"
                value={
                  user?.permissions?.atlantaPayments
                    ? user?.permissions?.atlantaPaymentsOwnOnly
                      ? 'User Flow (Own records only)'
                      : 'Admin Flow (All records)'
                    : 'No Access'
                }
              />
              <DetailRow
                icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />}
                label="Created"
                value={user?.createdAt ? formatDate(user.createdAt) : '—'}
              />
            </Stack>
          ) : (
            <FormProvider {...methods}>
              <Stack component="form" id="user-form" spacing={2} onSubmit={methods.handleSubmit(submit)}>
                <RHFTextField name="name" label="Name" />
                <RHFTextField name="email" label="Email" disabled={isEdit} />
                {!isEdit && <RHFTextField name="password" label="Password" type="password" />}
                <RHFTextField name="mobileNumber" label="Mobile Number" />
                <RHFSelect name="gender" label="Gender" options={GENDER_OPTIONS} />
                <RHFSelect
                  name="accountLevel"
                  label="Access"
                  options={
                    isSuperAdmin
                      ? ACCOUNT_LEVEL_OPTIONS
                      : ACCOUNT_LEVEL_OPTIONS.filter((opt) => opt.value !== ACCOUNT_LEVEL.SUPER_ADMIN)
                  }
                />
                <RHFSelect name="appAccess" label="App" options={appOptions} />
              </Stack>
            </FormProvider>
          )}
        </Box>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafbfc' }}
        >
          <Button onClick={onClose} sx={{ borderRadius: '8px' }}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              form="user-form"
              variant="contained"
              disabled={submitting}
              sx={{ borderRadius: '8px', bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
            >
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
