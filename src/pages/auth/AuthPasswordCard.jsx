import { Link as RouterLink } from 'react-router-dom';
import CentralLoginVisual from './CentralLoginVisual';
import './centralLogin.css';

/** Shared login-style card shell for forgot / reset password. */
export default function AuthPasswordCard({ title, lead, children }) {
  return (
    <div className="login-screen">
      <CentralLoginVisual brandName="VALUECON" tagline="Field operations" />
      <section className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-card__top">
            <div className="login-form-card__intro">
              <h2>{title}</h2>
              <p className="lead">{lead}</p>
            </div>
          </div>
          {children}
          <p className="login-password-back">
            <RouterLink to="/login" className="login-link-btn">
              Back to sign in
            </RouterLink>
          </p>
        </div>
      </section>
    </div>
  );
}
