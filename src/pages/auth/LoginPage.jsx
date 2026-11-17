import CentralLoginVisual from './CentralLoginVisual';
import CentralLoginForm from './CentralLoginForm';
import './centralLogin.css';

/** Centralisation login (Valuecon split screen) — not the old Workspace card. */
export default function LoginPage() {
  return (
    <div className="login-screen">
      <CentralLoginVisual />
      <CentralLoginForm />
    </div>
  );
}
