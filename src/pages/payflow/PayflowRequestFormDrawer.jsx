import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import { payflowApi, payflowRequestApi } from '../../api/payflowApi';
import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import {
  BANK_OPTIONS,
  ITEM_TYPE_OPTIONS,
  PAY_AGAINST_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  PRIORITY_OPTIONS,
} from './payflowRequestConfig';
import {
  EMPTY_REQUEST_FORM,
  MAX_FILE_MB,
  PAYFLOW_FORM_MASTERS,
  buildRequestPayload,
  payflowRequestSchema,
} from './payflowRequestFormSchema';
import {
  AmountFlowSection,
  FormComboField,
  FormSelectField,
  FormTextField,
  VendorAutocompleteField,
} from './PayflowRequestFields';
import { AttachmentsFieldSection, BillsFieldSection } from './PayflowBillsAttachmentsSection';

const GRID_SX = { display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } };

function usePayflowDrawerOptions(open) {
  const [options, setOptions] = useState({});
  const [users, setUsers] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const vendorTimer = useRef(null);

  const searchVendors = (term) => {
    clearTimeout(vendorTimer.current);
    vendorTimer.current = setTimeout(async () => {
      try {
        const { data } = await payflowApi.list('vendors', { pageSize: 20, search: term || undefined });
        setVendorOptions(data.data);
      } catch {
        // typed vendors are still accepted as new entries
      }
    }, 250);
  };

  useEffect(() => {
    if (!open) return undefined;
    searchVendors('');
    PAYFLOW_FORM_MASTERS.forEach(async ([resource, key]) => {
      try {
        const { data } = await payflowApi.list(resource, { pageSize: 100 });
        setOptions((prev) => ({ ...prev, [key]: data.data.map((d) => d.name) }));
      } catch {
        // master lists are optional helpers
      }
    });
    payflowRequestApi.userOptions().then(({ data }) => setUsers(data.data)).catch(() => {});
    return () => clearTimeout(vendorTimer.current);
  }, [open]);

  return { options, users, vendorOptions, searchVendors };
}

function RequestDetailsGrid({ control, options, users, vendorOptions, vendorMatch, isNewVendor, onVendorInput }) {
  const userOpts = users.map((u) => ({ value: u._id, label: u.name }));
  return (
    <Box sx={GRID_SX}>
      <Box>
        <VendorAutocompleteField control={control} vendorOptions={vendorOptions} onVendorInput={onVendorInput} />
      </Box>
      <FormTextField
        control={control}
        name="vendorAccountNumber"
        label={isNewVendor ? 'Account Number' : 'Account Number (Auto-filled)'}
        extra={{ placeholder: vendorMatch ? '' : 'Select vendor to view account number', disabled: !isNewVendor, required: isNewVendor }}
      />
      <FormTextField
        control={control}
        name="vendorIfsc"
        label={isNewVendor ? 'IFSC Code/ Swift Code' : 'IFSC Code/ Swift Code (Auto-filled)'}
        extra={{ placeholder: vendorMatch ? '' : 'Select vendor to view IFSC code', disabled: !isNewVendor, required: isNewVendor }}
      />
      <FormComboField control={control} name="company" label="Company" options={options.company} placeholder="Select Company" />
      <FormComboField control={control} name="branch" label="Company Branch" options={options.branch} placeholder="Select Branch" />
      <FormComboField control={control} name="category" label="Category" options={options.category} placeholder="Type to search categories..." />
      <FormComboField control={control} name="subcategory" label="Sub-category" options={options.subcategory} placeholder="Type to search sub-categories..." />
      <FormSelectField control={control} name="itemType" label="Item Type" items={ITEM_TYPE_OPTIONS} required />
      <FormSelectField control={control} name="bankName" label="Bank Name" items={BANK_OPTIONS} required />
      <FormSelectField control={control} name="paymentMode" label="Payment Mode" items={PAYMENT_MODE_OPTIONS} required />
      <FormSelectField control={control} name="priority" label="Urgency Level" items={PRIORITY_OPTIONS} required />
      <FormSelectField control={control} name="payAgainst" label="Pay Against" items={PAY_AGAINST_OPTIONS} required />
      <FormSelectField control={control} name="priceCheckBy" label="Price Check Guaranteed By" items={userOpts} required emptyLabel="Select user" />
      <FormSelectField control={control} name="quantityCheckedBy" label="Quantity Checked By" items={userOpts} emptyLabel="Select user" />
      <FormSelectField control={control} name="qualityCheckedBy" label="Quality Checked By" items={userOpts} emptyLabel="Select user" />
      <FormSelectField control={control} name="purchaseOwner" label="Purchase Owner" items={userOpts} emptyLabel="Select user" />
    </Box>
  );
}

function ExtraMetadataGrid({ control }) {
  return (
    <Box sx={GRID_SX}>
      <FormTextField control={control} name="department" label="Department" extra={{ placeholder: 'Enter department' }} />
      <FormTextField control={control} name="endUse" label="End Use" extra={{ placeholder: 'Enter end use' }} />
      <FormTextField control={control} name="lpr" label="LPR (Last Purchase Rate)" extra={{ placeholder: 'Enter last purchase rate' }} />
      <FormTextField control={control} name="ioa" label="IOA (Internal Order Accounting)" extra={{ placeholder: 'Enter internal order accounting' }} />
      <FormTextField control={control} name="cpp" label="CPP (Credit Payment Period)" extra={{ type: 'number', placeholder: 'Enter credit payment period (days)' }} />
    </Box>
  );
}

async function uploadAttachments(files) {
  const uploaded = [];
  for (const file of files) {
    const kind = file.type === 'application/pdf' ? 'document' : 'image';
    const { url, publicId } = await uploadFileToCloudinary(file, kind);
    uploaded.push({ url, publicId, name: file.name });
  }
  return uploaded;
}

export default function PayflowRequestFormDrawer({ open, submitting, onClose, onSubmit }) {
  const dispatch = useAppDispatch();
  const { options, users, vendorOptions, searchVendors } = usePayflowDrawerOptions(open);
  const [vendorMatch, setVendorMatch] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const form = useForm({ resolver: yupResolver(payflowRequestSchema), defaultValues: EMPTY_REQUEST_FORM });
  const { control, handleSubmit, reset, watch, setValue, trigger, formState: { isSubmitted, dirtyFields } } = form;
  const { fields: billFields, append, remove } = useFieldArray({ control, name: 'bills' });

  const [totalOutstanding, amount, payAgainst, isNewVendor] = watch(['totalOutstanding', 'amount', 'payAgainst', 'isNewVendor']);

  useEffect(() => {
    if (!open) return;
    reset(EMPTY_REQUEST_FORM);
    setFiles([]);
    setVendorMatch(null);
  }, [open, reset]);

  useEffect(() => {
    if (isSubmitted || dirtyFields.amount) trigger('amount');
  }, [totalOutstanding, payAgainst, isSubmitted, dirtyFields.amount, trigger]);

  const handleVendorInput = (text) => {
    setValue('vendor', text, { shouldValidate: false });
    const match = vendorOptions.find((v) => v.name.toLowerCase() === text.trim().toLowerCase());
    setVendorMatch(match || null);
    setValue('isNewVendor', !match && Boolean(text.trim()));
    setValue('vendorAccountNumber', match ? match.accountNumber : '');
    setValue('vendorIfsc', match ? match.ifscCode : '');
    searchVendors(text);
  };

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) return dispatch(showSnackbar({ message: `${tooBig.name} is larger than ${MAX_FILE_MB} MB`, severity: 'error' }));
    setFiles((prev) => [...prev, ...picked].slice(0, 20));
  };

  const submit = handleSubmit(async (values) => {
    setUploading(true);
    try {
      const attachments = await uploadAttachments(files);
      await onSubmit(buildRequestPayload(values, users, attachments));
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || 'Failed to upload attachments', severity: 'error' }));
    } finally {
      setUploading(false);
    }
  });

  const busy = submitting || uploading;

  return (
    <Drawer anchor="right" open={open} onClose={busy ? undefined : onClose} PaperProps={{ sx: { width: { xs: '100vw', md: 760 }, maxWidth: '100vw', display: 'flex', flexDirection: 'column' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        Submit Payment Request
        <IconButton onClick={onClose} size="small" aria-label="Close" disabled={busy} sx={{ color: 'error.light' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <RequestDetailsGrid control={control} options={options} users={users} vendorOptions={vendorOptions} vendorMatch={vendorMatch} isNewVendor={isNewVendor} onVendorInput={handleVendorInput} />
          <AmountFlowSection control={control} totalOutstanding={totalOutstanding} amount={amount} payAgainst={payAgainst} />
          <FormTextField control={control} name="description" label="Item Description" extra={{ required: true, multiline: true, minRows: 2 }} />
          <ExtraMetadataGrid control={control} />
          <BillsFieldSection control={control} billFields={billFields} onAppend={append} onRemove={remove} />
          <AttachmentsFieldSection files={files} fileInputRef={fileInput} onAddFiles={addFiles} onRemoveFile={(i) => setFiles((p) => p.filter((_, idx) => idx !== i))} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" color="error" disableElevation onClick={onClose} disabled={busy} sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={busy} sx={{ fontWeight: 600 }}>{busy ? (uploading ? 'Uploading…' : 'Submitting…') : 'Submit Request'}</Button>
      </DialogActions>
    </Drawer>
  );
}
