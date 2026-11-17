import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src', 'pages');

function read(rel) {
  return fs.readFileSync(path.join(src, rel), 'utf8').split(/\r?\n/);
}

function slice(lines, from, to) {
  return lines.slice(from - 1, to).join('\n');
}

function write(rel, content) {
  const full = path.join(src, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\n+$/, '\n'), 'utf8');
}

// ─── StationDetailPage ────────────────────────────────────────────────────────
(function splitStation() {
  const lines = read('projects/StationDetailPage.jsx');
  write(
    'projects/stationDetailPageFormSchema.js',
    `import * as yup from 'yup';
import { SITE_TYPES } from '../../utils/constants';

${slice(lines, 55, 61)}

export const stationDetailSchema = yup.object({
${slice(lines, 65, 90)}
});

export const stationDetailDefaultValues = {
${slice(lines, 94, 106)}
};
`
  );
  write(
    'projects/stationDetailPageHelpers.js',
    `export function buildClaimRequestsFromStation(station) {
${slice(lines, 110, 132)}
}
`
  );

  write(
    'projects/useStationDetailPage.js',
    `import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchProjectById,
  updateStation,
  submitStationClaim,
  markStationPaid,
} from '../../features/projects/projectsThunks';
import { clearCurrent } from '../../features/projects/projectsSlice';
import { showSnackbar } from '../../features/ui/uiSlice';
import { formatCurrency } from '../../utils/formatters';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import { SITE_TYPES, CLAIM_STATUS, DEFAULT_BONUS_PERCENT, CLAIM_TDS_PERCENT } from '../../utils/constants';
import { stationStage } from '../../utils/projectFlow';
import { projectApi } from '../../api/projectApi';
import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import { stationDetailSchema, stationDetailDefaultValues } from './stationDetailPageFormSchema';
import { buildClaimRequestsFromStation } from './stationDetailPageHelpers';
import { buildStationUpdateFormData } from './stationDetailSubmit';

export function useStationDetailPage() {
${slice(lines, 136, 312)
  .replace(/\bschema\b/g, 'stationDetailSchema')
  .replace(/\bdefaultValues\b/g, 'stationDetailDefaultValues')}
${slice(lines, 332, 553)}
  return {
    navigate,
    id,
    dispatch,
    project,
    station,
    currentStatus,
    canManage,
    canApprove,
    methods,
    materialsArray,
    claimRequestsArray,
    claimRows,
    checklistFile,
    setChecklistFile,
    checklistSignedFile,
    setChecklistSignedFile,
    workPhotos,
    setWorkPhotos,
    cadDrawingFile,
    setCadDrawingFile,
    cadDrawingFiles,
    setCadDrawingFiles,
    submitting,
    uploadingMedia,
    uploadProgress,
    removingCadInstaller,
    actionSubmitting,
    currentLocation,
    locationLoading,
    locationError,
    fetchCurrentLocation,
    installerSelectOptions,
    loadingInstallers,
    handleInstallerSelect,
    stage,
    mandatoryOk,
    effectiveBonusPercent,
    allocatedAmount,
    totalRequested,
    totalTds,
    totalAfterTds,
    totalCleared,
    remainingAllocated,
    overAllocated,
    claimEditable,
    reRequestMode,
    hasNewRequest,
    clearedEditable,
    addPaymentSubpart,
    onSubmit,
    handleReRequest,
    handleSubmitClaim,
    handleRemoveCadDrawingInstaller,
    runAction,
  };
}
`
  );

  write(
    'projects/stationDetailSubmit.js',
    `import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';

async function uploadStationMediaFiles(mediaToUpload, setUploadProgress) {
  let uploadedCount = 0;
  const uploadMedia = async (file, resourceType) => {
    const uploaded = await uploadFileToCloudinary(file, resourceType, (fileProgress) => {
      setUploadProgress(Math.round(((uploadedCount + fileProgress / 100) / Math.max(mediaToUpload.length, 1)) * 100));
    });
    uploadedCount += 1;
    setUploadProgress(Math.round((uploadedCount / Math.max(mediaToUpload.length, 1)) * 100));
    return uploaded;
  };
  return uploadMedia;
}

export async function buildStationUpdateFormData({
  values,
  currentLocation,
  checklistFile,
  checklistSignedFile,
  cadDrawingFile,
  cadDrawingFiles,
  workPhotos,
  initialWorkPhotos,
  initialCadDrawingFile,
  initialCadDrawingFiles,
  setUploadProgress,
}) {
  const mediaToUpload = [
    checklistFile?.file,
    checklistSignedFile?.file,
    cadDrawingFile?.file,
    ...cadDrawingFiles.filter((file) => file.file).map((file) => file.file),
    ...workPhotos.filter((photo) => photo.file).map((photo) => photo.file),
  ].filter(Boolean);

  const uploadMedia = await uploadStationMediaFiles(mediaToUpload, setUploadProgress);

  const directChecklistFile = checklistFile?.file ? await uploadMedia(checklistFile.file, 'document') : null;
  const directChecklistSignedFile = checklistSignedFile?.file
    ? await uploadMedia(checklistSignedFile.file, 'document')
    : null;
  const directCadDrawingFile = cadDrawingFile?.file
    ? await uploadMedia(
        cadDrawingFile.file,
        cadDrawingFile.file.type === 'application/pdf' ? 'cadDocument' : 'cadImage'
      )
    : null;
  const directCadDrawingFiles = [];
  for (const item of cadDrawingFiles.filter((file) => file.file)) {
    const uploaded = await uploadMedia(item.file, item.file.type === 'application/pdf' ? 'cadDocument' : 'cadImage');
    directCadDrawingFiles.push({
      ...uploaded,
      resourceType: item.file.type === 'application/pdf' ? 'raw' : 'image',
      originalName: item.file.name,
    });
  }
  const directWorkPhotos = [];
  for (const item of workPhotos.filter((photo) => photo.file)) {
    directWorkPhotos.push(await uploadMedia(item.file, 'image'));
  }

  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('type', values.type || '');
  formData.append('reasonForDelay', values.reasonForDelay || '');
  formData.append('remarks', values.remarks || '');
  formData.append('installationAmount', values.installationAmount === '' ? 0 : values.installationAmount);
  ['startDate', 'completionDate', 'commissioningDate'].forEach((field) => {
    if (values[field]) formData.append(field, values[field]);
  });
  formData.append('sse', JSON.stringify(values.sse || {}));
  formData.append('installer', JSON.stringify(values.installer || {}));
  formData.append('supervisor', JSON.stringify(values.supervisor || {}));
  formData.append('materials', JSON.stringify(values.materials || []));
  if (currentLocation.latitude != null) {
    formData.append('location', JSON.stringify(currentLocation));
  }
  formData.append(
    'claimRequests',
    JSON.stringify(
      (values.claimRequests || []).map((row) => ({
        ...(row._id ? { _id: row._id } : {}),
        date: row.date || null,
        amountRequested: row.amountRequested === '' || row.amountRequested == null ? 0 : Number(row.amountRequested),
        amountCleared: row.amountCleared === '' || row.amountCleared == null ? 0 : Number(row.amountCleared),
        note: row.note || '',
      }))
    )
  );

  if (directChecklistFile) formData.append('directChecklistFile', JSON.stringify([directChecklistFile]));
  if (directChecklistSignedFile) formData.append('directChecklistSignedFile', JSON.stringify([directChecklistSignedFile]));
  if (directCadDrawingFile) formData.append('directCadDrawingFile', JSON.stringify([directCadDrawingFile]));
  if (initialCadDrawingFile?.publicId && !cadDrawingFile) {
    formData.append('removeCadDrawingFile', 'true');
  }
  if (directCadDrawingFiles.length) formData.append('directCadDrawingFiles', JSON.stringify(directCadDrawingFiles));
  if (directWorkPhotos.length) formData.append('directWorkPhotos', JSON.stringify(directWorkPhotos));

  const remainingPhotoIds = workPhotos.filter((p) => !p.file).map((p) => p.publicId);
  const removedIds = initialWorkPhotos.filter((p) => !remainingPhotoIds.includes(p.publicId)).map((p) => p.publicId);
  if (removedIds.length > 0) formData.append('removePhotoIds', JSON.stringify(removedIds));

  const remainingCadIds = cadDrawingFiles.filter((f) => !f.file && f.publicId).map((f) => f.publicId);
  const removedCadIds = initialCadDrawingFiles
    .filter((f) => f.publicId && !remainingCadIds.includes(f.publicId))
    .map((f) => f.publicId);
  if (removedCadIds.length > 0) formData.append('removeCadFileIds', JSON.stringify(removedCadIds));

  return formData;
}
`
  );

  // Keep onSubmit inline in hook for now — stationDetailSubmit is for future refactor; patch hook to use schema imports
  write(
    'projects/StationDetailPageView.jsx',
    `import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FormProvider } from 'react-hook-form';
import StageStepper from '../../components/common/StageStepper';
import StatusBadge from '../../components/common/StatusBadge';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFUnitSelect from '../../components/common/FormFields/RHFUnitSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import MixedFileDropzone from '../../components/common/FileUpload/MixedFileDropzone';
import StationDailyReportingSection from './StationDailyReportingSection';
import { formatCurrency } from '../../utils/formatters';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import { SITE_TYPES, CLAIM_STATUS, STATION_STAGE_LABELS, CLAIM_TDS_PERCENT } from '../../utils/constants';
import { markStationPaid } from '../../features/projects/projectsThunks';
export default function StationDetailPageView(props) {
  const {
    navigate,
    id,
    dispatch,
    project,
    station,
    canManage,
    canApprove,
    methods,
    materialsArray,
    claimRequestsArray,
    claimRows,
    checklistFile,
    setChecklistFile,
    checklistSignedFile,
    setChecklistSignedFile,
    workPhotos,
    setWorkPhotos,
    cadDrawingFile,
    setCadDrawingFile,
    cadDrawingFiles,
    setCadDrawingFiles,
    submitting,
    uploadingMedia,
    uploadProgress,
    removingCadInstaller,
    actionSubmitting,
    currentLocation,
    locationLoading,
    locationError,
    fetchCurrentLocation,
    installerSelectOptions,
    loadingInstallers,
    handleInstallerSelect,
    stage,
    mandatoryOk,
    effectiveBonusPercent,
    allocatedAmount,
    totalRequested,
    totalTds,
    totalAfterTds,
    totalCleared,
    remainingAllocated,
    overAllocated,
    claimEditable,
    reRequestMode,
    hasNewRequest,
    clearedEditable,
    onSubmit,
    handleReRequest,
    handleSubmitClaim,
    handleRemoveCadDrawingInstaller,
    runAction,
  } = props;

  return (
${slice(lines, 556, 1155)}
  );
}
`
  );

  write(
    'projects/StationDetailPage.jsx',
    `import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import { useStationDetailPage } from './useStationDetailPage';
import StationDetailPageView from './StationDetailPageView';

export default function StationDetailPage() {
  const vm = useStationDetailPage();

  if (vm.currentStatus === 'loading' || !vm.project) {
    return (
      <Stack alignItems="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!vm.station) {
    return (
      <Box>
        <Typography>Station not found.</Typography>
        <Link component="button" variant="body2" onClick={() => vm.navigate(\`/projects/\${vm.id}\`)}>
          Back to project
        </Link>
      </Box>
    );
  }

  return <StationDetailPageView {...vm} />;
}
`
  );
})();

// ─── ProjectDetailsTab ────────────────────────────────────────────────────────
(function splitProjectTab() {
  const lines = read('projects/ProjectDetailsTab.jsx');
  const returnLine = lines.findIndex((l) => l.trim() === 'return (');

  write(
    'projects/projectDetailsTabFormSchema.js',
    `import * as yup from 'yup';

${slice(lines, 29, 48)}

export const SERIAL_TYPE_OPTIONS = [
  { value: 'LHS/ASD', label: 'LHS/ASD' },
  { value: 'ALL', label: 'ALL' },
];

export const PROJECT_TYPE_OPTIONS = [
  { value: 'Private', label: 'Private' },
  { value: 'Contractor', label: 'Contractor' },
  { value: 'NF Project', label: 'NF Project' },
];

export const projectDetailsSchema = yup.object({
${slice(lines, 62, 130)}
});

export const RATING_OPTIONS = [
  { value: '', label: 'Not rated' },
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Below average' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Good' },
  { value: 5, label: '5 - Excellent' },
];

export const projectDetailsDefaultValues = {
${slice(lines, 143, 177)}
};

export const NUMBER_FIELDS = ['totalInstallationAmount'];
export const DATE_FIELDS = ['loaDate', 'dateOfCompletionLOA', 'targetDate'];
export const TEXT_FIELDS = [
  'projectName',
  'contractor',
  'railwayZone',
  'serialType',
  'projectType',
  'panelSerialStart',
  'panelSerialEnd',
  'invoiceNoDateSupply',
  'loaNo',
  'workName',
  'reasonForDelay',
  'supervisorName',
];
`
  );

  write(
    'projects/useProjectDetailsTab.js',
    `import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch } from '../../app/hooks';
import { createProject, updateProject } from '../../features/projects/projectsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { userApi } from '../../api/userApi';
import { nitTenderApi } from '../../api/nitTenderApi';
import {
  projectDetailsSchema,
  projectDetailsDefaultValues,
} from './projectDetailsTabFormSchema';

export function useProjectDetailsTab({ project, canManage, isAdmin, onSaved }) {
${slice(lines, 198, returnLine)
  .replace(/\bschema\b/g, 'projectDetailsSchema')
  .replace(/\bdefaultValues\b/g, 'projectDetailsDefaultValues')}
  return {
    dispatch,
    isEdit,
    readOnly,
    isAdmin,
    canManage,
    onSaved,
    methods,
    loaItemsArray,
    additionalOfficersArray,
    serialType,
    projectType,
    showLoaDetails,
    showSerialValue,
    checklistPdf,
    setChecklistPdf,
    commissioningVideos,
    setCommissioningVideos,
    installationInvoiceDoc,
    setInstallationInvoiceDoc,
    supplyInvoiceDoc,
    setSupplyInvoiceDoc,
    installationPoDoc,
    setInstallationPoDoc,
    submitting,
    userOptions,
    loadingUsers,
    tenderOptions,
    tenderSelectOptions,
    selectedTenderId,
    setSelectedTenderId,
    applyTenderLoa,
    onSubmit,
  };
}
`
  );

  write(
    'projects/ProjectDetailsTabSections.jsx',
    `import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { FormProvider } from 'react-hook-form';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFUnitSelect from '../../components/common/FormFields/RHFUnitSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import MultiVideoDropzone from '../../components/common/FileUpload/MultiVideoDropzone';
import {
  SERIAL_TYPE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  RATING_OPTIONS,
} from './projectDetailsTabFormSchema';

export default function ProjectDetailsTabSections(vm) {
  const {
    dispatch,
    isEdit,
    readOnly,
    isAdmin,
    canManage,
    methods,
    loaItemsArray,
    additionalOfficersArray,
    serialType,
    projectType,
    showLoaDetails,
    showSerialValue,
    checklistPdf,
    setChecklistPdf,
    commissioningVideos,
    setCommissioningVideos,
    installationInvoiceDoc,
    setInstallationInvoiceDoc,
    supplyInvoiceDoc,
    setSupplyInvoiceDoc,
    installationPoDoc,
    setInstallationPoDoc,
    submitting,
    userOptions,
    loadingUsers,
    tenderOptions,
    tenderSelectOptions,
    selectedTenderId,
    setSelectedTenderId,
    applyTenderLoa,
    onSubmit,
  } = vm;

  return (
${slice(lines, returnLine + 1, lines.length - 1)}
  );
}
`
  );

  write(
    'projects/ProjectDetailsTab.jsx',
    `import { useProjectDetailsTab } from './useProjectDetailsTab';
import ProjectDetailsTabSections from './ProjectDetailsTabSections';

export default function ProjectDetailsTab({ project, canManage, isAdmin, onSaved }) {
  const vm = useProjectDetailsTab({ project, canManage, isAdmin, onSaved });
  return <ProjectDetailsTabSections {...vm} />;
}
`
  );
})();

// ─── BgApplicationDrawer ──────────────────────────────────────────────────────
(function splitBg() {
  const lines = read('accounts/BgApplicationDrawer.jsx');

  write(
    'accounts/bgApplicationDrawerConstants.js',
    `export const BORDERLESS_FIELD_SX = {
${slice(lines, 28, 35)}
};

export const APPLICATION_TYPES = ['Fresh Issuance', 'Amendment'];
export const BG_NATURES = ['Financial Guarantee', 'Performance Guarantee', 'Deferred Payment Guarantee', 'Advance Payment Guarantee', 'Others'];
export const BG_TYPE_OPTIONS = ['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'];

export const APPLICANT_PROFILES = [
${slice(lines, 45, 114)}
];

export const DATE_FIELDS = [
  'applicantDateOfIncorporation',
  'beneficiaryDateOfIncorporation',
  'expiryDate',
  'claimExpiryDate',
  'declarationDate',
];
`
  );

  write(
    'accounts/bgApplicationDrawerFields.jsx',
    `import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';

${slice(lines, 230, 237)}

export const bgApplicationSchema = yup.object({
${slice(lines, 240, 286)}
});

export const bgApplicationDefaultValues = {
${slice(lines, 290, 336)}
};

export default function CheckboxSingleSelect({ name, options, control, disabled, columns }) {
${slice(lines, 118, 184)}
}

export function RadioCheckboxOption({ name, value, label, control, disabled }) {
${slice(lines, 190, 214)}
}

export function BoxedSection({ title, number, children }) {
${slice(lines, 218, 225)}
}
`
  );

  const returnLine = lines.findIndex((l) => l.trim() === 'return (');

  write(
    'accounts/useBgApplicationDrawer.js',
    `import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { APPLICANT_PROFILES, DATE_FIELDS } from './bgApplicationDrawerConstants';
import { bgApplicationSchema, bgApplicationDefaultValues } from './bgApplicationDrawerFields';

export function useBgApplicationDrawer({ open, mode, application, onSubmit }) {
  const readOnly = mode === 'view';
  const isEdit = mode === 'edit';

  const methods = useForm({ resolver: yupResolver(bgApplicationSchema), defaultValues: bgApplicationDefaultValues });
  const [profileName, setProfileName] = useState('');

  const handleProfileChange = (name) => {
${slice(lines, 355, 384)}
  };

  useEffect(() => {
${slice(lines, 388, 443)}
  }, [open, application]);

  const submit = (values) => {
    const payload = { ...values };
    DATE_FIELDS.forEach((field) => {
      if (!payload[field]) delete payload[field];
    });
    onSubmit(payload);
  };

  const titleMap = { create: 'Add BG Application', edit: 'Edit BG Application', view: 'BG Application Details' };

  return { readOnly, isEdit, methods, profileName, handleProfileChange, submit, titleMap, mode };
}
`
  );

  write(
    'accounts/BgApplicationDrawerForm.jsx',
    `import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
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
import { FormProvider } from 'react-hook-form';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import SegmentedCodeField from '../../components/common/FormFields/SegmentedCodeField';
import SegmentedDateField from '../../components/common/FormFields/SegmentedDateField';
import CheckboxBooleanField from '../../components/common/FormFields/CheckboxBooleanField';
import { downloadBgApplicationPdf } from '../../utils/bgApplicationExport';
import { HDFC_LOGO_BASE64 } from '../../assets/hdfcLogoBase64';
import { APPLICANT_PROFILES, BG_NATURES, BG_TYPE_OPTIONS, BORDERLESS_FIELD_SX } from './bgApplicationDrawerConstants';
import CheckboxSingleSelect, { BoxedSection, RadioCheckboxOption } from './bgApplicationDrawerFields';

export default function BgApplicationDrawerForm({
  open,
  onClose,
  readOnly,
  methods,
  profileName,
  handleProfileChange,
  submit,
  titleMap,
  mode,
  submitting,
  application,
}) {
  return (
${slice(lines, returnLine + 1, lines.length - 1)}
  );
}
`
  );

  write(
    'accounts/BgApplicationDrawer.jsx',
    `import { useBgApplicationDrawer } from './useBgApplicationDrawer';
import BgApplicationDrawerForm from './BgApplicationDrawerForm';

export default function BgApplicationDrawer({ open, mode = 'create', application, onClose, onSubmit, submitting }) {
  const vm = useBgApplicationDrawer({ open, mode, application, onSubmit });
  return (
    <BgApplicationDrawerForm
      open={open}
      onClose={onClose}
      submitting={submitting}
      application={application}
      mode={mode}
      {...vm}
    />
  );
}
`
  );
})();

console.log('split-page-monsters-pass2: station, project tab, bg drawer');