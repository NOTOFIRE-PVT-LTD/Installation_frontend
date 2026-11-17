import { Route, Routes } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import { authPublicRouteNodes } from './AppRoutesAuthPublic';
import { protectedRouteNodes } from './AppRoutesProtected';

export default function AppRoutes() {
  return (
    <Routes>
      {authPublicRouteNodes}
      {protectedRouteNodes}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
