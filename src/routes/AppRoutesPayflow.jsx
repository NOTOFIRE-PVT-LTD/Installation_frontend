import { Route } from 'react-router-dom';
import PermissionGate from '../components/common/PermissionGate';
import PayflowPage from '../pages/payflow/PayflowPage';
import PayflowUserPage from '../pages/payflow/PayflowUserPage';
import SalesTravelRequestsPage from '../pages/salesTravelRequests/SalesTravelRequestsPage';
import { ROLES } from '../utils/constants';

export const payflowRouteNodes = (
  <>
    <Route
      path="/payflow"
      element={
        <PermissionGate permission="payflow" roles={[]}>
          <PayflowPage />
        </PermissionGate>
      }
    />
    <Route
      path="/payflow-requests"
      element={
        <PermissionGate permission="payflowUser" roles={[ROLES.USER]}>
          <PayflowUserPage />
        </PermissionGate>
      }
    />
    <Route
      path="/sales-travel-requests"
      element={
        <PermissionGate permission="salesTravelRequests" roles={[ROLES.USER]}>
          <SalesTravelRequestsPage />
        </PermissionGate>
      }
    />
  </>
);
