import { Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import CentralSsoPage from '../pages/auth/CentralSsoPage';
import ComplaintRegisterPage from '../pages/complaints/ComplaintRegisterPage';
import PublicTrackPage from '../pages/complaints/PublicTrackPage';

export const authPublicRouteNodes = (
  <>
    {/* Full-bleed Centralisation login — no AuthLayout sparkle card */}
    <Route path="/login" element={<LoginPage />} />

    <Route element={<AuthLayout />}>
      <Route path="/central-sso" element={<CentralSsoPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
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
