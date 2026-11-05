import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RouteIcon from '@mui/icons-material/Route';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { visitApi } from '../../api/visitApi';
import { formatPlanTime } from '../../utils/readLocation';
import { VISIT_STATUS } from '../../utils/constants';

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function isDateToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

function visitStatusColor(status) {
  switch (status) {
    case VISIT_STATUS.COMPLETED:
      return 'success';
    case VISIT_STATUS.IN_PROGRESS:
      return 'info';
    case VISIT_STATUS.PENDING_APPROVAL:
      return 'warning';
    case VISIT_STATUS.APPROVED_MISSED:
      return 'default';
    case VISIT_STATUS.REJECTED:
      return 'error';
    default:
      return 'default';
  }
}

function expenseStatusColor(status) {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'SUBMITTED':
      return 'info';
    case 'REJECTED':
      return 'error';
    case 'DRAFT':
      return 'warning';
    default:
      return 'default';
  }
}

export default function DailyVisitsSummary({ onPlanVisit }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDates, setOpenDates] = useState(new Set());
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handlePlanVisit = () => {
    if (onPlanVisit) {
      onPlanVisit();
    } else {
      navigate('/visits/new');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await visitApi.dailySummary();
      const list = res.data?.data || [];
      setData(list);
      // Auto-open today's row if present, or first row
      if (list.length > 0) {
        setOpenDates(new Set([list[0].date]));
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDate = (date) => {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'rgba(212, 163, 78, 0.35)',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
          p: { xs: 2.5, sm: 4 },
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(56, 32, 10, 0.06)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#241404' }}>
          No Visit Records Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 460, mx: 'auto' }}>
          You have not planned or completed any customer visits yet. Plan your first customer visit to get started!
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePlanVisit}
            sx={{ borderRadius: '16px', fontWeight: 700 }}
          >
            + Plan Visits
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/visits/today')}
            sx={{ borderRadius: '16px', fontWeight: 600 }}
          >
            Today's Visits
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          overflow: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table aria-label="daily visits table">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ width: 44, p: 1 }} />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Visits Summary</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Total Travel</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Expense Claim</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => {
              const isOpen = openDates.has(row.date);
              const isToday = isDateToday(row.date);

              return (
                <DateRow
                  key={row.date}
                  row={row}
                  isOpen={isOpen}
                  isToday={isToday}
                  onToggle={() => toggleDate(row.date)}
                  onPhotoClick={(url, caption) => setPreviewPhoto({ url, caption })}
                  onNavigate={navigate}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Image Preview Modal */}
      <Dialog
        open={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {previewPhoto?.caption || 'Photo Preview'}
          </Typography>
          <IconButton onClick={() => setPreviewPhoto(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          {previewPhoto?.url && (
            <Box
              component="img"
              src={previewPhoto.url}
              alt="Visit verification photo"
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DateRow({ row, isOpen, isToday, onToggle, onPhotoClick, onNavigate }) {
  const hasVisits = row.visits && row.visits.length > 0;
  const exp = row.expense;

  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          bgcolor: isToday ? '#FFFBF5' : isOpen ? '#FCFAFA' : 'inherit',
          '& > *': { borderBottom: isOpen ? 'none !important' : undefined },
        }}
      >
        <TableCell sx={{ p: 1, textAlign: 'center' }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatDateDisplay(row.date)}
            </Typography>
            {isToday && (
              <Chip size="small" label="Today" color="primary" sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }} />
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.totalVisits} {row.totalVisits === 1 ? 'Visit' : 'Visits'}
            </Typography>
            {row.completedCount > 0 && (
              <Chip
                size="small"
                color="success"
                icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
                label={`${row.completedCount} Done`}
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
            {row.inProgressCount > 0 && (
              <Chip
                size="small"
                color="info"
                label={`${row.inProgressCount} In Progress`}
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
            {row.missedCount > 0 && (
              <Chip
                size="small"
                color="warning"
                label={`${row.missedCount} Missed`}
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            )}
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <RouteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.totalTravelKm > 0 ? `${row.totalTravelKm} km` : '—'}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {exp ? (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                ₹{Number(exp.totalAmount || 0).toLocaleString('en-IN')}
              </Typography>
              <Chip
                size="small"
                label={exp.status}
                color={expenseStatusColor(exp.status)}
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
              />
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No claim filed
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <Button
            size="small"
            variant="text"
            endIcon={isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            sx={{ fontWeight: 700 }}
          >
            {isOpen ? 'Hide Details' : 'View Details'}
          </Button>
        </TableCell>
      </TableRow>

      {/* Collapsible Expanded Details */}
      <TableRow sx={{ bgcolor: isToday ? '#FFFBF5' : '#FCFAFA' }}>
        <TableCell colSpan={6} sx={{ py: 0, px: { xs: 1, sm: 3 } }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2.5 }}>
              <Stack spacing={2.5}>
                {/* 1. Visits Section */}
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.dark' }}>
                    Customer Visits on {formatDateDisplay(row.date)} ({row.totalVisits})
                  </Typography>

                  {hasVisits ? (
                    <Stack spacing={1.5}>
                      {row.visits.map((v, index) => (
                        <VisitDetailCard
                          key={v._id}
                          visit={v}
                          index={index}
                          onPhotoClick={onPhotoClick}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No customer visits scheduled for this date.
                    </Typography>
                  )}
                </div>

                {/* 2. Expense Section */}
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '16px',
                    p: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
                    <div>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Travel Expense Claim ({formatDateDisplay(row.date)})
                        </Typography>
                        {exp && (
                          <Chip
                            size="small"
                            label={exp.status}
                            color={expenseStatusColor(exp.status)}
                            sx={{ fontWeight: 700, height: 20, fontSize: '0.6875rem' }}
                          />
                        )}
                      </Stack>
                      {exp ? (
                        <Typography variant="body2" color="text.secondary">
                          Claimed: <strong>₹{Number(exp.totalAmount || 0).toLocaleString('en-IN')}</strong> · Travel: <strong>{exp.totalKm || 0} km</strong> ({exp.itemCount || 0} legs)
                          {exp.adminComment ? ` · Note: "${exp.adminComment}"` : ''}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No expense form has been created for this day yet.
                        </Typography>
                      )}
                    </div>

                    {exp?._id ? (
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onNavigate(`/expenses/${exp._id}`)}
                        sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
                      >
                        Open Expense Claim
                      </Button>
                    ) : isToday ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onNavigate('/visits/today')}
                        sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
                      >
                        Complete Day in Today's Visits
                      </Button>
                    ) : null}
                  </Stack>
                </Card>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function VisitDetailCard({ visit, index, onPhotoClick, onNavigate }) {
  const isPending = visit.status === VISIT_STATUS.PENDING_APPROVAL;
  const isMissed = visit.status === VISIT_STATUS.APPROVED_MISSED || (isPending && !visit.checkInAt);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header: Visit #, Customer, Planned Time, Status */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={`Visit #${index + 1}`}
              color={visitStatusColor(visit.status)}
              sx={{ fontWeight: 700, height: 22 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {visit.customer?.companyName || 'Customer'}
            </Typography>
            {visit.customer?.city && (
              <Typography variant="caption" color="text.secondary">
                ({visit.customer.city})
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {formatPlanTime(visit.plannedTime)}{visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''}
            </Typography>
            <Chip
              size="small"
              label={isPending ? 'PENDING APPROVAL' : visit.status.replaceAll('_', ' ')}
              color={visitStatusColor(visit.status)}
              variant="outlined"
              sx={{ fontWeight: 700, height: 22, fontSize: '0.6875rem' }}
            />
          </Stack>
        </Stack>

        {/* Customer Address & Purpose */}
        <Box sx={{ pl: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Purpose:</strong> {visit.purpose}
            {visit.customer?.address ? ` · Location: ${visit.customer.address}` : ''}
          </Typography>
        </Box>

        {/* Check-In & Check-Out Details with Photos */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          {/* Check-In Box */}
          <Box
            sx={{
              flex: 1,
              p: 1.25,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid',
              borderColor: '#E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
              Check-In Details
            </Typography>
            {visit.checkInAt ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                {visit.checkInPhotoUrl && (
                  <Tooltip title="Click to view full photo">
                    <Box
                      component="img"
                      src={visit.checkInPhotoUrl}
                      alt="Check-in Selfie"
                      onClick={() => onPhotoClick(visit.checkInPhotoUrl, `Check-in Photo: ${visit.customer?.companyName}`)}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '6px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  </Tooltip>
                )}
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(visit.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {visit.checkInDistanceM != null ? `📍 ${visit.checkInDistanceM}m from site` : 'Location verified'}
                    {visit.checkInAddress ? ` · ${visit.checkInAddress}` : ''}
                  </Typography>
                </div>
              </Stack>
            ) : isMissed ? (
              <Typography variant="caption" color="warning.main">
                Not checked in (Missed visit)
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Not checked in yet
              </Typography>
            )}
          </Box>

          {/* Check-Out Box */}
          <Box
            sx={{
              flex: 1,
              p: 1.25,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid',
              borderColor: '#E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 0.5 }}>
              Check-Out Details
            </Typography>
            {visit.checkOutAt ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                {visit.checkOutPhotoUrl && (
                  <Tooltip title="Click to view full photo">
                    <Box
                      component="img"
                      src={visit.checkOutPhotoUrl}
                      alt="Check-out Selfie"
                      onClick={() => onPhotoClick(visit.checkOutPhotoUrl, `Check-out Photo: ${visit.customer?.companyName}`)}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '6px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  </Tooltip>
                )}
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(visit.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {visit.visitDurationMin != null ? `${visit.visitDurationMin} mins` : ''}
                    {visit.travelKm != null ? ` · Travel: ${visit.travelKm} km` : ''}
                  </Typography>
                </div>
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {visit.checkInAt ? 'Meeting in progress…' : 'Pending visit execution'}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Meeting Outcome Remark */}
        {visit.outcomeNotes && (
          <Box
            sx={{
              p: 1.25,
              borderRadius: '6px',
              bgcolor: '#FFF8F8',
              borderLeft: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
              Meeting Remark / Outcome:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#1E293B', mt: 0.25 }}>
              "{visit.outcomeNotes}"
            </Typography>
          </Box>
        )}

        {/* Missed Details if any */}
        {(visit.missedReason || visit.missedExplanation) && (
          <Box
            sx={{
              p: 1.25,
              borderRadius: '6px',
              bgcolor: '#FFFBEB',
              borderLeft: '3px solid',
              borderColor: '#F59E0B',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#B45309', display: 'block' }}>
              Exception / Missed Details:
            </Typography>
            <Typography variant="body2" sx={{ color: '#92400E', mt: 0.25 }}>
              {visit.missedReason} {visit.missedExplanation ? `— "${visit.missedExplanation}"` : ''}
            </Typography>
          </Box>
        )}

        {/* Quick link to visit page */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onNavigate(`/visits/${visit._id}`)}
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          >
            Open Full Visit Record
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}
