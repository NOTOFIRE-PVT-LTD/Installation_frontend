/**
 * Splits five oversized page modules into sibling hooks, sections, and helpers.
 * Run: node scripts/split-page-monsters.mjs
 */
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

function lineCount(rel) {
  return read(rel).length;
}

// ─── StockItemsPage ───────────────────────────────────────────────────────────
(function splitStock() {
  const lines = read('stock/StockItemsPage.jsx');
  const shared = `${slice(lines, 47, 132)}

${slice(lines, 134, 227)}`;

  write(
    'stock/stockItemsPageShared.js',
    `import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../utils/formatters';
import { STOCK_MOVEMENT_TYPES } from '../../utils/constants';

export const STOCK_PAGE_SIZE_OPTIONS = [100, 250, 500, 1000];
export const STOCK_MAX_PAGE_SIZE = STOCK_PAGE_SIZE_OPTIONS[STOCK_PAGE_SIZE_OPTIONS.length - 1];
export const STOCK_DEFAULT_PAGE_SIZE = STOCK_MAX_PAGE_SIZE;

${slice(lines, 51, 65)}

${slice(lines, 67, 132)}

${slice(lines, 134, 227)}
`
  );

  write(
    'stock/StockItemsPanel.jsx',
    `import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StockItemDrawer from './StockItemDrawer';
import StockItemImportDialog from './StockItemImportDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  deleteStockItems,
  importStockItems,
} from '../../features/stockItems/stockItemsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  ITEM_COLUMNS,
  emptySelectionModel,
  bulkDeleteMessage,
} from './stockItemsPageShared';

export default function StockItemsPanel() {
${slice(lines, 230, 431)}
}
`
  );

  write(
    'stock/StockWarehousePanel.jsx',
    `import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { deleteStockItems } from '../../features/stockItems/stockItemsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { stockApi } from '../../api/stockApi';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_MAX_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  WAREHOUSE_COLUMNS,
  emptySelectionModel,
  bulkDeleteMessage,
} from './stockItemsPageShared';

export default function StockWarehousePanel() {
${slice(lines, 435, 565)}
}
`
  );

  write(
    'stock/StockMovementsPanel.jsx',
    `import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DataTable from '../../components/common/DataTable/DataTable';
import { extractSelectedRowIds } from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StockMovementDrawer from './StockMovementDrawer';
import StockReceiveImportDialog from './StockReceiveImportDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  deleteStockMovements,
  importStockReceives,
} from '../../features/stockMovements/stockMovementsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../utils/constants';
import {
  STOCK_DEFAULT_PAGE_SIZE,
  STOCK_PAGE_SIZE_OPTIONS,
  emptySelectionModel,
  bulkDeleteMessage,
  movementColumns,
} from './stockItemsPageShared';

export default function StockMovementsPanel({ type, actionLabel }) {
${slice(lines, 569, 781)}
}
`
  );

  write(
    'stock/StockItemsPage.jsx',
    `import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PageHeader from '../../components/common/PageHeader';
import { STOCK_MOVEMENT_TYPES } from '../../utils/constants';
import StockItemsPanel from './StockItemsPanel';
import StockWarehousePanel from './StockWarehousePanel';
import StockMovementsPanel from './StockMovementsPanel';

export default function StockItemsPage() {
${slice(lines, 785, 850)}
}
`
  );
})();

// ─── MasterItemDialog ─────────────────────────────────────────────────────────
(function splitMasterItem() {
  const lines = read('itemMaster/MasterItemDialog.jsx');

  write(
    'itemMaster/masterItemDialogSchema.js',
    `import * as yup from 'yup';
import { OTHER, newNameField } from './itemMasterFields';

const numeric = (message) =>
  yup
    .number()
    .transform((value, original) => (String(original ?? '').trim() === '' ? null : value))
    .nullable()
    .typeError(message);

export const masterItemDialogSchema = yup.object({
  itemNameSelect: yup.string().nullable(),
  newItemName: yup.string().nullable(),
  personAsked: yup.string().nullable(),
  itemCategory: yup.string().required('Item category is required'),
  newItemCategory: yup.string().when('itemCategory', {
    is: OTHER,
    then: (s) => s.trim().required('Enter a new item category'),
    otherwise: (s) => s.nullable(),
  }),
  itemName: yup.string().trim().required('Item name is required'),
  itemDescription: yup.string().nullable(),
  quantity: numeric('Quantity must be a number').min(0, 'Cannot be negative'),
  price: numeric('Price must be a number').min(0, 'Cannot be negative'),
});
`
  );

  write(
    'itemMaster/masterItemDialogFormHelpers.js',
    `import { CATALOG_FIELDS, newNameField } from './itemMasterFields';

export function emptyMasterItemFormValues() {
  const catalog = CATALOG_FIELDS.reduce((acc, field) => {
    acc[field.name] = '';
    acc[newNameField(field.name)] = '';
    return acc;
  }, {});
  return {
    ...catalog,
    itemNameSelect: '',
    newItemName: '',
    personAsked: '',
    itemName: '',
    itemDescription: '',
    quantity: '',
    price: '',
  };
}

export function itemNameText(item) {
  if (!item?.itemName) return '';
  if (typeof item.itemName === 'string') return item.itemName.trim();
  return String(item.itemName.name || '').trim();
}

export function mapItemToForm(item) {
  if (!item) return emptyMasterItemFormValues();
  const catalog = CATALOG_FIELDS.reduce((acc, field) => {
    const value = item[field.name];
    acc[field.name] = value?._id || value || '';
    acc[newNameField(field.name)] = '';
    return acc;
  }, {});
  return {
    ...emptyMasterItemFormValues(),
    ...catalog,
    itemNameSelect: '',
    newItemName: '',
    personAsked: item.personAsked || '',
    itemName: itemNameText(item),
    itemDescription: item.itemDescription || '',
    quantity: item.quantity ?? '',
    price: item.price ?? '',
  };
}

export function isPdfAttachment(entry) {
  if (!entry) return false;
  if (entry.resourceType === 'raw') return true;
  if (entry.file?.type === 'application/pdf') return true;
  const name = String(entry.originalName || entry.name || entry.url || '').toLowerCase();
  return name.endsWith('.pdf') || name.includes('/raw/upload/');
}

export function normalizeAttachments(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((entry) => entry?.url || entry?.file)
      .map((entry) => ({
        url: entry.url || '',
        publicId: entry.publicId || '',
        resourceType: entry.resourceType || (isPdfAttachment(entry) ? 'raw' : 'image'),
        originalName: entry.originalName || entry.name || '',
        file: entry.file || null,
        key: entry.key || entry.publicId || entry.url || \`\${Date.now()}-\${Math.random()}\`,
      }));
  }
  if (typeof value === 'object' && value.url) {
    return normalizeAttachments([value]);
  }
  return [];
}
`
  );

  write(
    'itemMaster/MasterItemDialogFieldLabel.jsx',
    `import Typography from '@mui/material/Typography';

export default function MasterItemDialogFieldLabel({ children, required }) {
${slice(lines, 102, 112)}
}
`
  );

  write(
    'itemMaster/MasterItemDialogCatalogSelect.jsx',
    `import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useWatch } from 'react-hook-form';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { OTHER, newNameField } from './itemMasterFields';
import MasterItemDialogFieldLabel from './MasterItemDialogFieldLabel';

export default function MasterItemDialogCatalogSelect({ field, options, readOnly, adding, onAdd, onRemove }) {
${slice(lines, 116, 154)}
}
`
  );

  write(
    'itemMaster/MasterItemDialogTotalAmountField.jsx',
    `import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useWatch } from 'react-hook-form';
import MasterItemDialogFieldLabel from './MasterItemDialogFieldLabel';

export default function MasterItemDialogTotalAmountField() {
${slice(lines, 157, 180)}
}
`
  );

  write(
    'itemMaster/MasterItemDialogMultiFilePicker.jsx',
    `import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCameraOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import MasterItemDialogFieldLabel from './MasterItemDialogFieldLabel';
import { isPdfAttachment } from './masterItemDialogFormHelpers';

export default function MasterItemDialogMultiFilePicker({ label, value = [], onChange, readOnly }) {
${slice(lines, 212, 372)}
}
`
  );

  write(
    'itemMaster/MasterItemDialogItemNameField.jsx',
    `import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useWatch } from 'react-hook-form';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import RHFSelect from '../../components/common/FormFields/RHFSelect';
import { OTHER } from './itemMasterFields';
import MasterItemDialogFieldLabel from './MasterItemDialogFieldLabel';

export default function MasterItemDialogItemNameField({ nameOptions, readOnly, mode, adding, onAddName }) {
${slice(lines, 376, 433)}
}
`
  );

  write(
    'itemMaster/MasterItemDialogLocationField.jsx',
    `import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/EditOutlined';
import MasterItemDialogLocationReadOnly from './MasterItemDialogLocationReadOnly';
import MasterItemDialogLocationManualForm from './MasterItemDialogLocationManualForm';
import MasterItemDialogLocationAutoView from './MasterItemDialogLocationAutoView';

export default function MasterItemDialogLocationField({
  location,
  onChange,
  mode: locationMode,
  onModeChange,
  loading,
  error,
  onRefresh,
  readOnly,
}) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
${slice(lines, 448, 525)}

      {readOnly ? (
        <MasterItemDialogLocationReadOnly location={location} />
      ) : locationMode === 'manual' ? (
        <MasterItemDialogLocationManualForm
          location={location}
          onChange={onChange}
          loading={loading}
          onRefresh={onRefresh}
        />
      ) : (
        <MasterItemDialogLocationAutoView
          location={location}
          loading={loading}
          error={error}
          onModeChange={onModeChange}
        />
      )}
    </Box>
  );
}
`
  );

  write(
    'itemMaster/MasterItemDialogLocationReadOnly.jsx',
    `import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function MasterItemDialogLocationReadOnly({ location }) {
  if (location.address || location.latitude != null) {
    return (
${slice(lines, 529, 540)}
    );
  }
  return (
${slice(lines, 542, 544)}
  );
}
`
  );

  write(
    'itemMaster/MasterItemDialogLocationManualForm.jsx',
    `import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export default function MasterItemDialogLocationManualForm({ location, onChange, loading, onRefresh }) {
  return (
${slice(lines, 547, 604)}
  );
}
`
  );

  write(
    'itemMaster/MasterItemDialogLocationAutoView.jsx',
    `import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/EditOutlined';

export default function MasterItemDialogLocationAutoView({ location, loading, error, onModeChange }) {
  return (
${slice(lines, 607, 684)}
  );
}
`
  );

  // Hook + form section + shell
  write(
    'itemMaster/useMasterItemDialog.js',
    `import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CATALOG_FIELDS, newNameField, OTHER } from './itemMasterFields';
import { ITEM_MASTER_CATALOG_KINDS } from '../../utils/constants';
import { itemMasterApi } from '../../api/itemMasterApi';
import { masterItemDialogSchema } from './masterItemDialogSchema';
import {
  emptyMasterItemFormValues,
  itemNameText,
  mapItemToForm,
  normalizeAttachments,
} from './masterItemDialogFormHelpers';
import { buildMasterItemFormData } from './masterItemDialogSubmit';
import { useMasterItemDialogLocation } from './useMasterItemDialogLocation';
import { useMasterItemDialogCatalogActions } from './useMasterItemDialogCatalogActions';

export function useMasterItemDialog({ open, mode, item, onSubmit }) {
  const readOnly = mode === 'view';
  const methods = useForm({ resolver: yupResolver(masterItemDialogSchema), defaultValues: emptyMasterItemFormValues() });

  const [images, setImages] = useState([]);
  const [billPhotos, setBillPhotos] = useState([]);
  const [visitingCards, setVisitingCards] = useState([]);
  const [existingItems, setExistingItems] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const prevItemNameRef = useRef('');
  const initialAttachmentsRef = useRef({ image: [], billPhoto: [], visitingCard: [] });

  const location = useMasterItemDialogLocation({ open, mode, item });

  const catalogActions = useMasterItemDialogCatalogActions({ methods, open, mode, item, existingItems, setExistingItems, setNameOptions, setImages, setBillPhotos, setVisitingCards, initialAttachmentsRef, location, prevItemNameRef });

  const itemNameSelect = useWatch({ control: methods.control, name: 'itemNameSelect' });

  useEffect(() => {
    if (!open || mode !== 'create') return;
    if (itemNameSelect === prevItemNameRef.current) return;
    prevItemNameRef.current = itemNameSelect;
    if (!itemNameSelect || itemNameSelect === OTHER) return;
    methods.setValue('itemName', itemNameSelect, { shouldValidate: true });
    const template = existingItems.find((entry) => itemNameText(entry) === itemNameSelect);
    if (template) catalogActions.applyTemplate(template, itemNameSelect);
  }, [itemNameSelect, existingItems, open, mode, catalogActions, methods]);

  const submit = (values) => {
    onSubmit(
      buildMasterItemFormData({
        values,
        mode,
        images,
        billPhotos,
        visitingCards,
        currentLocation: location.currentLocation,
        initialAttachmentsRef,
      })
    );
  };

  return {
    readOnly,
    mode,
    item,
    methods,
    images,
    setImages,
    billPhotos,
    setBillPhotos,
    visitingCards,
    setVisitingCards,
    nameOptions,
    catalog: catalogActions.catalog,
    adding: catalogActions.adding,
    confirmRemove: catalogActions.confirmRemove,
    setConfirmRemove: catalogActions.setConfirmRemove,
    removing: catalogActions.removing,
    handleRemoveCatalog: catalogActions.handleRemoveCatalog,
    addItemName: catalogActions.addItemName,
    addCatalogEntry: catalogActions.addCatalogEntry,
    renderCatalog: catalogActions.renderCatalog,
    location,
    submit,
  };
}
`
  );

  write(
    'itemMaster/useMasterItemDialogLocation.js',
    `import { useCallback, useEffect, useRef, useState } from 'react';

export function useMasterItemDialogLocation({ open, mode, item }) {
  const [currentLocation, setCurrentLocation] = useState({ latitude: null, longitude: null, address: '', accuracy: null });
  const [locationMode, setLocationMode] = useState('auto');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);

  const clearLocationWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => clearLocationWatch(), [clearLocationWatch]);

  const fetchCurrentLocation = useCallback(
    (targetMode = 'auto') => {
${slice(lines, 727, 769)}
    },
    [clearLocationWatch]
  );

  const handleLocationModeChange = (nextMode) => {
    setLocationMode(nextMode);
    if (nextMode === 'manual') {
      clearLocationWatch();
      setLocationError('');
    } else {
      fetchCurrentLocation('auto');
    }
  };

  const applySavedLocation = (loc) => {
    if (loc?.latitude != null || (loc?.address && String(loc.address).trim() !== '')) {
      setCurrentLocation({
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        address: loc.address || '',
        accuracy: null,
      });
      setLocationMode('manual');
      setLocationLoading(false);
      setLocationError('');
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!open) return;
    if (!applySavedLocation(item?.location)) {
      setLocationMode('auto');
      fetchCurrentLocation('auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?._id]);

  return {
    currentLocation,
    setCurrentLocation,
    locationMode,
    locationLoading,
    locationError,
    fetchCurrentLocation,
    handleLocationModeChange,
    applySavedLocation,
    fetchCurrentLocationForTemplate: fetchCurrentLocation,
  };
}
`
  );

  write(
    'itemMaster/useMasterItemDialogCatalogActions.jsx',
    `import { useEffect, useState } from 'react';
import { CATALOG_FIELDS, newNameField } from './itemMasterFields';
import { ITEM_MASTER_CATALOG_KINDS } from '../../utils/constants';
import { itemMasterApi } from '../../api/itemMasterApi';
import MasterItemDialogCatalogSelect from './MasterItemDialogCatalogSelect';
import { itemNameText, mapItemToForm, normalizeAttachments } from './masterItemDialogFormHelpers';

export function useMasterItemDialogCatalogActions({
  methods,
  open,
  mode,
  item,
  existingItems,
  setExistingItems,
  setNameOptions,
  setImages,
  setBillPhotos,
  setVisitingCards,
  initialAttachmentsRef,
  location,
  prevItemNameRef,
}) {
  const [catalog, setCatalog] = useState({});
  const [adding, setAdding] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const applyTemplate = (template, selectedName) => {
    if (!template) return;
    const mapped = mapItemToForm(template);
    methods.reset({ ...mapped, itemNameSelect: selectedName, itemName: selectedName });
    const displayName = itemNameText(template);
    setImages(
      normalizeAttachments(template.image).map((entry) => ({
        ...entry,
        name: entry.originalName || displayName || 'Item Image',
      }))
    );
    if (mode === 'create') {
      setBillPhotos([]);
      setVisitingCards([]);
      location.fetchCurrentLocationForTemplate('auto');
    } else {
      setBillPhotos(normalizeAttachments(template.billPhoto));
      setVisitingCards(normalizeAttachments(template.visitingCard));
      location.applySavedLocation(template.location);
    }
  };

  useEffect(() => {
    if (!open) return;
    prevItemNameRef.current = '';
    methods.reset(mapItemToForm(item));
    const nextImages = normalizeAttachments(item?.image);
    const nextBills = normalizeAttachments(item?.billPhoto);
    const nextCards = normalizeAttachments(item?.visitingCard);
    setImages(nextImages);
    setBillPhotos(nextBills);
    setVisitingCards(nextCards);
    initialAttachmentsRef.current = {
      image: nextImages.map((entry) => entry.publicId).filter(Boolean),
      billPhoto: nextBills.map((entry) => entry.publicId).filter(Boolean),
      visitingCard: nextCards.map((entry) => entry.publicId).filter(Boolean),
    };
    location.applySavedLocation(item?.location);
    Promise.all([
      ...CATALOG_FIELDS.map((field) =>
        itemMasterApi
          .listCatalog({ kind: field.name })
          .then((res) => [field.name, res.data?.data || []])
          .catch(() => [field.name, []])
      ),
      itemMasterApi
        .listCatalog({ kind: ITEM_MASTER_CATALOG_KINDS.ITEM_NAME })
        .then((res) => ['__itemNames__', res.data?.data || []])
        .catch(() => ['__itemNames__', []]),
      itemMasterApi
        .listItems({ pageSize: 500, isActive: 'true' })
        .then((res) => ['__items__', res.data?.data || []])
        .catch(() => ['__items__', []]),
    ]).then((entries) => {
      const map = Object.fromEntries(entries.filter(([key]) => key !== '__items__' && key !== '__itemNames__'));
      const loadedItems = entries.find(([key]) => key === '__items__')?.[1] || [];
      const catalogNames = entries.find(([key]) => key === '__itemNames__')?.[1] || [];
      const names = new Set();
      catalogNames.forEach((entry) => {
        if (entry?.name) names.add(entry.name);
      });
      loadedItems.forEach((entry) => {
        const name = itemNameText(entry);
        if (name) names.add(name);
      });
      setCatalog(map);
      setExistingItems(loadedItems);
      setNameOptions([...names].sort((a, b) => a.localeCompare(b)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const addItemName = async () => {
${slice(lines, 897, 917)}
  };

  const addCatalogEntry = async (field) => {
${slice(lines, 920, 945)}
  };

  const handleRemoveCatalog = async () => {
${slice(lines, 948, 964)}
  };

  const field = (name) => CATALOG_FIELDS.find((entry) => entry.name === name);

  const renderCatalog = (name) => (
    <MasterItemDialogCatalogSelect
      field={field(name)}
      options={catalog[name] || []}
      readOnly={mode === 'view'}
      adding={adding === name}
      onAdd={() => addCatalogEntry(field(name))}
      onRemove={(option) => setConfirmRemove({ field: field(name), option })}
    />
  );

  return {
    catalog,
    adding,
    confirmRemove,
    setConfirmRemove,
    removing,
    addItemName,
    addCatalogEntry,
    handleRemoveCatalog,
    renderCatalog,
    applyTemplate,
  };
}
`
  );

  write(
    'itemMaster/masterItemDialogSubmit.js',
    `import { CATALOG_FIELDS, newNameField, OTHER } from './itemMasterFields';

export function buildMasterItemFormData({
  values,
  mode,
  images,
  billPhotos,
  visitingCards,
  currentLocation,
  initialAttachmentsRef,
}) {
  const formData = new FormData();
  formData.append('personAsked', String(values.personAsked ?? '').trim());
  formData.append('itemName', String(values.itemName ?? '').trim());
  formData.append('itemDescription', String(values.itemDescription ?? '').trim());
  formData.append('quantity', values.quantity === null || values.quantity === undefined ? '' : String(values.quantity));
  formData.append('price', values.price === null || values.price === undefined ? '' : String(values.price));
  CATALOG_FIELDS.forEach((field) => {
    formData.append(field.name, values[field.name] || '');
    if (values[field.name] === OTHER) {
      formData.append(newNameField(field.name), String(values[newNameField(field.name)] || '').trim());
    }
  });
  images.filter((entry) => entry.file).forEach((entry) => formData.append('itemImage', entry.file));
  billPhotos.filter((entry) => entry.file).forEach((entry) => formData.append('billPhoto', entry.file));
  visitingCards.filter((entry) => entry.file).forEach((entry) => formData.append('visitingCard', entry.file));
  appendLocation(formData, currentLocation, mode);
  if (mode === 'edit') appendRemovedAttachmentIds(formData, images, billPhotos, visitingCards, initialAttachmentsRef);
  return formData;
}

function appendLocation(formData, currentLocation, mode) {
  const latVal = String(currentLocation.latitude ?? '').trim();
  const lngVal = String(currentLocation.longitude ?? '').trim();
  const lat = latVal !== '' && !isNaN(Number(latVal)) ? Number(latVal) : null;
  const lng = lngVal !== '' && !isNaN(Number(lngVal)) ? Number(lngVal) : null;
  const address = String(currentLocation.address || '').trim();
  if (lat != null || lng != null || address) {
    formData.append('location', JSON.stringify({ latitude: lat, longitude: lng, address }));
  } else if (mode === 'edit') {
    formData.append('location', JSON.stringify({ latitude: null, longitude: null, address: '' }));
  }
}

function appendRemovedAttachmentIds(formData, images, billPhotos, visitingCards, initialAttachmentsRef) {
  const keptImageIds = new Set(images.map((entry) => entry.publicId).filter(Boolean));
  const keptBillIds = new Set(billPhotos.map((entry) => entry.publicId).filter(Boolean));
  const keptCardIds = new Set(visitingCards.map((entry) => entry.publicId).filter(Boolean));
  const removeItemImageIds = initialAttachmentsRef.current.image.filter((id) => !keptImageIds.has(id));
  const removeBillPhotoIds = initialAttachmentsRef.current.billPhoto.filter((id) => !keptBillIds.has(id));
  const removeVisitingCardIds = initialAttachmentsRef.current.visitingCard.filter((id) => !keptCardIds.has(id));
  if (removeItemImageIds.length) formData.append('removeItemImageIds', JSON.stringify(removeItemImageIds));
  if (removeBillPhotoIds.length) formData.append('removeBillPhotoIds', JSON.stringify(removeBillPhotoIds));
  if (removeVisitingCardIds.length) formData.append('removeVisitingCardIds', JSON.stringify(removeVisitingCardIds));
}
`
  );

  write(
    'itemMaster/MasterItemDialogFormSection.jsx',
    `import Grid from '@mui/material/Grid';
import { FormProvider } from 'react-hook-form';
import Box from '@mui/material/Box';
import RHFTextField from '../../components/common/FormFields/RHFTextField';
import MasterItemDialogFieldLabel from './MasterItemDialogFieldLabel';
import MasterItemDialogItemNameField from './MasterItemDialogItemNameField';
import MasterItemDialogLocationField from './MasterItemDialogLocationField';
import MasterItemDialogMultiFilePicker from './MasterItemDialogMultiFilePicker';
import MasterItemDialogTotalAmountField from './MasterItemDialogTotalAmountField';

export default function MasterItemDialogFormSection({
  methods,
  readOnly,
  mode,
  renderCatalog,
  nameOptions,
  adding,
  addItemName,
  images,
  setImages,
  billPhotos,
  setBillPhotos,
  visitingCards,
  setVisitingCards,
  location,
  submit,
}) {
  return (
    <FormProvider {...methods}>
      <Box component="form" id="master-item-form" onSubmit={methods.handleSubmit(submit)}>
        <Grid container spacing={2}>
${slice(lines, 1069, 1154)
  .replace(/currentLocation/g, 'location.currentLocation')
  .replace(/setCurrentLocation/g, 'location.setCurrentLocation')
  .replace(/locationMode/g, 'location.locationMode')
  .replace(/handleLocationModeChange/g, 'location.handleLocationModeChange')
  .replace(/locationLoading/g, 'location.locationLoading')
  .replace(/locationError/g, 'location.locationError')
  .replace(/fetchCurrentLocation/g, 'location.fetchCurrentLocation')
  .replace(/LocationField/g, 'MasterItemDialogLocationField')}
        </Grid>
      </Box>
    </FormProvider>
  );
}
`
  );

  write(
    'itemMaster/MasterItemDialog.jsx',
    `import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';
import { useMasterItemDialog } from './useMasterItemDialog';
import MasterItemDialogFormSection from './MasterItemDialogFormSection';

const titleMap = { create: 'New Master Item', edit: 'Edit Master Item', view: 'Master Item Details' };

export default function MasterItemDialog({ open, mode = 'create', item, onClose, onSubmit, submitting }) {
  const vm = useMasterItemDialog({ open, mode, item, onSubmit });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: 0.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {titleMap[mode]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New items require approval from the Item Master admin.
              </Typography>
              {mode !== 'create' && item?.createdAt && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Added on {formatDateTime(item.createdAt)}
                  {item.updatedAt && item.updatedAt !== item.createdAt
                    ? \` · Last updated \${formatDateTime(item.updatedAt)}\`
                    : ''}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose} aria-label="Close" size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <MasterItemDialogFormSection
            methods={vm.methods}
            readOnly={vm.readOnly}
            mode={vm.mode}
            renderCatalog={vm.renderCatalog}
            nameOptions={vm.nameOptions}
            adding={vm.adding}
            addItemName={vm.addItemName}
            images={vm.images}
            setImages={vm.setImages}
            billPhotos={vm.billPhotos}
            setBillPhotos={vm.setBillPhotos}
            visitingCards={vm.visitingCards}
            setVisitingCards={vm.setVisitingCards}
            location={vm.location}
            submit={vm.submit}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>{vm.readOnly ? 'Close' : 'Cancel'}</Button>
          {!vm.readOnly && (
            <Button type="submit" form="master-item-form" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Item'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(vm.confirmRemove)}
        title={\`Remove \${vm.confirmRemove?.field?.label || 'option'}\`}
        message={\`Remove "\${vm.confirmRemove?.option?.label}" from \${vm.confirmRemove?.field?.label}? It will also be cleared on items that used it.\`}
        confirmLabel="Remove"
        confirmColor="error"
        loading={vm.removing}
        onConfirm={vm.handleRemoveCatalog}
        onClose={() => {
          if (!vm.removing) vm.setConfirmRemove(null);
        }}
      />
    </>
  );
}
`
  );
})();

console.log('split-page-monsters: stock + masterItem done (station/project/bg require pass 2)');