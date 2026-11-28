import { useEffect, useMemo, useRef, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { contractAgreementApi } from '../../api/contractAgreementApi';
import { callLetterApi } from '../../api/callLetterApi';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatCurrency } from '../../utils/formatters';

const EMPTY_FORM = {
  tender: '',
  tenderName: '',
  zone: '',
  callLetter: '',
  nameOfWork: '',
  loaNoAndDate: '',
  orderingAuthority: '',
  contractorName: '',
  contractorShortName: '',
  consignee: '',
  inspectionChargesBy: 'Contractor',
  inspectionAuthority: 'RDSO, Lucknow',
  contractValidity: '',
  forwardedLetterNo: '',
  letterDate: '',
  firmNameAndPlace:
    'OEM/Supplier: M/s Notifire Private Limited. Place of Inspection: Notifire Pvt. Ltd., C-146 Ground Floor, Sector 63, Noida-201301(U.P) INDIA',
  specificationNo: 'RDSO/SPN/217/2025 Version - 3.1 Or Latest',
  callLetterNoAndDate: '',
  dateOfInspection: '',
  inspectingOfficial: '',
  guaranteeCertificateNo: 'NF/AFDAS/2026-27/0832',
  guaranteeIssueDate: '',
  sbCollectRefNo: '',
  sbCollectDate: '',
  payerGstin: '09AAGCN7119L1Z0',
  proformaRows: [],
  items: [],
  spares: [],
};

const EMPTY_ITEM = {
  itemNoOfSchB: '',
  description: '',
  nomenclature: '',
  modelNo: '',
  serialNo: '',
  hologram: '',
  qty: '',
  qtyValue: 0,
  qtyPerSet: 0,
  scheduleMultiplier: 1,
  unit: 'Nos',
  qtyOnOrder: '',
  qtyOffered: '',
  qtyAccepted: '',
  depttSchRate: 0,
  acceptedRate: 'At Par',
  firmName: '',
  subRows: [],
};

function padQty(num, unit = 'Nos') {
  const n = Number(num) || 0;
  const formatted = n < 10 && Number.isInteger(n) ? `0${n}` : String(n);
  return unit ? `${formatted} ${unit}` : formatted;
}

function cleanClientNomenclatureFallback(rawText = '') {
  let text = String(rawText || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'AFDAS Item';
  text = text
    .replace(/^(?:supply|providing|installation|testing|commissioning|erection|fixing|laying|wiring|and|&|,|\s)+of\s+/i, '')
    .replace(/^(?:resettable|analogue\s+type|analogue\s+addressable|loop\s+powered|addressable\s+and\s+resettable|addressable|networkable)\s*,?\s*/i, '')
    .replace(/^(?:resettable|analogue\s+type|analogue\s+addressable|loop\s+powered)\s*,?\s*/i, '');
  text = text
    .split(/\s*(?:,?\s*complying\s+to\b|,?\s*conforming\s+to\b|,?\s*confirming\s+to\b|,?\s*as\s+per\s+RDSO\b|,?\s*as\s+per\s+specification\b|,?\s*as\s+per\s+latest\b|\s+with\s+all\s+accessories\b|\.\s*As\s+per\b|\.\s*Note\b)/i)[0]
    .replace(/[.;,:]+$/g, '')
    .trim();
  return text.slice(0, 60).trim() || 'AFDAS Item';
}

function inferClientProductMeta(name = '') {
  const d = String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (d.includes('cpvc') || d.includes('upvc') || (d.includes('pipe') && (d.includes('aspiration') || d.includes('sampling')))) {
    return { nomenclature: 'CPVC Pipe', modelNo: 'Ashirvad', unit: 'Mtr' };
  }
  if (
    (d.includes('lhs') || d.includes('lhd') || d.includes('linear heat') || d.includes('liner heat')) &&
    (d.includes('interface') || d.includes('module')) &&
    !d.includes('hollow metallic') &&
    !d.includes('sensing cable') &&
    !d.includes('(lhs) cable')
  ) {
    return { nomenclature: 'LHS Module with Input Module', modelNo: 'F3050' };
  }
  if (
    d.includes('lhs cable') ||
    d.includes('lhd cable') ||
    d.includes('linear heat') ||
    d.includes('liner heat') ||
    (d.includes('lhs') && d.includes('cable'))
  ) {
    return { nomenclature: 'LHS Cable', modelNo: 'F3050', unit: 'Mtr' };
  }
  if (d.includes('monitor module')) return { nomenclature: 'Monitor Module with Isolator', modelNo: 'NF5211' };
  if (d.includes('control module') || d.includes('relay module')) return { nomenclature: 'Control Module', modelNo: 'NF5212' };
  if (d.includes('manual call point') || /\bmcp\b/.test(d)) {
    return { nomenclature: 'Manual Call Point with Isolator', modelNo: 'NF5264' };
  }
  if (d.includes('aspiration') || d.includes('air sampling') || /\basd\b/.test(d)) {
    const hasPowerSupply = d.includes('power supply') || d.includes('battery backup');
    return {
      nomenclature: hasPowerSupply
        ? 'Aspiration Smoke Detector with Input Module & Power Supply'
        : 'Aspiration Smoke Detector with Input Module',
      modelNo: 'ASD532',
    };
  }
  if (d.includes('hooter cum strobe') || d.includes('hooter-cum-strobe') || d.includes('sounder cum strobe') || d.includes('hooter with strobe')) {
    return { nomenclature: 'Hooter Cum Strobe', modelNo: 'NF5266' };
  }
  if (d.includes('audio visual alarm') || d.includes('hooter and strobe') || d.includes('hooter & strobe')) {
    return { nomenclature: d.includes('audio visual') ? 'Audio Visual Alarm' : 'Hooter Cum Strobe', modelNo: 'NF5266' };
  }
  if (d.includes('flasher') && !d.includes('hooter')) return { nomenclature: 'Flasher', modelNo: 'NF5266' };
  if (d.includes('hooter') && !d.includes('strobe') && !d.includes('audio visual')) return { nomenclature: 'Hooter', modelNo: 'NF5266' };
  if (
    (d.includes('armoured') && !d.includes('unarmoured') && !d.includes('un-armoured')) &&
    (d.includes('cable') || d.includes('sq mm') || d.includes('sq.mm') || d.includes('2c'))
  ) {
    return { nomenclature: 'Armoured Cable', modelNo: 'ATC-AFSC', unit: 'Mtr' };
  }
  if (
    d.includes('unarmoured') ||
    d.includes('un-armoured') ||
    d.includes('frls') ||
    d.includes('fire survival') ||
    d.includes('circuit integrity') ||
    d.includes('2c x 1.5') ||
    d.includes('2c 1.5') ||
    d.includes('2 core x 1.5') ||
    (d.includes('copper cable') && !d.includes('armoured'))
  ) {
    return { nomenclature: 'Unarmoured Cable', modelNo: 'ATC-UFSC', unit: 'Mtr' };
  }
  if (d.includes('multi sensor') || d.includes('multisensor') || (d.includes('heat') && d.includes('smoke'))) {
    return { nomenclature: 'Heat and Smoke (Multi Sensor) Detector', modelNo: 'NF5163' };
  }
  if (d.includes('smoke detector')) return { nomenclature: 'Smoke Detector', modelNo: 'NF5163' };
  if (d.includes('heat detector')) return { nomenclature: 'Heat Detector', modelNo: 'NF5163' };
  if (d.includes('control panel') || d.includes('single loop') || d.includes('networkable')) {
    const hasTcpIp = d.includes('tcp/ip') || d.includes('tcp ip') || d.includes('networking card') || d.includes('media converter');
    return { nomenclature: hasTcpIp ? 'Fire Alarm Control Panel(1 Loop) with TCP/IP' : 'Control Panel', modelNo: 'NF5109' };
  }
  if (
    d.includes('isolator device') ||
    d.includes('isolator module') ||
    d.includes('fault isolator') ||
    d.includes('short circuit isolator') ||
    d.includes('loop isolator') ||
    d.includes('isolate the circuit') ||
    d.includes('isolator')
  ) {
    return { nomenclature: 'Isolator Module', modelNo: 'NF5260', unit: 'Nos' };
  }
  return { nomenclature: cleanClientNomenclatureFallback(name), modelNo: '' };
}

/**
 * Extracts constituent items from composite descriptions like:
 * "...consisting of 01no. Control panel, 01 Flasher, 1no. hooter, 6 nos. smoke detectors, 06 nos heat detector and 01no. Manual call point..."
 */
function parseConstituentsFromDescription(description = '') {
  const raw = String(description || '').replace(/\s+/g, ' ').trim();
  const match = raw.match(/\b(?:consisting\s+of|comprising\s+of|comprising|consists\s+of|including)\s*[:\-]?\s*([\s\S]+)/i);
  if (!match) return null;

  const listText = match[1]
    .split(/\.\s*(?:Inspection|Note|Material|The\s+location|It\s+shall)/i)[0]
    .replace(/\.\s*$/, '')
    .trim();

  const segments = listText
    .split(/\s*,\s*|\s+\band\b\s+|\s*&\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) return null;

  const list = [];
  for (const seg of segments) {
    const leadMatch = seg.match(/^(\d+(?:\.\d+)?)\s*(?:nos?\.?|sets?\.?|mtrs?\.?|metres?\.?|pcs?\.?)?\s+(.+)$/i);
    if (leadMatch) {
      const qtyNum = Number(leadMatch[1]) || 1;
      const rawName = leadMatch[2].replace(/[.;,]+$/, '').trim();
      const meta = inferClientProductMeta(rawName);
      list.push({
        nomenclature: meta.nomenclature,
        modelNo: meta.modelNo,
        qtyPerSet: qtyNum,
        unit: 'Nos',
      });
    }
  }
  return list.length >= 2 ? list : null;
}

function autoExpandCompositeItems(items = [], proformaRows = []) {
  const sourceRows = proformaRows.length ? proformaRows : items;
  if (items.length === 1 && sourceRows.length === 1) {
    const row = sourceRows[0];
    const constituents = parseConstituentsFromDescription(row.description);
    if (constituents && constituents.length >= 2) {
      const mult = Number(row.qtyValue) || Number(String(row.qty || '').replace(/[^0-9.]/g, '')) || 1;
      return constituents.map((c, idx) => {
        const finalQty = (Number(c.qtyPerSet) || 1) * mult;
        const formatted = padQty(finalQty, c.unit);
        return {
          ...EMPTY_ITEM,
          itemNoOfSchB: `${row.itemNoOfSchB || 'Item 1'} (${idx + 1})`,
          description: `${c.nomenclature} — as per ${row.itemNoOfSchB || 'Schedule'}: ${row.description}`,
          nomenclature: c.nomenclature,
          modelNo: c.modelNo,
          qtyPerSet: c.qtyPerSet,
          scheduleMultiplier: mult,
          qtyValue: finalQty,
          unit: c.unit,
          qty: formatted,
          qtyOffered: formatted,
          qtyAccepted: formatted,
          qtyOnOrder: formatted,
          depttSchRate: idx === 0 ? Number(row.depttSchRate) || 0 : 0,
          acceptedRate: row.acceptedRate || 'At Par',
          firmName: row.firmName || '',
        };
      });
    }
  }
  return items.map((it) => {
    const nom = String(it.nomenclature || '').trim();
    const hasCleanNom = Boolean(nom && !/^supply[\s,]/i.test(nom) && nom.length <= 55);
    const meta = inferClientProductMeta(hasCleanNom ? nom : it.description || nom);
    const isMatchedCatalogItem = Boolean(meta.modelNo);
    const effectiveUnit = meta.unit || it.unit || 'Nos';
    const mult = Number(it.scheduleMultiplier) || 1;
    const perSet = Number(it.qtyPerSet) || 0;
    const rawQtyVal = Number(it.qtyValue) || Number(String(it.qty || '').replace(/[^0-9.]/g, '')) || 0;
    const qtyVal = mult > 1 && perSet > 0 && rawQtyVal === perSet ? perSet * mult : rawQtyVal;
    const formattedQty = padQty(qtyVal, effectiveUnit);
    return {
      ...it,
      nomenclature: isMatchedCatalogItem || !hasCleanNom ? meta.nomenclature : nom,
      modelNo: it.modelNo || meta.modelNo,
      unit: effectiveUnit,
      qtyValue: qtyVal,
      qty: formattedQty,
      qtyOnOrder: formattedQty,
      qtyOffered: formattedQty,
      qtyAccepted: formattedQty,
    };
  });
}

function mapDocToForm(doc) {
  if (!doc) return { ...EMPTY_FORM };
  const rawItems = Array.isArray(doc.items) ? doc.items.map((it) => ({ ...EMPTY_ITEM, ...it })) : [];
  const rawProforma = Array.isArray(doc.proformaRows) && doc.proformaRows.length
    ? doc.proformaRows
    : rawItems.map((it) => ({
        itemNoOfSchB: it.itemNoOfSchB,
        description: it.description,
        qty: it.qty,
        qtyValue: it.qtyValue,
        unit: it.unit,
        depttSchRate: it.depttSchRate,
        acceptedRate: it.acceptedRate,
        firmName: it.firmName,
      }));
  const expandedItems = autoExpandCompositeItems(rawItems, rawProforma);

  return {
    ...EMPTY_FORM,
    ...doc,
    tender: doc.tender?._id || doc.tender || '',
    proformaRows: rawProforma,
    items: expandedItems,
    spares: Array.isArray(doc.spares) ? doc.spares : [],
  };
}

function triggerBlobDownload(blobData, filename) {
  const blob = new Blob([blobData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function CallLetterDrawer({ open, mode = 'create', document: doc, onClose, onSubmit, submitting }) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);
  const readOnly = mode === 'view';

  const [form, setForm] = useState(EMPTY_FORM);
  const [caOptions, setCaOptions] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    if (!open) return;
    setUploadedFileName('');
    setForm(mapDocToForm(doc));
    contractAgreementApi
      .options()
      .then((res) => setCaOptions(res.data?.data || []))
      .catch(() => setCaOptions([]));
  }, [open, doc]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = [...prev.items];
      const updated = { ...nextItems[index], [field]: value };
      if (field === 'qtyValue' || field === 'unit') {
        const qVal = field === 'qtyValue' ? Number(value) || 0 : Number(updated.qtyValue) || 0;
        const uVal = field === 'unit' ? value : updated.unit || 'Nos';
        const formatted = padQty(qVal, uVal);
        updated.qty = formatted;
        updated.qtyOffered = formatted;
        updated.qtyAccepted = formatted;
        if (!updated.qtyOnOrder) updated.qtyOnOrder = formatted;
      }
      nextItems[index] = updated;
      return { ...prev, items: nextItems };
    });
  };

  const handleApplyQtyMultiplier = (multiplyBySchedule) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        const base = Number(it.qtyPerSet) || Number(it.qtyValue) || 1;
        const mult = Number(it.scheduleMultiplier) || 1;
        const nextQty = multiplyBySchedule ? base * mult : base;
        const formatted = padQty(nextQty, it.unit || 'Nos');
        return {
          ...it,
          qtyValue: nextQty,
          qty: formatted,
          qtyOffered: formatted,
          qtyAccepted: formatted,
        };
      }),
    }));
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...EMPTY_ITEM,
          itemNoOfSchB: `Item ${prev.items.length + 1}`,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadedFileName(file.name);
    setExtracting(true);
    try {
      const { data } = await callLetterApi.parsePdf(file);
      const extracted = data?.data || {};
      const proformaRows = Array.isArray(extracted.proformaRows) ? extracted.proformaRows : [];
      const expandedItems = autoExpandCompositeItems(extracted.items || [], proformaRows);

      setForm((prev) => ({
        ...prev,
        ...extracted,
        proformaRows,
        items: expandedItems,
        tender: prev.tender || '',
        tenderName: extracted.nameOfWork || extracted.tenderName || prev.tenderName,
        zone: extracted.zone || extracted.orderingAuthority || prev.zone,
        callLetter: extracted.forwardedLetterNo || extracted.callLetter || prev.callLetter,
      }));
      dispatch(
        showSnackbar({
          message: `Extracted ${expandedItems.length} Offer/Packing List items from "${file.name}" using Gemini AI!`,
        })
      );
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to extract PDF with Gemini AI',
          severity: 'error',
        })
      );
    } finally {
      setExtracting(false);
    }
  };

  const totalMaterialValue = useMemo(() => {
    const costSource = form.proformaRows?.length ? form.proformaRows : form.items || [];
    return costSource.reduce(
      (sum, item) => sum + (Number(item.qtyValue) || 0) * (Number(item.depttSchRate) || 0),
      0
    );
  }, [form.proformaRows, form.items]);

  const hasMultipliedSchedule = useMemo(
    () => (form.items || []).some((it) => (Number(it.scheduleMultiplier) || 1) > 1),
    [form.items]
  );

  const inspectionCharge = Math.round(totalMaterialValue * 0.01 * 100) / 100;
  const inspectionGst = Math.round(inspectionCharge * 0.18 * 100) / 100;
  const totalInspectionPayable = Math.round((inspectionCharge + inspectionGst) * 100) / 100;

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      const payload = {
        ...form,
        totalMaterialCost: totalMaterialValue,
      };
      const res = await callLetterApi.exportExcelDirect(payload);
      const stamp = new Date().toISOString().slice(0, 10);
      triggerBlobDownload(res.data, `RDSO-Call-Letter-${form.contractorShortName || stamp}.xlsx`);
      dispatch(showSnackbar({ message: 'RDSO Call Letter Excel workbook downloaded!' }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.response?.data?.message || 'Failed to generate Excel workbook',
          severity: 'error',
        })
      );
    } finally {
      setExportingExcel(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tender: form.tender || undefined,
      tenderName: form.tenderName || form.nameOfWork || form.loaNoAndDate || 'RDSO Call Letter',
      zone: form.zone || form.orderingAuthority || 'RDSO',
      callLetter: form.callLetter || form.callLetterNoAndDate || form.forwardedLetterNo || form.loaNoAndDate || 'Call Letter',
      totalMaterialCost: totalMaterialValue,
    };
    onSubmit(payload);
  };

  const titleMap = {
    create: 'Call Letter — PDF to RDSO Excel Generator',
    edit: 'Edit Call Letter & RDSO Excel Data',
    view: 'Call Letter Details & RDSO Excel Data',
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', md: '88vw', lg: 1180 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {titleMap[mode]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upload RDSO Proforma / Call Letter PDF to extract Description of Material, Constituent Nomenclature Items, Qty, Deptt. Sch. Rate & Accepted Rate via Gemini AI
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="success"
              startIcon={exportingExcel ? <CircularProgress size={16} /> : <DownloadIcon />}
              disabled={exportingExcel || form.items.length === 0}
              onClick={handleDownloadExcel}
              sx={{ fontWeight: 700 }}
            >
              {exportingExcel ? 'Generating Excel…' : 'Download RDSO Excel'}
            </Button>
            <IconButton onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Divider />

        <Box component="form" id="call-letter-form" onSubmit={handleSave} sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Stack spacing={3}>
            {/* Step 1: Gemini AI PDF Extraction Banner */}
            {!readOnly && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  bgcolor: '#f5f8ff',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AutoAwesomeIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography fontWeight={800} fontSize="0.95rem">
                        Extract Call Letter / RDSO Proforma from PDF (Gemini AI)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically extracts both the PDF Schedule Rows and all individual Nomenclature items inside the Description of Material (e.g. Control Panel, Flasher, Hooter, Smoke Detectors, Heat Detectors, Manual Call Point).
                      </Typography>
                      {uploadedFileName && (
                        <Box sx={{ mt: 0.75 }}>
                          <Chip size="small" color="primary" label={`Uploaded: ${uploadedFileName}`} />
                        </Box>
                      )}
                    </Box>
                  </Stack>

                  <Box sx={{ flexShrink: 0 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      hidden
                      onChange={handlePdfUpload}
                    />
                    <Button
                      variant="contained"
                      startIcon={extracting ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                      disabled={extracting}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ fontWeight: 700 }}
                    >
                      {extracting ? 'Extracting with Gemini AI…' : 'Upload PDF / Image'}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Step 2: Header & Proforma Particulars */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography fontWeight={800} fontSize="0.875rem" sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
                1. Proforma & Call Letter Header Particulars
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="1. Name of the Work"
                    value={form.nameOfWork}
                    onChange={(e) => setField('nameOfWork', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    label="Link to Contract Agreement / Tender (Optional)"
                    value={form.tender}
                    onChange={(e) => {
                      const tenderId = e.target.value;
                      const hit = caOptions.find((r) => String(r.tender?._id || r.tender) === String(tenderId));
                      setField('tender', tenderId);
                      if (hit && !form.tenderName) {
                        setField('tenderName', hit.tenderName || hit.tender?.tenderName || '');
                      }
                    }}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  >
                    <MenuItem value="">— None (Standalone PDF Call Letter) —</MenuItem>
                    {caOptions.map((row) => {
                      const tId = row.tender?._id || row.tender;
                      const tName = row.tenderName || row.tender?.tenderName || 'Untitled Tender';
                      return (
                        <MenuItem key={tId} value={tId}>
                          {tName} {row.caNumber ? `· CA ${row.caNumber}` : ''}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="2. LOA / C.A. No. & Dated"
                    value={form.loaNoAndDate}
                    onChange={(e) => setField('loaNoAndDate', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="3. Ordering Authority"
                    value={form.orderingAuthority}
                    onChange={(e) => setField('orderingAuthority', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="5. Consignee"
                    value={form.consignee}
                    onChange={(e) => setField('consignee', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>

                <Grid item xs={12} sm={8} md={5}>
                  <TextField
                    label="4. Name of the Contractor"
                    value={form.contractorName}
                    onChange={(e) => setField('contractorName', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    label="Contractor Short Code"
                    value={form.contractorShortName}
                    onChange={(e) => setField('contractorShortName', e.target.value)}
                    placeholder="e.g. QSHE"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    label="8. Contract Validity (DOC)"
                    value={form.contractValidity}
                    onChange={(e) => setField('contractValidity', e.target.value)}
                    placeholder="e.g. 15.12.2026"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Zone / Division"
                    value={form.zone}
                    onChange={(e) => setField('zone', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Call Letter No. & Date (Top Sheet)"
                    value={form.callLetterNoAndDate}
                    onChange={(e) => {
                      setField('callLetterNoAndDate', e.target.value);
                      setField('callLetter', e.target.value);
                    }}
                    placeholder="e.g. SER/NF/AFDAS/02SET/709, 26-10-2026"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Forwarded Letter No. (From PDF)"
                    value={form.forwardedLetterNo}
                    onChange={(e) => setField('forwardedLetterNo', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Specification No."
                    value={form.specificationNo}
                    onChange={(e) => setField('specificationNo', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Date of Inspection"
                    value={form.dateOfInspection}
                    onChange={(e) => setField('dateOfInspection', e.target.value)}
                    placeholder="e.g. 27-10-2026 To 28-10-2026"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Inspecting Official"
                    value={form.inspectingOfficial}
                    onChange={(e) => setField('inspectingOfficial', e.target.value)}
                    placeholder="e.g. Mr. Narendra Kumar"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Guarantee Certificate No."
                    value={form.guaranteeCertificateNo}
                    onChange={(e) => setField('guaranteeCertificateNo', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="SB Collect Ref. No."
                    value={form.sbCollectRefNo}
                    onChange={(e) => setField('sbCollectRefNo', e.target.value)}
                    placeholder="e.g. CPAHKYGYT0"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Step 3: Offer / Packing List Items & Materials to be Inspected */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography fontWeight={800} fontSize="0.875rem" sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                    2. Offer / Packing List & Annexure Items ({form.items.length} Items Extracted from Description)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Material Cost: <b>{formatCurrency(totalMaterialValue)}</b> · 1% Inspection Charge: <b>{formatCurrency(inspectionCharge)}</b> · +18% GST Total: <b>{formatCurrency(totalInspectionPayable)}</b>
                  </Typography>
                </Box>
                {!readOnly && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {hasMultipliedSchedule && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApplyQtyMultiplier(false)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Use Per-Description Qty (e.g. 1, 1, 1, 6, 6, 1)
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApplyQtyMultiplier(true)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Multiply by Schedule Qty
                        </Button>
                      </>
                    )}
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}>
                      Add Item Row
                    </Button>
                  </Stack>
                )}
              </Stack>

              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, maxHeight: 460 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 800, fontSize: '0.73rem', bgcolor: '#f1f5f9' } }}>
                      <TableCell sx={{ width: 110 }}>Item No. (Sch B)</TableCell>
                      <TableCell sx={{ width: 185 }}>Nomenclature (Offer/Packing List)</TableCell>
                      <TableCell sx={{ minWidth: 230 }}>Description of Material with Specn.</TableCell>
                      <TableCell sx={{ width: 110 }}>Model No.</TableCell>
                      <TableCell sx={{ width: 140 }}>Serial No.</TableCell>
                      <TableCell sx={{ width: 140 }}>Hologram / Sealing</TableCell>
                      <TableCell sx={{ width: 85 }}>Qty</TableCell>
                      <TableCell sx={{ width: 80 }}>Unit</TableCell>
                      <TableCell sx={{ width: 110 }}>Qty on Order</TableCell>
                      <TableCell sx={{ width: 120 }}>Deptt. Sch. Rate (₹)</TableCell>
                      <TableCell sx={{ width: 105 }}>Accepted Rate</TableCell>
                      {!readOnly && <TableCell sx={{ width: 48 }} />}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          Upload a Call Letter / RDSO Proforma PDF above to extract items automatically with Gemini AI, or click &ldquo;Add Item Row&rdquo;.
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.items.map((item, idx) => (
                        <TableRow key={idx} hover sx={{ verticalAlign: 'top' }}>
                          <TableCell>
                            <TextField
                              value={item.itemNoOfSchB || ''}
                              onChange={(e) => handleItemChange(idx, 'itemNoOfSchB', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.nomenclature || ''}
                              onChange={(e) => handleItemChange(idx, 'nomenclature', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem', fontWeight: 700 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.description || ''}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              size="small"
                              fullWidth
                              multiline
                              minRows={2}
                              maxRows={4}
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.modelNo || ''}
                              onChange={(e) => handleItemChange(idx, 'modelNo', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.serialNo || ''}
                              onChange={(e) => handleItemChange(idx, 'serialNo', e.target.value)}
                              placeholder="e.g. 4291 & 4292"
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.hologram || ''}
                              onChange={(e) => handleItemChange(idx, 'hologram', e.target.value)}
                              placeholder="e.g. SAHP057938"
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.qtyValue ?? ''}
                              onChange={(e) => handleItemChange(idx, 'qtyValue', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.unit || 'Nos'}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.qtyOnOrder || ''}
                              onChange={(e) => handleItemChange(idx, 'qtyOnOrder', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.depttSchRate ?? ''}
                              onChange={(e) => handleItemChange(idx, 'depttSchRate', Number(e.target.value) || 0)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.acceptedRate || 'At Par'}
                              onChange={(e) => handleItemChange(idx, 'acceptedRate', e.target.value)}
                              size="small"
                              fullWidth
                              disabled={readOnly}
                              inputProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          {!readOnly && (
                            <TableCell>
                              <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={exportingExcel ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            disabled={exportingExcel || form.items.length === 0}
            onClick={handleDownloadExcel}
            sx={{ fontWeight: 700 }}
          >
            {exportingExcel ? 'Generating 9-Sheet RDSO Excel…' : 'Download RDSO Excel (.xlsx)'}
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
            {!readOnly && (
              <Button type="submit" form="call-letter-form" variant="contained" disabled={submitting} sx={{ fontWeight: 700 }}>
                {submitting ? 'Saving…' : 'Save Call Letter'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
