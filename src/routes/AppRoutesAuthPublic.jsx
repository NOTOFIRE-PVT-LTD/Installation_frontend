import { Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import CentralLoginRedirect from '../pages/auth/CentralLoginRedirect';
import CentralSsoPage from '../pages/auth/CentralSsoPage';
import ComplaintRegisterPage from '../pages/complaints/ComplaintRegisterPage';
import PublicTrackPage from '../pages/complaints/PublicTrackPage';

export const authPublicRouteNodes = (
  <>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<CentralLoginRedirect />} />
        <Route path="/central-sso" element={<CentralSsoPage />} />
        <Route path="/forgot-password" element={<CentralLoginRedirect />} />
        <Route path="/reset-password/:token" element={<CentralLoginRedirect />} />
      </Route>

      <Route path="/submit" element={<ComplaintRegisterPage />} />
      <Route path="/track" element={<PublicTrackPage />} />
      <Route path="/support" element={<ComplaintRegisterPage />} />
      <Route path="/support/track" element={<PublicTrackPage />} />
      <Route path="/help" element={<ComplaintRegisterPage />} />
      <Route path="/complaint/register" element={<ComplaintRegisterPage />} />
      <Route path="/complaint/track" element={<PublicTrackPage />} />
  </>
);