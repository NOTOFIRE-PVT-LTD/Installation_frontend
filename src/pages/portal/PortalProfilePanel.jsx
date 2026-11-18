import PortalProfileInfoCard from './PortalProfileInfoCard';
import PortalProfilePasswordCard from './PortalProfilePasswordCard';
import { usePortalProfile } from './usePortalProfile';

export default function PortalProfilePanel() {
  const p = usePortalProfile();

  return (
    <div className="central-profile-wrap">
      <div className="central-profile central-profile--cards">
        <header className="central-profile__header">
          <h2 className="central-users__title">My Profile</h2>
          <p className="central-users__lead">Manage your personal information and password.</p>
        </header>
        <div className="central-profile__grid">
          <PortalProfileInfoCard p={p} />
          <PortalProfilePasswordCard p={p} />
        </div>
      </div>
    </div>
  );
}
