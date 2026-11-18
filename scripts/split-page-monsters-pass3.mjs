import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src', 'pages');

const slice = (lines, from, to) => lines.slice(from - 1, to).join('\n');
const read = (rel) => fs.readFileSync(path.join(src, rel), 'utf8').split(/\r?\n/);
const write = (rel, content) => fs.writeFileSync(path.join(src, rel), `${content.trim()}\n`, 'utf8');

const bgShared = `import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import SegmentedCodeField from '../../components/common/FormFields/SegmentedCodeField';
import SegmentedDateField from '../../components/common/FormFields/SegmentedDateField';
import CheckboxBooleanField from '../../components/common/FormFields/CheckboxBooleanField';
import { APPLICANT_PROFILES, BG_NATURES, BG_TYPE_OPTIONS, BORDERLESS_FIELD_SX } from './bgApplicationDrawerConstants';
import { BoxedSection, RadioCheckboxOption } from './bgApplicationDrawerFields';
import CheckboxSingleSelect from './bgApplicationDrawerFields';
`;

(function splitBgForm() {
  const lines = read('accounts/BgApplicationDrawerForm.jsx');
  write(
    'accounts/BgApplicationDrawerHeaderFields.jsx',
    `${bgShared}
export default function BgApplicationDrawerHeaderFields({ readOnly, profileName, handleProfileChange }) {
  return (
    <>
${slice(lines, 58, 88)}
    </>
  );
}`
  );
  write(
    'accounts/BgApplicationDrawerSectionsEarly.jsx',
    `${bgShared}
export default function BgApplicationDrawerSectionsEarly({ readOnly, methods }) {
  return (
    <>
${slice(lines, 89, 240)}
    </>
  );
}`
  );
  write(
    'accounts/BgApplicationDrawerSectionsLate.jsx',
    `${bgShared}
export default function BgApplicationDrawerSectionsLate({ readOnly, methods }) {
  return (
    <>
${slice(lines, 241, 430)}
    </>
  );
}`
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
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import { FormProvider } from 'react-hook-form';
import { downloadBgApplicationPdf } from '../../utils/bgApplicationExport';
import { HDFC_LOGO_BASE64 } from '../../assets/hdfcLogoBase64';
import BgApplicationDrawerHeaderFields from './BgApplicationDrawerHeaderFields';
import BgApplicationDrawerSectionsEarly from './BgApplicationDrawerSectionsEarly';
import BgApplicationDrawerSectionsLate from './BgApplicationDrawerSectionsLate';

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
  isEdit,
}) {
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
              <BgApplicationDrawerHeaderFields
                readOnly={readOnly}
                profileName={profileName}
                handleProfileChange={handleProfileChange}
              />
              <BgApplicationDrawerSectionsEarly readOnly={readOnly} methods={methods} />
              <BgApplicationDrawerSectionsLate readOnly={readOnly} methods={methods} />
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
}`
  );
})();

(function splitStationView() {
  const lines = read('projects/StationDetailPageView.jsx');
  const imports = `import Box from '@mui/material/Box';
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FormProvider } from 'react-hook-form';
import StageStepper from '../../components/common/StageStepper';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import RHFUnitSelect from '../../components/common/FormFields/RHFUnitSelect';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import DocumentDropzone from '../../components/common/FileUpload/DocumentDropzone';
import ImageDropzone from '../../components/common/FileUpload/ImageDropzone';
import MixedFileDropzone from '../../components/common/FileUpload/MixedFileDropzone';
import StationDailyReportingSection from './StationDailyReportingSection';
import { showSnackbar } from '../../features/ui/uiSlice';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import { SITE_TYPES, STATION_STAGE_LABELS } from '../../utils/constants';
`;

  write(
    'projects/StationDetailTopSection.jsx',
    `${imports}
export default function StationDetailTopSection(props) {
  const {
    navigate,
    project,
    station,
    dispatch,
    id,
    stage,
    methods,
    canManage,
    installerSelectOptions,
    loadingInstallers,
    handleInstallerSelect,
    currentLocation,
    locationLoading,
    locationError,
    fetchCurrentLocation,
    materialsArray,
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
    removingCadInstaller,
    handleRemoveCadDrawingInstaller,
    submitting,
    uploadingMedia,
    uploadProgress,
    onSubmit,
  } = props;

  return (
    <>
${slice(lines, 127, 379)}
    </>
  );
}`
  );

  write(
    'projects/StationDetailClaimBonusSection.jsx',
    `import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFDatePicker from '../../components/common/FormFields/RHFDatePicker';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { CLAIM_STATUS, CLAIM_TDS_PERCENT } from '../../utils/constants';
import { markStationPaid } from '../../features/projects/projectsThunks';

export default function StationDetailClaimBonusSection(props) {
  const {
    methods,
    project,
    station,
    id,
    dispatch,
    canManage,
    canApprove,
    claimRequestsArray,
    claimRows,
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
    mandatoryOk,
    effectiveBonusPercent,
    actionSubmitting,
    submitting,
    handleReRequest,
    handleSubmitClaim,
    runAction,
  } = props;

  return (
    <Grid container spacing={2.5}>
${slice(lines, 382, 653)}
    </Grid>
  );
}`
  );

  write(
    'projects/StationDetailPageView.jsx',
    `import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import { FormProvider } from 'react-hook-form';
import { showSnackbar } from '../../features/ui/uiSlice';
import { downloadSingleStationReport } from '../../utils/stationReportExport';
import StationDetailTopSection from './StationDetailTopSection';
import StationDetailClaimBonusSection from './StationDetailClaimBonusSection';

export default function StationDetailPageView(props) {
  const { navigate, project, station, dispatch, methods, id } = props;
  return (
    <Box>
${slice(lines, 94, 126)}
      <FormProvider {...methods}>
        <StationDetailTopSection {...props} />
        <StationDetailClaimBonusSection {...props} />
      </FormProvider>
    </Box>
  );
}`
  );
})();

console.log('pass3 complete');