import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { formatDate } from '../../utils/formatters';
import { STATUS_CHIP_STYLES, inr } from './salesTravelUtils';

function InfoField({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mt: 0.25, whiteSpace: 'pre-wrap' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function SalesTravelRequestDetailDialog({
  open,
  request,
  isAdminView = false,
  onClose,
  onEdit,
  onStatusChange,
  updatingStatus = false,
}) {
  const [remark, setRemark] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (request) {
      setRemark(request.adminRemark || '');
      setRating(Number(request.adminRating) || 0);
    }
  }, [request]);

  if (!request) return null;

  const chipStyle = STATUS_CHIP_STYLES[request.status] || STATUS_CHIP_STYLES.Pending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Travel Request — {request.cityTravellingTo}
          </Typography>
          <Chip
            size="small"
            label={request.status || 'Pending'}
            sx={{ bgcolor: chipStyle.bg, color: chipStyle.color, fontWeight: 700, height: 24 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => {
                onClose();
                onEdit(request);
              }}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Edit
            </Button>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {/* Basic Travel Info */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label="Travel From" value={request.travelFrom ? formatDate(request.travelFrom) : '—'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label="Travel To" value={request.travelTo ? formatDate(request.travelTo) : '—'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label="City Travelling To" value={request.cityTravellingTo} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label="Name of Person (Travelling)" value={request.travellerName} />
              </Grid>
              {request.createdBy && (
                <Grid item xs={12} sm={6}>
                  <InfoField
                    label="Submitted By"
                    value={`${request.createdBy.name || ''}${request.createdBy.email ? ` (${request.createdBy.email})` : ''}`}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <InfoField label="Submitted On" value={request.createdAt ? formatDate(request.createdAt) : '—'} />
              </Grid>
              <Grid item xs={12}>
                <InfoField label="Agenda / Purpose of Travel" value={request.agenda} />
              </Grid>
            </Grid>
          </Paper>

          {/* Persons to Meet */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 2 }}>
              Person(s) to Meet ({request.personsToMeet?.length || 0})
            </Typography>
            <Stack spacing={2}>
              {(request.personsToMeet || []).map((person, idx) => (
                <Box
                  key={person._id || idx}
                  sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', bgcolor: '#fcfcfd' }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5, color: 'primary.main' }}>
                    Person {idx + 1}: {person.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoField label="Designation" value={person.designation} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoField label="Company" value={person.company} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoField label="City" value={person.city} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoField label="Contact Number" value={person.contactNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoField label="Email" value={person.email} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoField label="Next Action" value={person.nextAction} />
                    </Grid>
                    {person.purposeOfMeeting && (
                      <Grid item xs={12}>
                        <InfoField label="Purpose of Meeting" value={person.purposeOfMeeting} />
                      </Grid>
                    )}
                    {person.notesAboutPerson && (
                      <Grid item xs={12}>
                        <InfoField label="Notes about Person" value={person.notesAboutPerson} />
                      </Grid>
                    )}
                    {person.meetingOutcome && (
                      <Grid item xs={12}>
                        <InfoField label="Meeting Outcome" value={person.meetingOutcome} />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Travel Itinerary & Approximate Expense */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>
              Approximate Expense / Travel Itinerary
            </Typography>
            {request.travelItinerary?.length > 0 ? (
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc', '& th': { fontWeight: 700, fontSize: '0.75rem' } }}>
                      <TableCell>Date</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Availability</TableCell>
                      <TableCell align="right">Cost (₹)</TableCell>
                      <TableCell>Train/Flight & Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.travelItinerary.map((row, idx) => (
                      <TableRow key={row._id || idx}>
                        <TableCell>{row.date ? formatDate(row.date) : '—'}</TableCell>
                        <TableCell>{row.from || '—'}</TableCell>
                        <TableCell>{row.to || '—'}</TableCell>
                        <TableCell>{row.modeOfTravel || '—'}</TableCell>
                        <TableCell>{row.availability || '—'}</TableCell>
                        <TableCell align="right">{inr(row.cost)}</TableCell>
                        <TableCell>{row.trainOrFlightDetails || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No itinerary rows added.
              </Typography>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" justifyContent="flex-end">
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                Travel Cost Subtotal: {inr(request.travelCostSubtotal)}
              </Typography>
            </Stack>
          </Paper>

          {/* Day-wise Trip Expenses */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>
              Trip Expenses (Day-wise)
            </Typography>
            {request.tripExpenses?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc', '& th': { fontWeight: 700, fontSize: '0.75rem' } }}>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                      <TableCell>Expense Detail</TableCell>
                      <TableCell>Proof of Expense</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.tripExpenses.map((row, idx) => (
                      <TableRow key={row._id || idx}>
                        <TableCell>{row.date ? formatDate(row.date) : '—'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {inr(row.amount)}
                        </TableCell>
                        <TableCell>{row.expenseDetail || '—'}</TableCell>
                        <TableCell>
                          {row.proof?.url ? (
                            <Link href={row.proof.url} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600 }}>
                              {row.proof.name || 'View Proof'}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No day-wise trip expenses recorded.
              </Typography>
            )}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                Day-wise Total: {inr(request.dayWiseTotal)}
              </Typography>
            </Stack>
          </Paper>

          {/* Expected ROI & Grand Total */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Box sx={{ flex: 1 }}>
                <InfoField label="Expected ROI" value={request.expectedRoi} />
              </Box>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderRadius: '10px',
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1d4ed8' }}>
                  Grand Total: {inr(request.grandTotal)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Admin Review / Status Section */}
          {(request.adminRemark || request.adminRating || request.reviewedBy) && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
              <Typography
                sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}
              >
                Admin Review {request.reviewedBy?.name ? `— ${request.reviewedBy.name}` : ''}
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>
                    Rating
                  </Typography>
                  {request.adminRating ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating
                        value={Number(request.adminRating)}
                        readOnly
                        size="small"
                        icon={<StarRoundedIcon fontSize="inherit" />}
                        emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                      />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {request.adminRating} / 5
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Not rated</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={8}>
                  <InfoField
                    label="Admin Remarks"
                    value={request.adminRemark || `Marked as ${request.status}`}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {isAdminView && onStatusChange && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>
                Admin Action — Accept / Reject, Rating & Remarks
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                    Rating
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Rating
                      value={rating}
                      onChange={(_e, nextVal) => setRating(nextVal || 0)}
                      icon={<StarRoundedIcon fontSize="inherit" />}
                      emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                    />
                    {rating > 0 && (
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                        {rating} / 5
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  label="Admin Remarks"
                  placeholder="Enter remarks for this travel request..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={updatingStatus}
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => onStatusChange(request._id, 'Approved', remark, rating || null)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Accept Request
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={updatingStatus}
                    startIcon={<HighlightOffIcon />}
                    onClick={() => onStatusChange(request._id, 'Rejected', remark, rating || null)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Reject Request
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={updatingStatus}
                    onClick={() => onStatusChange(request._id, request.status || 'Pending', remark, rating || null)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Save Remarks & Rating
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

