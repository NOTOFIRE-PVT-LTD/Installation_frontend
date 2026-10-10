import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import { apiErrorMessage } from './quotationUtils';

export const MASTER_LABELS = {
  company: { singular: 'Company', plural: 'Companies' },
  party: { singular: 'Party', plural: 'Parties' },
  terms: { singular: 'Terms & Conditions', plural: 'Terms & Conditions' },
};

const EMPTY_BANK = { accountName: '', accountNo: '', bankName: '', ifsc: '', branch: '' };
const EMPTY = { name: '', gstin: '', contactPerson: '', phone: '', email: '', address: '', content: '', code: '', bank: EMPTY_BANK };

const BANK_FIELDS = [
  { name: 'accountName', label: 'Account Name', sm: 6 },
  { name: 'accountNo', label: 'A/C No.', sm: 6 },
  { name: 'bankName', label: 'Bank Name', sm: 6 },
  { name: 'ifsc', label: 'IFSC Code', sm: 6 },
  { name: 'branch', label: 'Branch', sm: 12 },
];

export default function QuotationMasterDialog({ open, kind, record, onClose, onSaved }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isTerms = kind === 'terms';
  const isCompany = kind === 'company';
  const label = MASTER_LABELS[kind]?.singular || 'Record';

  useEffect(() => {
    if (open) setValues({ ...EMPTY, ...(record || {}), bank: { ...EMPTY_BANK, ...(record?.bank || {}) } });
  }, [open, record]);

  const bankField = (name) => ({
    value: values.bank?.[name] ?? '',
    onChange: (event) => setValues((prev) => ({ ...prev, bank: { ...prev.bank, [name]: event.target.value } })),
    fullWidth: true,
    size: 'small',
  });

  const field = (name) => ({
    value: values[name] ?? '',
    onChange: (event) => setValues((prev) => ({ ...prev, [name]: event.target.value })),
    fullWidth: true,
    size: 'small',
  });

  const handleSave = async () => {
    if (!String(values.name || '').trim()) {
      dispatch(showSnackbar({ message: `${isTerms ? 'Title' : 'Name'} is required`, severity: 'warning' }));
      return;
    }
    setSaving(true);
    try {
      const payload = isTerms
        ? { name: values.name, content: values.content }
        : {
            name: values.name,
            gstin: values.gstin,
            contactPerson: values.contactPerson,
            phone: values.phone,
            email: values.email,
            address: values.address,
            ...(isCompany ? { code: values.code, bank: values.bank } : {}),
          };
      const { data } = record?._id
        ? await quotationApi.updateMaster(record._id, payload)
        : await quotationApi.createMaster(kind, payload);
      dispatch(showSnackbar({ message: `${label} ${record?._id ? 'updated' : 'added'}` }));
      onSaved?.(data.data);
      onClose();
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, `Failed to save ${label.toLowerCase()}`), severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{record?._id ? `Edit ${label}` : `Add New ${label}`}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField {...field('name')} label={isTerms ? 'Title *' : `${label} Name *`} autoFocus />
          </Grid>
          {isTerms ? (
            <Grid item xs={12}>
              <TextField
                {...field('content')}
                label="Terms & Conditions"
                multiline
                minRows={8}
                placeholder={'1. Prices are ex-works.\n2. Payment: 100% against delivery.\n3. Validity: 30 days.'}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField {...field('gstin')} label="GSTIN" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('contactPerson')} label="Contact Person" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('phone')} label="Phone" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('email')} label="Email" type="email" />
              </Grid>
              <Grid item xs={12}>
                <TextField {...field('address')} label="Address" multiline minRows={2} />
              </Grid>
              {isCompany && (
                <>
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', mt: 1 }}>Proforma Invoice</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      {...field('code')}
                      label="PI Number Prefix"
                      placeholder="e.g. NF"
                      helperText="Used as NF/PI/… in PI numbers"
                      inputProps={{ maxLength: 20 }}
                    />
                  </Grid>
                  {BANK_FIELDS.map((bank) => (
                    <Grid item xs={12} sm={bank.sm} key={bank.name}>
                      <TextField {...bankField(bank.name)} label={bank.label} />
                    </Grid>
                  ))}
                </>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
