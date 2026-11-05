import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { complaintApi } from '../../api/complaintApi';
import { useAppDispatch } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { showSnackbar } from '../../features/ui/uiSlice';
import ComplaintQrDialog from './ComplaintQrDialog';
import ComplaintDetailPageHeader from './ComplaintDetailPageHeader';
import ComplaintDetailOverviewTab from './ComplaintDetailOverviewTab';
import ComplaintDetailWorkLogsTab from './ComplaintDetailWorkLogsTab';
import ComplaintDetailNotesTab from './ComplaintDetailNotesTab';
import ComplaintDetailTimeline from './ComplaintDetailTimeline';
import { AssignModal, StatusModal, WorkLogModal, ResolveModal, ReopenModal } from './ComplaintDetailModals';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [assignees, setAssignees] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignReason, setAssignReason] = useState('');

  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [workLogForm, setWorkLogForm] = useState({ workPerformed: '', findings: '', actionTaken: '', partsUsed: '', followUpDate: '' });

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveForm, setResolveForm] = useState({ resolutionReason: '', resolutionActionTaken: '', resolutionSummary: '' });

  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [qrOpen, setQrOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPublic, setNoteIsPublic] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const [tRes, aRes] = await Promise.all([complaintApi.getById(id), complaintApi.assignees().catch(() => ({ data: { data: [] } }))]);
      setTicket(tRes.data.data);
      setAssignees(aRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleAssign = async () => {
    try {
      setModalLoading(true);
      await complaintApi.assign(id, { engineerId: assigneeId, reason: assignReason });
      dispatch(showSnackbar({ message: 'Engineer assigned successfully', severity: 'success' }));
      setAssignOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to assign', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setModalLoading(true);
      await complaintApi.updateStatus(id, { nextStatus, reason: statusReason });
      dispatch(showSnackbar({ message: 'Status updated successfully', severity: 'success' }));
      setStatusOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  const handleWorkLog = async () => {
    try {
      setModalLoading(true);
      await complaintApi.addWorkLog(id, workLogForm);
      dispatch(showSnackbar({ message: 'Work log recorded', severity: 'success' }));
      setWorkLogOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to record work log', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setModalLoading(true);
      await complaintApi.resolve(id, resolveForm);
      dispatch(showSnackbar({ message: 'Ticket resolved', severity: 'success' }));
      setResolveOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to resolve', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  const handleReopen = async () => {
    try {
      setModalLoading(true);
      await complaintApi.reopen(id, { reason: reopenReason });
      dispatch(showSnackbar({ message: 'Ticket reopened', severity: 'success' }));
      setReopenOpen(false);
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to reopen', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      setModalLoading(true);
      await complaintApi.addComment(id, { content: noteContent, visibility: noteIsPublic ? 'CUSTOMER_VISIBLE' : 'INTERNAL' });
      setNoteContent('');
      dispatch(showSnackbar({ message: 'Note posted', severity: 'success' }));
      fetchTicket();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to post note', severity: 'error' }));
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && !ticket) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <ComplaintDetailPageHeader
        ticket={ticket} isAdmin={isAdmin}
        onAssignOpen={() => setAssignOpen(true)} onStatusOpen={() => setStatusOpen(true)}
        onWorkLogOpen={() => setWorkLogOpen(true)} onResolveOpen={() => setResolveOpen(true)}
        onReopenOpen={() => setReopenOpen(true)} onQrOpen={() => setQrOpen(true)}
      />
      <Paper elevation={0} sx={{ borderBottom: '1px solid #E2D3BE', mb: 2.5, bgcolor: 'transparent' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label={`Work Logs (${ticket?.workLogs?.length || 0})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label={`Notes (${ticket?.comments?.length || 0})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label={`Timeline (${ticket?.activityLogs?.length || 0})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Paper>
      {activeTab === 0 && <ComplaintDetailOverviewTab ticket={ticket} />}
      {activeTab === 1 && <ComplaintDetailWorkLogsTab workLogs={ticket?.workLogs || []} onAddLog={() => setWorkLogOpen(true)} />}
      {activeTab === 2 && <ComplaintDetailNotesTab comments={ticket?.comments || []} noteContent={noteContent} setNoteContent={setNoteContent} noteIsPublic={noteIsPublic} setNoteIsPublic={setNoteIsPublic} onAddComment={handleAddComment} submitting={modalLoading} />}
      {activeTab === 3 && <ComplaintDetailTimeline activityLogs={ticket?.activityLogs || []} />}

      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} assignees={assignees} assigneeId={assigneeId} setAssigneeId={setAssigneeId} reason={assignReason} setReason={setAssignReason} onSubmit={handleAssign} loading={modalLoading} />
      <StatusModal open={statusOpen} onClose={() => setStatusOpen(false)} currentStatus={ticket?.status} nextStatus={nextStatus} setNextStatus={setNextStatus} reason={statusReason} setReason={setStatusReason} onSubmit={handleStatusUpdate} loading={modalLoading} />
      <WorkLogModal open={workLogOpen} onClose={() => setWorkLogOpen(false)} form={workLogForm} setForm={setWorkLogForm} onSubmit={handleWorkLog} loading={modalLoading} />
      <ResolveModal open={resolveOpen} onClose={() => setResolveOpen(false)} form={resolveForm} setForm={setResolveForm} onSubmit={handleResolve} loading={modalLoading} />
      <ReopenModal open={reopenOpen} onClose={() => setReopenOpen(false)} reason={reopenReason} setReason={setReopenReason} onSubmit={handleReopen} loading={modalLoading} />
      <ComplaintQrDialog open={qrOpen} onClose={() => setQrOpen(false)} />
    </Box>
  );
}
