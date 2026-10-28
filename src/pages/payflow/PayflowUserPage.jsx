import PayflowRequestsTab from './PayflowRequestsTab';

// Workspace for non-admin "Payflow users": submit payment requests and track their own.
// Admins see every request in the main Payflow module.
export default function PayflowUserPage() {
  return <PayflowRequestsTab title="My Payment Requests" />;
}
