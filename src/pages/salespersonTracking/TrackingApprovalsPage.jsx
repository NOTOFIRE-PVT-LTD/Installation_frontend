import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SlidingPills from '../../components/common/SlidingPills';
import AttendanceApprovalsPanel from '../../components/attendance/AttendanceApprovalsPanel';
import LeaveApprovalsPanel from '../../components/leave/LeaveApprovalsPanel';
import VisitApprovalsPage from '../visits/VisitApprovalsPage';
import ExpenseApprovalsPanel from '../../components/expense/ExpenseApprovalsPanel';

export default function TrackingApprovalsPage({ title, subtitle }) {
  const [part, setPart] = useState('visits');
  const pills = (
    <SlidingPills
      value={part}
      onChange={setPart}
      items={[
        { id: 'visits', label: 'Visits' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'leave', label: 'Leaves' },
      ]}
    />
  );

  return (
    <>
      {title ? <PageHeader title={title} subtitle={subtitle} /> : null}
      {part === 'visits' && <VisitApprovalsPage embedded toolbarStart={pills} />}
      {part === 'expenses' && <ExpenseApprovalsPanel toolbarStart={pills} />}
      {part === 'attendance' && <AttendanceApprovalsPanel title="" toolbarStart={pills} />}
      {part === 'leave' && <LeaveApprovalsPanel title="" toolbarStart={pills} />}
    </>
  );
}
