import { useState } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PageHeader from '../../components/common/PageHeader';
import AttendanceApprovalsPanel from '../../components/attendance/AttendanceApprovalsPanel';
import LeaveApprovalsPanel from '../../components/leave/LeaveApprovalsPanel';
import VisitApprovalsPage from '../visits/VisitApprovalsPage';
import ExpenseApprovalsPanel from '../../components/expense/ExpenseApprovalsPanel';

export default function TrackingApprovalsPage({ title, subtitle }) {
  const [part, setPart] = useState('visits');

  return (
    <>
      {title ? <PageHeader title={title} subtitle={subtitle} /> : null}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={part}
          onChange={(_e, next) => next && setPart(next)}
          sx={{
            p: 0.5,
            bgcolor: 'primary.light',
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '999px !important',
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              color: 'primary.dark',
              '&.Mui-selected': {
                color: '#fff',
                background: (t) => `${t.palette.primary.gradient} !important`,
              },
            },
          }}
        >
          <ToggleButton value="visits">Visit Approvals</ToggleButton>
          <ToggleButton value="expenses">Expense Approvals</ToggleButton>
          <ToggleButton value="attendance">Attendance Approvals</ToggleButton>
          <ToggleButton value="leave">Leave Approvals</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {part === 'visits' && <VisitApprovalsPage embedded />}
      {part === 'expenses' && <ExpenseApprovalsPanel />}
      {part === 'attendance' && <AttendanceApprovalsPanel title="" />}
      {part === 'leave' && <LeaveApprovalsPanel title="" />}
    </>
  );
}
