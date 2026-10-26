import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActionsOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAltOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/ScheduleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import BalanceIcon from '@mui/icons-material/BalanceOutlined';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { payflowRequestApi } from '../../api/payflowApi';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';

const formatInr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function StatCard({ title, value, caption, icon, iconColor, iconBg, action, onClick }) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 130,
        ...(onClick && { cursor: 'pointer', transition: 'box-shadow .15s, transform .15s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }),
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, mt: 0.5 }}>{value}</Typography>
        </Box>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: iconBg, color: iconColor, display: 'grid', placeItems: 'center' }}>
          {icon}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 140 }}>
          {caption}
        </Typography>
        {action}
      </Box>
    </Paper>
  );
}

function FundCard({ title, titleAction, value, valueColor, icon, iconColor, iconBg }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          {titleAction}
        </Box>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, mt: 0.5, color: valueColor }}>{value}</Typography>
      </Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: iconBg, color: iconColor, display: 'grid', placeItems: 'center' }}>
        {icon}
      </Box>
    </Paper>
  );
}

const fmtShort = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '');

// `stats` comes from /payflow/payment-requests/stats.
export default function PayflowDashboardTab({ stats = {}, onOpenRequests, onNewRequest, onFundAdded }) {
  const dispatch = useAppDispatch();
  const [fundOpen, setFundOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');
  const [fundSaving, setFundSaving] = useState(false);

  const submitFund = async () => {
    setFundSaving(true);
    try {
      await payflowRequestApi.addFund({ amount: Number(fundAmount), note: fundNote });
      dispatch(showSnackbar({ message: 'Fund added' }));
      setFundOpen(false);
      setFundAmount('');
      setFundNote('');
      onFundAdded?.();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to add fund', severity: 'error' }));
    } finally {
      setFundSaving(false);
    }
  };

  const {
    totalRequests = 0,
    pendingApproval = 0,
    pendingAmount = 0,
    approved = 0,
    processed = 0,
    rejected = 0,
    postponed = 0,
    advanceFollowUp = 0,
    totalFund = 0,
    totalPayments = 0,
    netAvailable = 0,
  } = stats;
  const totalActivity = processed + rejected;
  const approvalRate = totalRequests ? Math.round((approved / totalRequests) * 100) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => onNewRequest?.()}>
          New Request
        </Button>
      </Box>

      {advanceFollowUp > 0 && (
        <Chip
          icon={<ErrorOutlineIcon />}
          label={`${advanceFollowUp} advance payments awaiting invoice follow-up  Click to view`}
          sx={{ mb: 3, height: 40, borderRadius: 2, bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 600, '& .MuiChip-icon': { color: '#c2410c' } }}
        />
      )}

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        <StatCard
          title="Total Requests"
          onClick={() => onOpenRequests?.('All')}
          value={totalRequests}
          caption="All payment requests"
          icon={<AccountBalanceWalletIcon fontSize="small" />}
          iconColor="#2563eb"
          iconBg="#dbeafe"
        />
        <StatCard
          title="Pending Approval"
          onClick={() => onOpenRequests?.('Pending')}
          value={pendingApproval}
          caption={`Total: ${formatInr(pendingAmount)}`}
          icon={<PendingActionsIcon fontSize="small" />}
          iconColor="#d97706"
          iconBg="#fef3c7"
        />
        <StatCard
          title="Approved"
          onClick={() => onOpenRequests?.('Approved')}
          value={approved}
          caption={`${approvalRate}% approval rate`}
          icon={<TaskAltIcon fontSize="small" />}
          iconColor="#059669"
          iconBg="#d1fae5"
        />
        <StatCard
          title="Total Activity"
          onClick={() => onOpenRequests?.('Processed')}
          value={totalActivity}
          caption={`${processed} processed • ${rejected} rejected`}
          icon={<BarChartIcon fontSize="small" />}
          iconColor="#2563eb"
          iconBg="#dbeafe"
        />
        <StatCard
          title="Postponed Payments"
          onClick={() => onOpenRequests?.('Postponed')}
          value={postponed}
          caption="Click to sync and reactivate"
          icon={<ScheduleIcon fontSize="small" />}
          iconColor="#111827"
          iconBg="transparent"
          action={
            <Button
              size="small"
              variant="contained"
              color="inherit"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRequests?.('Postponed');
              }}
              sx={{ bgcolor: 'grey.200', boxShadow: 'none', minWidth: 64, lineHeight: 1.2 }}
            >
              Sync Now
            </Button>
          }
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2.5, mt: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <FundCard
          title="Total Fund"
          titleAction={
            <IconButton size="small" color="primary" aria-label="Add fund" onClick={() => setFundOpen(true)}>
              <AddIcon fontSize="small" />
            </IconButton>
          }
          value={formatInr(totalFund)}
          icon={<CurrencyRupeeIcon fontSize="small" />}
          iconColor="#2563eb"
          iconBg="#eff6ff"
        />
        <FundCard
          title={`Total Payments (${fmtShort(stats.periodStart)} - ${fmtShort(stats.periodEnd)})`}
          value={formatInr(totalPayments)}
          icon={<TimerOutlinedIcon fontSize="small" />}
          iconColor="#9333ea"
          iconBg="#faf5ff"
        />
        <FundCard
          title="Net Available"
          value={`${netAvailable < 0 ? '-' : ''}${formatInr(Math.abs(netAvailable))}`}
          valueColor={netAvailable < 0 ? '#dc2626' : '#059669'}
          icon={<BalanceIcon fontSize="small" />}
          iconColor="#16a34a"
          iconBg="#f0fdf4"
        />
      </Box>

      <Dialog open={fundOpen} onClose={() => !fundSaving && setFundOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Add Fund</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            type="number"
            label="Amount (₹)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField fullWidth size="small" label="Note (optional)" value={fundNote} onChange={(e) => setFundNote(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFundOpen(false)} disabled={fundSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitFund} disabled={fundSaving || !(Number(fundAmount) > 0)}>
            {fundSaving ? 'Saving…' : 'Add Fund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
