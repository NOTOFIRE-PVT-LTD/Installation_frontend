import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFUnitSelect from '../../components/common/FormFields/RHFUnitSelect';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import { quotationApi } from '../../api/quotationApi';
import QuotationMasterDialog from './QuotationMasterDialog';
import { downloadQuotationPdf } from './quotationPdf';
import { GST_RATES, apiErrorMessage, computeTotals, money, serialNumbers, statusMeta } from './quotationUtils';

const SNAPSHOT = '__snapshot__';

const itemSchema = yup.object({
  lineType: yup.string().oneOf(['main', 'sub']),
  modelNo: yup.string().trim().required('Model No. is required'),
  qty: yup.number().typeError('Qty is required').moreThan(0, 'Qty must be greater than 0').required('Qty is required'),
  price: yup.number().typeError('Price is required').min(0, 'Price cannot be negative').required('Price is required'),
});

const schema = yup.object({
  companyRef: yup.string().required('Select a company'),
  salesperson: yup.string().trim().required('Salesperson is required'),
  projectName: yup.string().trim().required('Project name is required'),
  partyRef: yup.string().required('Select a party'),
  items: yup.array().of(itemSchema).min(1, 'Add at least one product'),
  discountPercent: yup.number().typeError('Enter a number').min(0).max(100, 'Max 100%'),
  packingFreight: yup.number().typeError('Enter a number').min(0),
});

function filterProductOptions(options, { inputValue }) {
  const terms = String(inputValue || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return options;
  return options.filter((opt) => {
    const haystack = [opt.modelNo, opt.description, opt.category, opt.approvals].join(' ').toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

function emptyItem(lineType = 'main') {
  return { lineType, masterItem: '', modelNo: '', description: '', category: '', productPrice: null, qty: 1, unit: 'Nos', price: '' };
}

function defaultValues(preparedBy = '') {
  return {
    companyRef: '',
    salesperson: '',
    projectName: '',
    preparedBy,
    techSpecCheckedBy: '',
    checkedBy: '',
    partyRef: '',
    items: [emptyItem()],
    discountPercent: 0,
    gstRate: 18,
    packingFreight: 0,
    termsRef: '',
    termsContent: '',
    notes: '',
  };
}

function Section({ title, subtitle, action, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={1} sx={{ mb: 2 }}>
        <Box>
          <Typography fontWeight={700} fontSize="1.05rem">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function ContactDetails({ title, contact }) {
  if (!contact) return null;
  return (
    <Box sx={{ mt: 1.5, p: 1.75, borderRadius: 1.5, bgcolor: 'action.hover' }}>
      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2">
            <b>Name:</b> {contact.name}
          </Typography>
          {(contact.contactPerson || contact.phone) && (
            <Typography variant="body2">
              <b>Contact:</b> {[contact.contactPerson, contact.phone].filter(Boolean).join(' ')}
            </Typography>
          )}
          {contact.email && (
            <Typography variant="body2">
              <b>Email:</b> {contact.email}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {contact.gstin && (
            <Typography variant="body2">
              <b>GST:</b> {contact.gstin}
            </Typography>
          )}
          {contact.address && (
            <Typography variant="body2">
              <b>Address:</b> {contact.address}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} fontSize={bold ? '1rem' : undefined}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} fontSize={bold ? '1rem' : undefined}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function QuotationFormPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const readOnly = mode === 'view';

  const [companies, setCompanies] = useState([]);
  const [parties, setParties] = useState([]);
  const [termsList, setTermsList] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterDialog, setMasterDialog] = useState({ open: false, kind: 'party' });

  const methods = useForm({ resolver: yupResolver(schema), defaultValues: defaultValues(user?.name || '') });
  const { control, setValue, getValues, reset, handleSubmit } = methods;
  const { fields, append, insert, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = useWatch({ control, name: 'items' }) || [];
  const [companyRef, partyRef, discountPercent, gstRate, packingFreight] = useWatch({
    control,
    name: ['companyRef', 'partyRef', 'discountPercent', 'gstRate', 'packingFreight'],
  });
  const totals = computeTotals({ items: watchedItems, discountPercent, gstRate, packingFreight });
  const serials = serialNumbers(watchedItems);

  useEffect(() => {
    let active = true;
    const requests = [
      quotationApi.listMasters('company'),
      quotationApi.listMasters('party'),
      quotationApi.listMasters('terms'),
      quotationApi.productOptions(),
      mode === 'create' ? Promise.resolve(null) : quotationApi.getById(id),
    ];
    Promise.all(requests)
      .then(([companyRes, partyRes, termsRes, productRes, quotationRes]) => {
        if (!active) return;
        setCompanies(companyRes.data?.data || []);
        setParties(partyRes.data?.data || []);
        setTermsList(termsRes.data?.data || []);
        setProducts(productRes.data?.data || []);
        const loaded = quotationRes?.data?.data || null;
        setQuotation(loaded);
        if (loaded) {
          const companyIds = new Set((companyRes.data?.data || []).map((c) => c._id));
          const partyIds = new Set((partyRes.data?.data || []).map((p) => p._id));
          const termIds = new Set((termsRes.data?.data || []).map((t) => t._id));
          reset({
            companyRef: loaded.company?.ref && companyIds.has(loaded.company.ref) ? loaded.company.ref : SNAPSHOT,
            salesperson: loaded.salesperson || '',
            projectName: loaded.projectName || '',
            preparedBy: loaded.preparedBy || '',
            techSpecCheckedBy: loaded.techSpecCheckedBy || '',
            checkedBy: loaded.checkedBy || '',
            partyRef: loaded.party?.ref && partyIds.has(loaded.party.ref) ? loaded.party.ref : SNAPSHOT,
            items: (loaded.items || []).length
              ? loaded.items.map((row) => ({
                  lineType: row.lineType || 'main',
                  masterItem: row.masterItem || '',
                  modelNo: row.modelNo || '',
                  description: row.description || '',
                  category: row.category || '',
                  productPrice: null,
                  qty: row.qty ?? 1,
                  unit: row.unit || 'Nos',
                  price: row.price ?? 0,
                }))
              : [emptyItem()],
            discountPercent: loaded.discountPercent ?? 0,
            gstRate: loaded.gstRate ?? 18,
            packingFreight: loaded.packingFreight ?? 0,
            termsRef: loaded.terms?.ref && termIds.has(loaded.terms.ref) ? loaded.terms.ref : '',
            termsContent: loaded.terms?.content || '',
            notes: loaded.notes || '',
          });
        }
      })
      .catch((err) => {
        dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load quotation data'), severity: 'error' }));
        if (mode !== 'create') navigate('/quotations');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  const selectedCompany = useMemo(() => {
    if (companyRef === SNAPSHOT) return quotation?.company || null;
    return companies.find((c) => c._id === companyRef) || null;
  }, [companyRef, companies, quotation]);

  const selectedParty = useMemo(() => {
    if (partyRef === SNAPSHOT) return quotation?.party || null;
    return parties.find((p) => p._id === partyRef) || null;
  }, [partyRef, parties, quotation]);

  const companyOptions = [
    { value: '', label: 'Select company' },
    ...(quotation?.company?.name && companyRef === SNAPSHOT ? [{ value: SNAPSHOT, label: `${quotation.company.name} (saved)` }] : []),
    ...companies.map((c) => ({ value: c._id, label: c.name })),
  ];
  const partyOptions = [
    { value: '', label: 'Select a party' },
    ...(quotation?.party?.name && partyRef === SNAPSHOT ? [{ value: SNAPSHOT, label: `${quotation.party.name} (saved)` }] : []),
    ...parties.map((p) => ({ value: p._id, label: p.name })),
  ];
  const termsOptions = [{ value: '', label: 'Choose terms and conditions' }, ...termsList.map((t) => ({ value: t._id, label: t.name }))];

  const applyProduct = (index, product) => {
    setValue(`items.${index}.masterItem`, '');
    setValue(`items.${index}.modelNo`, product.modelNo || product.description || '', { shouldValidate: true });
    setValue(`items.${index}.description`, product.description || '');
    setValue(`items.${index}.category`, product.category || '');
    setValue(`items.${index}.productPrice`, product.price);
    setValue(`items.${index}.unit`, product.unit || 'Nos');
    setValue(`items.${index}.price`, product.price ?? 0, { shouldValidate: true });
  };

  const buildPayload = (values) => {
    const contact = (ref, snapshot) => (ref === SNAPSHOT ? { ...snapshot, ref: null } : { ref });
    const selectedTerms = termsList.find((t) => t._id === values.termsRef);
    return {
      company: contact(values.companyRef, quotation?.company),
      party: contact(values.partyRef, quotation?.party),
      salesperson: values.salesperson,
      projectName: values.projectName,
      preparedBy: values.preparedBy,
      techSpecCheckedBy: values.techSpecCheckedBy,
      checkedBy: values.checkedBy,
      items: values.items.map((row) => ({
        lineType: row.lineType,
        masterItem: row.masterItem || null,
        modelNo: row.modelNo,
        description: row.description,
        category: row.category,
        qty: Number(row.qty) || 0,
        unit: row.unit || 'Nos',
        price: Number(row.price) || 0,
      })),
      discountPercent: Number(values.discountPercent) || 0,
      gstRate: Number(values.gstRate) || 0,
      packingFreight: Number(values.packingFreight) || 0,
      terms: values.termsRef
        ? { ref: values.termsRef, content: values.termsContent }
        : { title: selectedTerms?.name || '', content: values.termsContent },
      notes: values.notes,
    };
  };

  const currentPdfData = () => {
    const values = getValues();
    const payload = buildPayload(values);
    return {
      ...payload,
      quotationNo: quotation?.quotationNo || 'DRAFT',
      quotationDate: quotation?.quotationDate || new Date(),
      status: quotation?.status || 'draft',
      company: selectedCompany || {},
      party: selectedParty || {},
      terms: {
        title: termsList.find((t) => t._id === values.termsRef)?.name || quotation?.terms?.title || '',
        content: values.termsContent,
      },
    };
  };

  const handleDownload = () => downloadQuotationPdf(readOnly && quotation ? quotation : currentPdfData());

  const handleEmail = () => {
    const data = readOnly && quotation ? quotation : currentPdfData();
    downloadQuotationPdf(data);
    const to = (readOnly ? quotation?.party?.email : selectedParty?.email) || '';
    const subject = `Quotation ${data.quotationNo} - ${data.projectName || ''}`.trim();
    const body = [
      `Dear ${data.party?.contactPerson || data.party?.name || 'Sir/Madam'},`,
      '',
      `Please find attached our quotation ${data.quotationNo} for ${data.projectName || 'your requirement'}.`,
      `Total Amount: ${money(computeTotals(data).totalAmount)}`,
      '',
      'Regards,',
      data.preparedBy || user?.name || '',
      data.company?.name || '',
    ].join('\n');
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    dispatch(showSnackbar({ message: 'PDF downloaded — attach it to the email draft', severity: 'info' }));
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = buildPayload(values);
      const { data } = mode === 'edit' ? await quotationApi.update(id, payload) : await quotationApi.create(payload);
      dispatch(showSnackbar({ message: `Quotation ${data.data.quotationNo} saved` }));
      navigate(`/quotations/${data.data._id}`);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to save quotation'), severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => dispatch(showSnackbar({ message: 'Please fill all required fields', severity: 'warning' }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const title = mode === 'create' ? 'Create Quotation' : mode === 'edit' ? `Edit ${quotation?.quotationNo || 'Quotation'}` : quotation?.quotationNo;

  return (
    <FormProvider {...methods}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'center' }}
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={700} fontSize="1.25rem">
              {title}
            </Typography>
            {quotation && <Chip size="small" label={statusMeta(quotation.status).label} color={statusMeta(quotation.status).color} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create' ? 'Generate a new quotation' : mode === 'edit' ? 'Update quotation details' : 'Quotation details'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={readOnly ? <ArrowBackIcon /> : undefined}
            onClick={() => navigate(readOnly || mode === 'create' ? '/quotations' : `/quotations/${id}`)}
          >
            {readOnly ? 'Back' : 'Cancel'}
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Download
          </Button>
          <Button variant="outlined" startIcon={<EmailIcon />} onClick={handleEmail}>
            Email
          </Button>
          {readOnly ? (
            quotation && !quotation.isDeleted && (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/quotations/${id}/edit`)}>
                Edit
              </Button>
            )
          ) : (
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit, onInvalid)} disabled={saving}>
              {saving ? 'Saving…' : 'Save Quotation'}
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <Section
          title="Company Details"
          subtitle="Select your company information"
          action={
            !readOnly && (
              <Button size="small" startIcon={<AddIcon />} onClick={() => setMasterDialog({ open: true, kind: 'company' })}>
                Add New Company
              </Button>
            )
          }
        >
          <RHFSelect name="companyRef" label="Select Company *" options={companyOptions} disabled={readOnly} searchable />
          <ContactDetails title="Selected Company Details:" contact={selectedCompany} />
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <RHFTextField name="salesperson" label="Salesperson *" placeholder="Enter salesperson name" disabled={readOnly} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="projectName" label="Project Name *" placeholder="Enter project name" disabled={readOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField name="preparedBy" label="Quotation Prepared By" disabled />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField
                name="techSpecCheckedBy"
                label="Technical Spec Checked By"
                placeholder="Enter name of person who checked technical specs"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField
                name="checkedBy"
                label="Checked By"
                placeholder="Enter name of person who checked the quotation"
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </Section>

        <Section
          title="Party Details"
          subtitle="Select customer or create a new one"
          action={
            !readOnly && (
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setMasterDialog({ open: true, kind: 'party' })}>
                Add New Party
              </Button>
            )
          }
        >
          <RHFSelect name="partyRef" label="Select Party *" options={partyOptions} disabled={readOnly} searchable />
          <ContactDetails title="Selected Party Details:" contact={selectedParty} />
        </Section>

        <Section
          title="Product Details"
          subtitle="Add products and services — pick a Model No. from Products or type your own"
          action={
            !readOnly && (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => append(emptyItem('main'))}>
                  Add Item
                </Button>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => append(emptyItem('sub'))}>
                  Add Sub-Item
                </Button>
              </Stack>
            )
          }
        >
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {fields.map((field, index) => {
              const row = watchedItems[index] || {};
              const lineTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);
              const isSub = row.lineType === 'sub';
              return (
                <Box key={field.id} sx={{ pl: isSub ? { xs: 1.5, md: 4 } : 0, borderLeft: isSub ? '3px solid' : 'none', borderColor: 'divider' }}>
                  <Grid container columns={24} spacing={1.25} alignItems="flex-start">
                    <Grid item xs={8} sm={5} md={3}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 26, pt: 1 }}>
                          {serials[index]}
                        </Typography>
                        <RHFSelect
                          name={`items.${index}.lineType`}
                          options={[
                            { value: 'main', label: 'Main' },
                            { value: 'sub', label: 'Sub' },
                          ]}
                          size="small"
                          disabled={readOnly}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={16} sm={19} md={5}>
                      <Controller
                        name={`items.${index}.modelNo`}
                        control={control}
                        render={({ field: modelField, fieldState: { error } }) => (
                          <Autocomplete
                            freeSolo
                            disabled={readOnly}
                            options={products}
                            value={modelField.value || ''}
                            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.modelNo || opt.description || '')}
                            filterOptions={filterProductOptions}
                            slotProps={{ paper: { sx: { minWidth: 380 } } }}
                            noOptionsText="No matching products — add them under Quotations → Products"
                            isOptionEqualToValue={(opt, val) =>
                              typeof val === 'string' ? opt.modelNo === val : opt._id === val._id
                            }
                            renderOption={(props, opt) => (
                              <li {...props} key={opt._id}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {opt.modelNo || opt.description}
                                  </Typography>
                                  {opt.description && opt.description !== opt.modelNo && (
                                    <Typography variant="caption" display="block" noWrap title={opt.description}>
                                      {opt.description}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    {[opt.category, money(opt.price)].filter(Boolean).join(' · ')}
                                  </Typography>
                                </Box>
                              </li>
                            )}
                            onChange={(_event, next) => {
                              if (next && typeof next === 'object') applyProduct(index, next);
                              else {
                                modelField.onChange(next || '');
                                setValue(`items.${index}.masterItem`, '');
                              }
                            }}
                            onInputChange={(_event, value, reason) => {
                              if (reason !== 'input') return;
                              modelField.onChange(value);
                              setValue(`items.${index}.masterItem`, '');
                              setValue(`items.${index}.productPrice`, null);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Model No. *"
                                placeholder="Select model"
                                error={Boolean(error)}
                                helperText={error?.message}
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={24} md={6}>
                      <RHFTextField
                        name={`items.${index}.description`}
                        label="Description"
                        placeholder="Auto-filled from product selection"
                        multiline
                        minRows={1}
                        maxRows={4}
                        disabled={readOnly}
                      />
                    </Grid>
                    <Grid item xs={8} md={2}>
                      <RHFTextField name={`items.${index}.qty`} label="Qty *" type="number" disabled={readOnly} />
                    </Grid>
                    <Grid item xs={16} md={3}>
                      <RHFUnitSelect name={`items.${index}.unit`} disabled={readOnly} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <RHFTextField name={`items.${index}.price`} label="Price/Unit *" type="number" disabled={readOnly} />
                    </Grid>
                    <Grid item xs={readOnly ? 12 : 9} md={readOnly ? 3 : 2}>
                      <TextField size="small" label="Total" value={lineTotal.toFixed(2)} fullWidth disabled sx={{ '& .MuiInputBase-root': { fontSize: '0.8125rem' } }} />
                    </Grid>
                    {!readOnly && (
                      <Grid item xs={3} md={1}>
                        <IconButton size="small" onClick={() => remove(index)} disabled={fields.length <= 1} sx={{ mt: 0.5 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>

                  {(row.category || row.productPrice != null) && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 1, px: 1.5, py: 0.75, borderRadius: 1, bgcolor: 'action.hover' }}
                    >
                      <Typography variant="caption">
                        <b>Category:</b> {row.category || '-'}
                      </Typography>
                      {row.productPrice != null && (
                        <Typography variant="caption">
                          <b>Price:</b> {money(row.productPrice)}
                        </Typography>
                      )}
                    </Stack>
                  )}

                  {!readOnly && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" startIcon={<AddIcon />} onClick={() => insert(index + 1, emptyItem('main'))}>
                        Add Item Below
                      </Button>
                      <Button size="small" startIcon={<AddIcon />} onClick={() => insert(index + 1, emptyItem('sub'))}>
                        Add Sub-Item Below
                      </Button>
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Section>

        <Section title="Pricing Summary">
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <RHFTextField name="discountPercent" label="Discount (%)" type="number" disabled={readOnly} />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFSelect
                name="gstRate"
                label="GST Rate"
                size="small"
                options={GST_RATES.map((rate) => ({ value: rate, label: `${rate}%` }))}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField name="packingFreight" label="Packing/Freight" type="number" disabled={readOnly} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <SummaryRow label="Subtotal:" value={money(totals.subtotal)} />
          <SummaryRow label={`Discount (${Number(discountPercent) || 0}%):`} value={`-${money(totals.discountAmount)}`} />
          <SummaryRow label="After Discount:" value={money(totals.afterDiscount)} />
          <SummaryRow label={`GST (${Number(gstRate) || 0}%):`} value={money(totals.gstAmount)} />
          <SummaryRow label="Packing/Freight:" value={money(totals.packingFreight)} />
          <Divider sx={{ my: 1 }} />
          <SummaryRow label="Total Amount:" value={money(totals.totalAmount)} bold />
        </Section>

        <Section title="Terms and Conditions" subtitle="Select applicable terms and conditions for this quotation">
          <RHFSelect
            name="termsRef"
            label="Select Terms and Conditions"
            options={termsOptions}
            disabled={readOnly}
            onChange={(event) => {
              const next = event.target.value;
              setValue('termsRef', next);
              const template = termsList.find((t) => t._id === next);
              setValue('termsContent', template?.content || '');
            }}
          />
          <Box sx={{ mt: 1.5 }}>
            <RHFTextField
              name="termsContent"
              label="Terms content (editable for this quotation)"
              multiline
              minRows={3}
              disabled={readOnly}
            />
          </Box>
        </Section>

        <Section title="Notes" subtitle="Additional notes to include in the quotation PDF">
          <RHFTextField
            name="notes"
            placeholder="Enter any notes to appear on the quotation PDF"
            multiline
            minRows={3}
            disabled={readOnly}
          />
        </Section>
      </Stack>

      <QuotationMasterDialog
        open={masterDialog.open}
        kind={masterDialog.kind}
        record={null}
        onClose={() => setMasterDialog((prev) => ({ ...prev, open: false }))}
        onSaved={(record) => {
          if (!record?._id) return;
          if (masterDialog.kind === 'company') {
            setCompanies((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
            setValue('companyRef', record._id, { shouldValidate: true });
          } else {
            setParties((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
            setValue('partyRef', record._id, { shouldValidate: true });
          }
        }}
      />
    </FormProvider>
  );
}
