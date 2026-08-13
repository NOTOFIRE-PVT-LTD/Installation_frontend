import { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import SegmentedCodeField from '../../components/common/FormFields/SegmentedCodeField';
import SegmentedDateField from '../../components/common/FormFields/SegmentedDateField';
import CheckboxBooleanField from '../../components/common/FormFields/CheckboxBooleanField';
import { downloadBgApplicationPdf } from '../../utils/bgApplicationExport';
import { HDFC_LOGO_BASE64 } from '../../assets/hdfcLogoBase64';

const APPLICATION_TYPES = ['Fresh Issuance', 'Amendment'];
const BG_NATURES = ['Financial Guarantee', 'Performance Guarantee', 'Deferred Payment Guarantee', 'Advance Payment Guarantee', 'Others'];
const BG_TYPE_OPTIONS = ['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'];

// Fixed prefill profiles for the 3 known applicants, sourced from "Bank Application form
// Data.xlsx" — selecting one fills every field the sheet provides across the form.
const APPLICANT_PROFILES = [
  {
    name: 'NotoFire Private Limited',
    accountNumber: '50200112805161',
    branchCode: '0657',
    address: 'C-146,Ground Floor, Block-C,Sector 63 Noida,Gautam Buddha Nagar -201301,Uttar Pradesh',
    pan: 'AAGCN7119L',
    contactPerson: 'Monika Jain',
    mobile: '9821003730',
    email: 'Atlantatelecables@gmail.com',
    registeredAddress: 'C-146,Ground Floor, Block-C,Sector 63 Noida,Gautam Buddha Nagar -201301,Uttar Pradesh',
    purpose: 'Bank Guarantee (for work)',
    amount: 100000,
    amountWords: 'One Lakh Only',
    tenorMonths: 12,
    beneficiaryNameAddress: 'DRM Office, First Floor Bhusawal-425201 SR.DFM',
    beneficiaryBankName: 'abcd',
    beneficiaryBankAddress: 'c-146,noida',
    beneficiaryBankIfscSwift: 'SBIN00DGSND',
    claimDebitAccountNumber: '502001280561',
    marginFdAmount: 15000,
    declarationDate: '2026-08-05',
    documents: 'Contract/Ageement Copy, Bank Guarantee Text',
  },
  {
    name: 'Atlanta Tele Cables Limited',
    accountNumber: '50200113744761',
    branchCode: '0657',
    address: 'Ground Floor, Plot no.22, Block B, Sector 65 Noida,Guatam Buddha Nagar-201301,Uttar Pradesh',
    pan: 'ABACA5373L',
    contactPerson: 'Tarun Jain',
    mobile: '9821003722',
    email: 'Atlantatelecables@gmail.com',
    registeredAddress: 'Ground Floor, Plot no.22, Block B, Sector 65 Noida,Guatam Buddha Nagar-201301,Uttar Pradesh',
    purpose: 'Performance Bank Guarantee (for Work)',
    amount: 100000,
    amountWords: 'One Lakh Only',
    tenorMonths: 12,
    beneficiaryNameAddress: 'DRM Office, First Floor Bhusawal-425201 SR.DFM',
    beneficiaryBankName: 'abcd',
    beneficiaryBankAddress: 'c-146,noida',
    beneficiaryBankIfscSwift: 'SBIN00DGSND',
    claimDebitAccountNumber: '502001280561',
    marginFdAmount: 15000,
    declarationDate: '2026-08-05',
    documents: 'Contract/Ageement Copy, Bank Guarantee Text',
  },
  {
    name: 'Atlanta Tele Cables',
    accountNumber: '50200083982982',
    branchCode: '7004',
    address: 'Sunehra Road, 987/2 Salempur Indl Area,Rajputana Pargana, Near Eid Ghah Chowk,Roorkee, Haridwar, Uttarakhand, 247667',
    pan: 'ACXPJ4171A',
    contactPerson: 'Gurav Jain',
    mobile: '9999991525',
    email: 'Atlantatelecables@gmail.com',
    registeredAddress: 'Sunehra Road, 987/2 Salempur Indl Area,Rajputana Pargana, Near Eid Ghah Chowk,Roorkee, Haridwar, Uttarakhand, 247667',
    purpose: '',
    amount: 100000,
    amountWords: 'One Lakh Only',
    tenorMonths: 12,
    beneficiaryNameAddress: 'DRM Office, First Floor Bhusawal-425201 SR.DFM',
    beneficiaryBankName: 'abcd',
    beneficiaryBankAddress: 'c-146,noida',
    beneficiaryBankIfscSwift: 'SBIN00DGSND',
    claimDebitAccountNumber: '502001280561',
    marginFdAmount: 15000,
    declarationDate: '2026-08-05',
    documents: 'Contract/Ageement Copy, Bank Guarantee Text',
  },
];

function CheckboxSingleSelect({ name, options, control, disabled, columns }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box
          sx={
            columns
              ? {
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, minmax(0, max-content))`,
                  columnGap: 4,
                  rowGap: 1.25,
                  justifyContent: 'start',
                }
              : undefined
          }
        >
          {columns ? (
            options.map((option) => {
              const checked = field.value === option;
              return (
                <Stack
                  key={option}
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  onClick={() => !disabled && field.onChange(checked ? '' : option)}
                  sx={{ cursor: disabled ? 'default' : 'pointer', width: 'fit-content' }}
                >
                  {checked ? (
                    <CheckBoxIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" color={disabled ? 'disabled' : 'action'} />
                  )}
                  <Typography variant="body2">{option}</Typography>
                </Stack>
              );
            })
          ) : (
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap rowGap={1}>
              {options.map((option) => {
                const checked = field.value === option;
                return (
                  <Stack
                    key={option}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    onClick={() => !disabled && field.onChange(checked ? '' : option)}
                    sx={{ cursor: disabled ? 'default' : 'pointer' }}
                  >
                    {checked ? (
                      <CheckBoxIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
                    ) : (
                      <CheckBoxOutlineBlankIcon fontSize="small" color={disabled ? 'disabled' : 'action'} />
                    )}
                    <Typography variant="body2">{option}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    />
  );
}

// A single checkbox bound to one value of a shared field — used where options must stack
// vertically (Type of Application) instead of CheckboxSingleSelect's side-by-side row.
function RadioCheckboxOption({ name, value, label, control, disabled }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const checked = field.value === value;
        return (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={() => !disabled && field.onChange(checked ? '' : value)}
            sx={{ cursor: disabled ? 'default' : 'pointer', width: 'fit-content' }}
          >
            {checked ? (
              <CheckBoxIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
            ) : (
              <CheckBoxOutlineBlankIcon fontSize="small" color={disabled ? 'disabled' : 'action'} />
            )}
            <Typography variant="body2">{label}</Typography>
          </Stack>
        );
      }}
    />
  );
}

function BoxedSection({ title, number, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 0, borderWidth: 1.5, borderColor: 'text.primary' }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
        {number ? `${number}. ${title}` : title}
      </Typography>
      {children}
    </Paper>
  );
}

// yup's number schema transforms a blank string to NaN, which then fails typeError() even
// though the field is notRequired() — treat blank input as 0 instead of failing validation.
function optionalNumber() {
  return yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null || originalValue === undefined ? 0 : value))
    .typeError('Must be a number')
    .min(0)
    .notRequired();
}

const schema = yup.object({
  accountNumber: yup.string().notRequired(),
  branchCode: yup.string().notRequired(),
  branchName: yup.string().notRequired(),
  typeOfApplication: yup.string().notRequired(),
  amendmentExistingGuaranteeNumber: yup.string().notRequired(),
  applicantNameAddress: yup.string().required('Applicant name & address is required'),
  applicantContactPersonMobile: yup.string().notRequired(),
  applicantPan: yup.string().notRequired(),
  applicantDateOfIncorporation: yup.string().nullable().notRequired(),
  applicantLeiCode: yup.string().notRequired(),
  applicantEmail: yup.string().email('Enter a valid email').notRequired(),
  applicantRegisteredAddress: yup.string().notRequired(),
  natureOfBankGuarantee: yup.string().notRequired(),
  typeOfBG: yup.string().notRequired(),
  purpose: yup.string().notRequired(),
  bgAmountFigures: yup.string().notRequired(),
  bgAmountWords: yup.string().notRequired(),
  expiryDate: yup.string().nullable().notRequired(),
  claimExpiryDate: yup.string().nullable().notRequired(),
  bgTenorMonths: optionalNumber(),
  bgTenorDays: optionalNumber(),
  beneficiaryNameAddress: yup.string().required('Beneficiary name & address is required'),
  beneficiaryContactPersonMobile: yup.string().notRequired(),
  beneficiaryEmail: yup.string().email('Enter a valid email').notRequired(),
  beneficiaryGstNumber: yup.string().notRequired(),
  beneficiaryPan: yup.string().notRequired(),
  beneficiaryDateOfIncorporation: yup.string().nullable().notRequired(),
  beneficiaryLeiCode: yup.string().notRequired(),
  beneficiaryBankNameAddress: yup.string().notRequired(),
  beneficiaryBankIfscSwift: yup.string().notRequired(),
  advisingBankNameAddress: yup.string().notRequired(),
  advisingBankIfscSwift: yup.string().notRequired(),
  marginFdNo: yup.string().notRequired(),
  marginFdAmount: optionalNumber(),
  marginOther: yup.string().notRequired(),
  marginNewFdDebitAccount: yup.string().notRequired(),
  marginNewFdAmount: optionalNumber(),
  claimDebitAccountNumber: yup.string().notRequired(),
  delayedPaymentInterestPercent: optionalNumber().max(100),
  declarationDate: yup.string().nullable().notRequired(),
  documentsContractAgreementCopy: yup.boolean().notRequired(),
  documentsBankGuaranteeText: yup.boolean().notRequired(),
  documentsCounterGuarantee: yup.boolean().notRequired(),
  documentsOther: yup.boolean().notRequired(),
  otherDocumentsSpecify: yup.string().notRequired(),
});

const defaultValues = {
  accountNumber: '',
  branchCode: '',
  branchName: '',
  typeOfApplication: '',
  amendmentExistingGuaranteeNumber: '',
  applicantNameAddress: '',
  applicantContactPersonMobile: '',
  applicantPan: '',
  applicantDateOfIncorporation: null,
  applicantLeiCode: '',
  applicantEmail: '',
  applicantRegisteredAddress: '',
  natureOfBankGuarantee: '',
  typeOfBG: '',
  purpose: '',
  bgAmountFigures: '',
  bgAmountWords: '',
  expiryDate: null,
  claimExpiryDate: null,
  bgTenorMonths: '',
  bgTenorDays: '',
  beneficiaryNameAddress: '',
  beneficiaryContactPersonMobile: '',
  beneficiaryEmail: '',
  beneficiaryGstNumber: '',
  beneficiaryPan: '',
  beneficiaryDateOfIncorporation: null,
  beneficiaryLeiCode: '',
  beneficiaryBankNameAddress: '',
  beneficiaryBankIfscSwift: '',
  advisingBankNameAddress: '',
  advisingBankIfscSwift: '',
  marginFdNo: '',
  marginFdAmount: '',
  marginOther: '',
  marginNewFdDebitAccount: '',
  marginNewFdAmount: '',
  claimDebitAccountNumber: '',
  delayedPaymentInterestPercent: '',
  declarationDate: null,
  documentsContractAgreementCopy: false,
  documentsBankGuaranteeText: false,
  documentsCounterGuarantee: false,
  documentsOther: false,
  otherDocumentsSpecify: '',
};

const DATE_FIELDS = ['applicantDateOfIncorporation', 'beneficiaryDateOfIncorporation', 'expiryDate', 'claimExpiryDate', 'declarationDate'];

export default function BgApplicationDrawer({ open, mode = 'create', application, onClose, onSubmit, submitting }) {
  const readOnly = mode === 'view';
  const isEdit = mode === 'edit';

  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const [profileName, setProfileName] = useState('');

  const handleProfileChange = (name) => {
    setProfileName(name);
    const profile = APPLICANT_PROFILES.find((p) => p.name === name);
    if (!profile) return;

    const set = (field, value) => methods.setValue(field, value, { shouldDirty: true });

    set('accountNumber', profile.accountNumber);
    set('branchCode', profile.branchCode);
    set('applicantNameAddress', `${profile.name}\n${profile.address}`);
    set('applicantPan', profile.pan);
    set('applicantContactPersonMobile', `${profile.contactPerson} / ${profile.mobile}`);
    set('applicantEmail', profile.email);
    set('applicantRegisteredAddress', profile.registeredAddress);
    set('purpose', profile.purpose);
    set('bgAmountFigures', `Rs. ${Number(profile.amount).toLocaleString('en-IN')}`);
    set('bgAmountWords', profile.amountWords);
    set('bgTenorMonths', profile.tenorMonths);
    set('beneficiaryNameAddress', profile.beneficiaryNameAddress);
    set('beneficiaryBankNameAddress', `${profile.beneficiaryBankName}\n${profile.beneficiaryBankAddress}`);
    set('beneficiaryBankIfscSwift', profile.beneficiaryBankIfscSwift);
    set('claimDebitAccountNumber', profile.claimDebitAccountNumber);
    set('marginFdAmount', profile.marginFdAmount);
    set('declarationDate', profile.declarationDate);

    const documents = (profile.documents || '').toLowerCase();
    set('documentsContractAgreementCopy', documents.includes('contract'));
    set('documentsBankGuaranteeText', documents.includes('bank guarantee text'));
    set('documentsCounterGuarantee', documents.includes('counter guarantee'));
  };

  useEffect(() => {
    if (!open) return;
    setProfileName('');
    if (application) {
      methods.reset({
        accountNumber: application.accountNumber || '',
        branchCode: application.branchCode || '',
        branchName: application.branchName || '',
        typeOfApplication: application.typeOfApplication || '',
        amendmentExistingGuaranteeNumber: application.amendmentExistingGuaranteeNumber || '',
        applicantNameAddress: application.applicantNameAddress || '',
        applicantContactPersonMobile: application.applicantContactPersonMobile || '',
        applicantPan: application.applicantPan || '',
        applicantDateOfIncorporation: application.applicantDateOfIncorporation?.slice(0, 10) || null,
        applicantLeiCode: application.applicantLeiCode || '',
        applicantEmail: application.applicantEmail || '',
        applicantRegisteredAddress: application.applicantRegisteredAddress || '',
        natureOfBankGuarantee: application.natureOfBankGuarantee || '',
        typeOfBG: application.typeOfBG || '',
        purpose: application.purpose || '',
        bgAmountFigures: application.bgAmountFigures || '',
        bgAmountWords: application.bgAmountWords || '',
        expiryDate: application.expiryDate?.slice(0, 10) || null,
        claimExpiryDate: application.claimExpiryDate?.slice(0, 10) || null,
        bgTenorMonths: application.bgTenorMonths ?? '',
        bgTenorDays: application.bgTenorDays ?? '',
        beneficiaryNameAddress: application.beneficiaryNameAddress || '',
        beneficiaryContactPersonMobile: application.beneficiaryContactPersonMobile || '',
        beneficiaryEmail: application.beneficiaryEmail || '',
        beneficiaryGstNumber: application.beneficiaryGstNumber || '',
        beneficiaryPan: application.beneficiaryPan || '',
        beneficiaryDateOfIncorporation: application.beneficiaryDateOfIncorporation?.slice(0, 10) || null,
        beneficiaryLeiCode: application.beneficiaryLeiCode || '',
        beneficiaryBankNameAddress: application.beneficiaryBankNameAddress || '',
        beneficiaryBankIfscSwift: application.beneficiaryBankIfscSwift || '',
        advisingBankNameAddress: application.advisingBankNameAddress || '',
        advisingBankIfscSwift: application.advisingBankIfscSwift || '',
        marginFdNo: application.marginFdNo || '',
        marginFdAmount: application.marginFdAmount ?? '',
        marginOther: application.marginOther || '',
        marginNewFdDebitAccount: application.marginNewFdDebitAccount || '',
        marginNewFdAmount: application.marginNewFdAmount ?? '',
        claimDebitAccountNumber: application.claimDebitAccountNumber || '',
        delayedPaymentInterestPercent: application.delayedPaymentInterestPercent ?? '',
        declarationDate: application.declarationDate?.slice(0, 10) || null,
        documentsContractAgreementCopy: Boolean(application.documentsContractAgreementCopy),
        documentsBankGuaranteeText: Boolean(application.documentsBankGuaranteeText),
        documentsCounterGuarantee: Boolean(application.documentsCounterGuarantee),
        documentsOther: Boolean(application.documentsOther),
        otherDocumentsSpecify: application.otherDocumentsSpecify || '',
      });
    } else {
      methods.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, application]);

  const submit = (values) => {
    const payload = { ...values };
    DATE_FIELDS.forEach((field) => {
      if (!payload[field]) delete payload[field];
    });
    onSubmit(payload);
  };

  const titleMap = { create: 'Add BG Application', edit: 'Edit BG Application', view: 'BG Application Details' };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 720, md: 820 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {titleMap[mode]}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <Stack component="form" id="bg-application-form" onSubmit={methods.handleSubmit(submit)}>
              <Box component="img" src={HDFC_LOGO_BASE64} alt="HDFC Bank" sx={{ height: 32, mb: 2, alignSelf: 'flex-start' }} />
              <Typography variant="h6" fontWeight={800} textAlign="center" sx={{ mb: 2.5 }}>
                APPLICATION FOR BANK GUARANTEE
              </Typography>

              {!readOnly && (
                <TextField
                  select
                  label="Prefill Applicant Details"
                  value={profileName}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  helperText="Select a saved applicant to auto-fill the applicant, beneficiary, amount, and document details from the standard template"
                  sx={{ mb: 2.5 }}
                  fullWidth
                >
                  <MenuItem value="">
                    <em>— Select —</em>
                  </MenuItem>
                  {APPLICANT_PROFILES.map((profile) => (
                    <MenuItem key={profile.name} value={profile.name}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <Box sx={{ mb: 2.5 }}>
                <SegmentedCodeField name="accountNumber" label="Account number" boxes={14} disabled={readOnly} />
              </Box>
              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <SegmentedCodeField name="branchCode" label="Branch Code" boxes={5} disabled={readOnly} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="branchName" label="Branch Name" disabled={readOnly} />
                </Grid>
              </Grid>

              <BoxedSection number={1} title="Type of Application">
                <Stack spacing={3}>
                  <RadioCheckboxOption
                    name="typeOfApplication"
                    value="Fresh Issuance"
                    label="Fresh Issuance"
                    control={methods.control}
                    disabled={readOnly}
                  />
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap rowGap={1.5}>
                    <RadioCheckboxOption
                      name="typeOfApplication"
                      value="Amendment"
                      label="Amendment (Existing Guarantee Number)"
                      control={methods.control}
                      disabled={readOnly}
                    />
                    <SegmentedCodeField name="amendmentExistingGuaranteeNumber" boxes={15} disabled={readOnly} />
                  </Stack>
                </Stack>
              </BoxedSection>

              <BoxedSection number={2} title="Applicant Details">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="applicantNameAddress" label="Name & Address" multiline minRows={3} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="applicantContactPersonMobile" label="Contact Person Name & Mobile No." multiline minRows={3} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="applicantPan" label="PAN No" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SegmentedDateField name="applicantDateOfIncorporation" label="Date of Incorporation" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="applicantLeiCode" label="LEI Code" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="applicantEmail" label="Email ID" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="applicantRegisteredAddress" label="Registered Address" multiline minRows={2} disabled={readOnly} />
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection number={3} title="Nature of Bank Guarantee">
                <CheckboxSingleSelect
                  name="natureOfBankGuarantee"
                  options={BG_NATURES}
                  control={methods.control}
                  disabled={readOnly}
                  columns={3}
                />
              </BoxedSection>

              <BoxedSection number={4} title="Type of BG">
                <CheckboxSingleSelect
                  name="typeOfBG"
                  options={BG_TYPE_OPTIONS}
                  control={methods.control}
                  disabled={readOnly}
                  columns={4}
                />
              </BoxedSection>

              <BoxedSection number={5} title="Details of Bank Guarantee">
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Typography variant="body2" sx={{ minWidth: 100, flexShrink: 0, pt: 1 }}>
                        Purpose
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <RHFTextField name="purpose" multiline minRows={2} disabled={readOnly} />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 100, flexShrink: 0 }}>
                        Amount (Rs/FCY) in figures & in words
                      </Typography>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <RHFTextField name="bgAmountFigures" disabled={readOnly} />
                        <RHFTextField name="bgAmountWords" disabled={readOnly} />
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.5}>
                      <SegmentedDateField name="expiryDate" label="Expiry Date" inline labelWidth={100} disabled={readOnly} />
                      <SegmentedDateField name="claimExpiryDate" label="Claim Expiry Date" inline labelWidth={100} disabled={readOnly} />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2">BG Tenor</Typography>
                      <SegmentedCodeField name="bgTenorMonths" boxes={2} size="small" disabled={readOnly} />
                      <SegmentedCodeField name="bgTenorDays" boxes={2} size="small" disabled={readOnly} />
                    </Stack>
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection number={6} title="Beneficiary Details">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryNameAddress" label="Name & Address" multiline minRows={3} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryContactPersonMobile" label="Contact Person Name & Mobile No" multiline minRows={3} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryEmail" label="EMail ID" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryGstNumber" label="GST Number" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="beneficiaryPan" label="PAN No" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SegmentedDateField name="beneficiaryDateOfIncorporation" label="Date of Incorporation" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="beneficiaryLeiCode" label="LEI Code" disabled={readOnly} />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5 }}>
                  *If e-BG with NeSL, please provide UIN allotted to Beneficiary by NeSL
                </Typography>
              </BoxedSection>

              <BoxedSection number={7} title="Beneficiary Bank Details for SFMS">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryBankNameAddress" label="Name & Address" multiline minRows={2} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="beneficiaryBankIfscSwift" label="IFSC / SWIFT code" disabled={readOnly} />
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection number={8} title="Advising Bank Details (if Advising Bank is other than Beneficiary Bank)">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="advisingBankNameAddress" label="Name & Address" multiline minRows={2} disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="advisingBankIfscSwift" label="IFSC / SWIFT code" disabled={readOnly} />
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection number={9} title="Margin Details">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="marginFdNo" label="FD No" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="marginFdAmount" label="Amount" type="number" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="marginOther" label="Other" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6} />
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      New FD
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} />
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="marginNewFdDebitAccount" label="Debit A/C" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="marginNewFdAmount" label="Amount" type="number" disabled={readOnly} />
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection number={10} title="Instruction on Bank Charges">
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  "I/We agree to pay all applicable taxes, duties (including stamp duty), cesses, fees and charges for
                  issuance of this Guarantee and consent that necessary deductions in this regard may be made from
                  my/our account number"
                </Typography>
              </BoxedSection>

              <BoxedSection number={11} title="General Declaration">
                <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    i) I/We hereby authorise HDFC Bank Ltd to mark lien on Deposit accounts which are /will be kept as
                    margin money against the Bank Guarantee.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ii) I/We hereby agree and confirm that the above Bank Guarantee is subject to the terms and
                    conditions as contained herein and in the sanction letter for the bank Guarantee entered into
                    between the applicant and The Bank.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    iii) I /We, am/are fully aware that in the event of invocation of Bank Guarantee (BG) by
                    beneficiary, HDFC Bank Ltd is entitled to make the payment immediately to the beneficiary by
                    debiting my/our operative account (CC/OD/CA), notwithstanding any dispute that I/we might have
                    with the beneficiary.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    iv) I/We hereby agree that margin money would be released by the Bank only on receipt of the
                    Original Bank Guarantee along with discharge letter/ no claim letter from the Beneficiary.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    v) We hereby authorize you to debit our account number to make the payment immediately in case of
                    receipt of any claim from the beneficiary. You are also authorised to debit our account with the
                    interest towards delayed payment claimed by the beneficiary.
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="claimDebitAccountNumber" label="Debit Account Number (for claims)" disabled={readOnly} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="delayedPaymentInterestPercent" label="Delayed Payment Interest %" type="number" disabled={readOnly} />
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary">
                    vi) In case said BG is issued with Continuing clause, we authorize the bank to keep guarantee
                    active for a further period of six months from earlier expiry date on every subsequent expiry
                    date till the time original guarantee (including all amendments) along with beneficiary discharge
                    letter is submitted to the bank for cancellation.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    vii) In case of the said BG being issued on an auto renewal basis, I/We hereby authorize the Bank
                    to debit My/Our account(s) with the Bank towards commission for renewal of the said BG.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    viii) In case said BG is having governing law as URDG 758, we understand the implications related
                    to the same and authorising bank to issue the bank guarantee with governing rule as URDG 758. We
                    also confirm that the underlying text of the BG has beneficiary consent.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ix) In case said BG is issued in Foreign Currency with Foreign Jurisdiction Clause whether in bank
                    guarantee or counter bank guarantee, we will indemnify bank against all cost/ charges/ damages/
                    expenses which bank may incur in contesting any legal proceeding before foreign court.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    x) I am/ We are aware that Bank is required to provide 1-year additional claim period over the
                    expiry date or the claim period as mentioned in the Bank Guarantee, whichever is later as per
                    law. Accordingly, Bank is liable to make payment to Beneficiary if the claim is made within the
                    above additional claim period. Hence, I/we authorize the Bank to block/continue the limit and
                    hold margin/security provided by us during the additional claim period
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    xi) I/We further confirm that all the documents/fixed deposit/margin submitted/furnished by us
                    for issuance of the Bank Guarantee in favor of the Bank will continue to be in force and effect
                    and shall be binding on me/us till I/we submit the Original Bank Guarantee and discharge letter
                    from the Beneficiary to the Bank for cancellation.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    xii) I/We acknowledge and agree that the Bank shall be entitled to recover the commission for the
                    additional claim period by debiting my/our account.
                  </Typography>
                </Stack>
                <Grid container spacing={2.5} alignItems="flex-end">
                  <Grid item xs={12} sm={6}>
                    <SegmentedDateField name="declarationDate" label="Date" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" textAlign={{ sm: 'right' }}>
                      Authorized Signatory
                      <br />
                      (Stamp to be affixed by firm/ Company)
                    </Typography>
                  </Grid>
                </Grid>
              </BoxedSection>

              <BoxedSection title="Details of documents enclosed: (please tick all that are relevant)">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <CheckboxBooleanField name="documentsContractAgreementCopy" label="Contract/Agreement copy" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CheckboxBooleanField name="documentsCounterGuarantee" label="Counter Guarantee" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CheckboxBooleanField name="documentsBankGuaranteeText" label="Bank Guarantee Text" disabled={readOnly} />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CheckboxBooleanField name="documentsOther" label="Other documents if any, please specify" disabled={readOnly} />
                      <Box sx={{ flex: 1 }}>
                        <RHFTextField name="otherDocumentsSpecify" disabled={readOnly} />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </BoxedSection>

              <Typography variant="caption" color="text.secondary">
                *Please note that in case of e-BG, the stamp duty will be procured through NeSL
              </Typography>
            </Stack>
          </FormProvider>
        </Box>

        <Divider />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ p: { xs: 2, sm: 2.5 } }}
        >
          {readOnly && application && (
            <Button startIcon={<PrintIcon />} onClick={() => downloadBgApplicationPdf(application)}>
              Download PDF
            </Button>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ ml: 'auto' }}>
            <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
            {!readOnly && (
              <Button type="submit" form="bg-application-form" variant="contained" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create BG Application'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
