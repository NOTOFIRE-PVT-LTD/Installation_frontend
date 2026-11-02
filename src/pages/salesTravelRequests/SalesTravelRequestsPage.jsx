import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SearchIcon from '@mui/icons-material/Search';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { showSnackbar } from '../../features/ui/uiSlice';
import { salesTravelRequestApi } from '../../api/salesTravelRequestApi';
import { formatDate } from '../../utils/formatters';
import { apiErrorMessage } from '../quotations/quotationUtils';
import SalesTravelRequestForm from './SalesTravelRequestForm';
import SalesTravelRequestDetailDialog from './SalesTravelRequestDetailDialog';
import { STATUS_CHIP_STYLES, TRAVEL_REQUEST_STATUSES, inr } from './salesTravelUtils';

const PAGE_SIZE_OPTIONS = [25, 50, 100];
const BLUE = '#0d6efd';

export default function SalesTravelRequestsPage() {
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const isOwnOnly = !isAdmin || Boolean(user?.permissions?.salesTravelRequestsOwnOnly);
  const isAdminView = !isOwnOnly;

  const [formState, setFormState] = useState({ open: true, request: null });
  const [detailRequest, setDetailRequest] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [actionRow, setActionRow] = useState(null);

  // Admin review dialog state (Accept / Reject + Remarks + Rating)
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    request: null,
    status: 'Approved',
    remark: '',
    rating: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesTravelRequestApi.list({
        page: page + 1,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
      });
      setRows(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      dispatch(
        showSnackbar({
          message: apiErrorMessage(err, 'Failed to load travel requests'),
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, debouncedSearch, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  const handleOpenMenu = (event, row) => {
    event.stopPropagation();
    setActionAnchor(event.currentTarget);
    setActionRow(row);
  };

  const handleCloseMenu = () => {
    setActionAnchor(null);
    setActionRow(null);
  };

  const openReviewModal = (row, defaultStatus) => {
    setReviewDialog({
      open: true,
      request: row,
      status: defaultStatus || row?.status || 'Approved',
      remark: row?.adminRemark || '',
      rating: Number(row?.adminRating) || 0,
    });
  };

  const handleStatusChange = async (id, status, adminRemark = '', adminRating = null) => {
    setUpdatingStatus(true);
    try {
      const res = await salesTravelRequestApi.updateStatus(id, {
        status,
        adminRemark,
        adminRating,
      });
      const updated = res.data?.data;
      dispatch(showSnackbar({ message: `Travel request updated (${status})` }));
      if (detailRequest && detailRequest._id === id && updated) {
        setDetailRequest(updated);
      }
      setReviewDialog((prev) => ({ ...prev, open: false, request: null }));
      load();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: apiErrorMessage(err, 'Failed to update status'),
          severity: 'error',
        })
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await salesTravelRequestApi.remove(deleteTarget._id);
      dispatch(showSnackbar({ message: 'Travel request deleted' }));
      setDeleteTarget(null);
      load();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: apiErrorMessage(err, 'Failed to delete travel request'),
          severity: 'error',
        })
      );
    } finally {
      setDeleting(false);
    }
  };

  const totalCols = isAdminView ? 12 : 11;

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto', py: 1 }}>
      {/* Top Header matching Screenshot 1 */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a', lineHeight: 1.2 }}>
              {isAdminView ? 'All Travel Requests' : 'My Travel Requests'}
            </Typography>
            <Chip
              size="small"
              label={isAdminView ? 'Admin View' : 'User View'}
              sx={{
                bgcolor: isAdminView ? '#ede9fe' : '#e0f2fe',
                color: isAdminView ? '#6d28d9' : '#0369a1',
                fontWeight: 700,
                height: 22,
                fontSize: '0.72rem',
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748b', mt: 0.4 }}>
            {isAdminView
              ? 'View, accept or reject, rate and add remarks on all sales travel requests'
              : 'Submit and track your travel requests'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormState({ open: true, request: null })}
          sx={{
            borderRadius: '10px',
            px: 2.25,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: BLUE,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0b5ed7', boxShadow: 'none' },
          }}
        >
          New Request
        </Button>
      </Stack>

      {/* Inline Travel Request Form */}
      {formState.open && (
        <SalesTravelRequestForm
          request={formState.request}
          defaultTravellerName={isOwnOnly ? user?.name || '' : ''}
          onClose={() => setFormState({ open: false, request: null })}
          onSaved={() => {
            setFormState({ open: false, request: null });
            load();
          }}
        />
      )}

      {/* Requests List Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
          sx={{ p: 2 }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {TRAVEL_REQUEST_STATUSES.map((status) => (
              <Chip
                key={status}
                label={status}
                clickable
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
                onClick={() => setStatusFilter(status)}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          <TextField
            size="small"
            placeholder="Search by city, traveller, company, person to meet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc', '& th': { fontWeight: 700, fontSize: '0.8rem', color: '#475569' } }}>
                <TableCell>Travel Dates</TableCell>
                <TableCell>City Travelling To</TableCell>
                <TableCell>Person (Travelling)</TableCell>
                {isAdminView && <TableCell>Submitted By</TableCell>}
                <TableCell>Person(s) to Meet</TableCell>
                <TableCell align="right">Travel Cost</TableCell>
                <TableCell align="right">Day-wise</TableCell>
                <TableCell align="right">Grand Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={totalCols}>
                      <Skeleton height={30} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={totalCols}
                    align="center"
                    sx={{ py: 6, color: 'text.secondary' }}
                  >
                    {debouncedSearch || statusFilter !== 'All'
                      ? 'No travel requests match your filters'
                      : 'No travel requests submitted yet'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const chipStyle = STATUS_CHIP_STYLES[row.status] || STATUS_CHIP_STYLES.Pending;
                  const approxTotal = row.travelCostSubtotal || 0;
                  const personsSummary = (row.personsToMeet || [])
                    .map((p) => (p.company ? `${p.name} (${p.company})` : p.name))
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <TableRow
                      key={row._id}
                      hover
                      onClick={() => setDetailRequest(row)}
                      sx={{ cursor: 'pointer', '& td': { fontSize: '0.8125rem' } }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.travelFrom ? formatDate(row.travelFrom) : '—'}
                        {row.travelTo ? ` → ${formatDate(row.travelTo)}` : ''}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.cityTravellingTo}</TableCell>
                      <TableCell>{row.travellerName}</TableCell>
                      {isAdminView && (
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            {row.createdBy?.name || '—'}
                          </Typography>
                          {row.createdBy?.email && (
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                              {row.createdBy.email}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={personsSummary}
                        >
                          {personsSummary || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{inr(approxTotal)}</TableCell>
                      <TableCell align="right">{inr(row.dayWiseTotal)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {inr(row.grandTotal)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status || 'Pending'}
                          sx={{
                            bgcolor: chipStyle.bg,
                            color: chipStyle.color,
                            fontWeight: 700,
                            height: 22,
                            fontSize: '0.72rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {row.adminRating ? (
                          <Rating
                            value={Number(row.adminRating)}
                            readOnly
                            size="small"
                            icon={<StarRoundedIcon fontSize="inherit" />}
                            emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: row.adminRemark ? '#1e293b' : 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={row.adminRemark || ''}
                        >
                          {row.adminRemark || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(_e, next) => setPage(next)}
          onRowsPerPageChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
        />
      </Paper>

      {/* Row Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) setDetailRequest(r);
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) {
              setFormState({ open: true, request: r });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        {isAdminView && (
          <MenuItem
            dense
            onClick={() => {
              const r = actionRow;
              handleCloseMenu();
              if (r) openReviewModal(r, 'Approved');
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'success.main' }}>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Accept Request" />
          </MenuItem>
        )}
        {isAdminView && (
          <MenuItem
            dense
            onClick={() => {
              const r = actionRow;
              handleCloseMenu();
              if (r) openReviewModal(r, 'Rejected');
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
              <HighlightOffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Reject Request" />
          </MenuItem>
        )}
        {isAdminView && (
          <MenuItem
            dense
            onClick={() => {
              const r = actionRow;
              handleCloseMenu();
              if (r) openReviewModal(r, r.status || 'Pending');
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
              <RateReviewOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remarks & Rating" />
          </MenuItem>
        )}
        <MenuItem
          dense
          onClick={() => {
            const r = actionRow;
            handleCloseMenu();
            if (r) setDeleteTarget(r);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Admin Review Dialog (Accept / Reject + Remarks + Rating) */}
      <Dialog
        open={reviewDialog.open}
        onClose={() => !updatingStatus && setReviewDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Review Travel Request — {reviewDialog.request?.cityTravellingTo}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Decision
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={reviewDialog.status === 'Approved' ? 'contained' : 'outlined'}
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => setReviewDialog((prev) => ({ ...prev, status: 'Approved' }))}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', flex: 1 }}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  variant={reviewDialog.status === 'Rejected' ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={() => setReviewDialog((prev) => ({ ...prev, status: 'Rejected' }))}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', flex: 1 }}
                >
                  Reject
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', mb: 0.75 }}>
                Rating
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Rating
                  value={reviewDialog.rating}
                  onChange={(_e, nextVal) =>
                    setReviewDialog((prev) => ({ ...prev, rating: nextVal || 0 }))
                  }
                  icon={<StarRoundedIcon fontSize="inherit" />}
                  emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                />
                {reviewDialog.rating > 0 && (
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                    {reviewDialog.rating} / 5
                  </Typography>
                )}
              </Stack>
            </Box>

            <TextField
              size="small"
              fullWidth
              multiline
              minRows={3}
              label="Remarks"
              placeholder="Add remarks for this travel request..."
              value={reviewDialog.remark}
              onChange={(e) => setReviewDialog((prev) => ({ ...prev, remark: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setReviewDialog((prev) => ({ ...prev, open: false }))}
            disabled={updatingStatus}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={updatingStatus}
            onClick={() =>
              reviewDialog.request &&
              handleStatusChange(
                reviewDialog.request._id,
                reviewDialog.status,
                reviewDialog.remark,
                reviewDialog.rating || null
              )
            }
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            {updatingStatus ? 'Saving…' : 'Save Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <SalesTravelRequestDetailDialog
        open={Boolean(detailRequest)}
        request={detailRequest}
        isAdminView={isAdminView}
        updatingStatus={updatingStatus}
        onClose={() => setDetailRequest(null)}
        onEdit={(req) => {
          setFormState({ open: true, request: req });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete travel request?"
        message={`Travel request for "${deleteTarget?.cityTravellingTo || ''}" (${deleteTarget?.travellerName || ''}) and its uploaded proofs will be permanently deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </Box>
  );
}
