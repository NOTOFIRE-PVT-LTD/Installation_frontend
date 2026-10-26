import { useEffect, useState } from 'react';
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
import { ROLES, USER_STATUS, ADMIN_TYPES, ADMIN_TYPE_LABELS, GENDER } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.USER, label: 'User (Installer)' },
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
    role: yup.string().required('Role is required'),
    adminType: yup.string().when('role', {
      is: ROLES.ADMIN,
      then: (schema) => (isEdit ? schema.notRequired() : schema.required('Admin type is required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
}

const GENDER_OPTIONS = [
  { value: GENDER.MALE, label: 'Male (10:00–7:00 · 9 hours)' },
  { value: GENDER.FEMALE, label: 'Female (10:00–6:30 · 8:30 hours)' },
];

const ADMIN_TYPE_OPTIONS = [
  { value: ADMIN_TYPES.SALES_COORDINATOR, label: ADMIN_TYPE_LABELS.SALES_COORDINATOR },
  { value: ADMIN_TYPES.TENDER_COORDINATOR, label: ADMIN_TYPE_LABELS.TENDER_COORDINATOR },
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

export default function UserFormDrawer({ open, mode = 'create', user, onClose, onSubmit, submitting }) {
  const isEdit = mode === 'edit';
  const readOnly = mode === 'view';
  const [imagePreview, setImagePreview] = useState('');

  const methods = useForm({
    resolver: yupResolver(buildSchema(isEdit)),
    defaultValues: { name: '', email: '', password: '', mobileNumber: '', gender: GENDER.MALE, role: ROLES.USER, adminType: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        mobileNumber: user?.mobileNumber || '',
        gender: user?.gender || GENDER.MALE,
        role: user?.role || ROLES.USER,
        adminType:
          user?.adminType && user.adminType !== ADMIN_TYPES.SUPER_ADMIN
            ? user.adminType
            : '',
      });
      setImagePreview(user?.profileImage?.url || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const submit = (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('mobileNumber', values.mobileNumber);
    formData.append('gender', values.gender);
    formData.append('role', values.role);
    if (values.role === ROLES.ADMIN && values.adminType) formData.append('adminType', values.adminType);
    if (!isEdit) {
      formData.append('email', values.email);
      formData.append('password', values.password);
    }
    onSubmit(formData);
  };

  const titleMap = { create: 'Add User', edit: 'Edit User', view: 'User Details' };
  const iconMap = { create: faUserPlus, edit: faUserPen, view: faUser };
  const roleStyle = ROLE_STYLE[user?.role] || { color: '#64748b', bg: '#f1f5f9' };
  const isActive = user?.status === USER_STATUS.ACTIVE;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
            background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)',
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
                <RHFSelect name="role" label="Role" options={ROLE_OPTIONS} />
                {methods.watch('role') === ROLES.ADMIN && user?.adminType !== ADMIN_TYPES.SUPER_ADMIN && (
                  <RHFSelect name="adminType" label="Admin type" options={ADMIN_TYPE_OPTIONS} />
                )}
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
