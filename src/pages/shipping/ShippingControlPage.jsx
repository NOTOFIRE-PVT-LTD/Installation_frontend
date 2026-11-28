import MigratedAppWorkspace from './MigratedAppWorkspace';
import { SHIPPING_TABS, IMPORT_TABS } from './companionTabs';
import { shippingApi } from '../../api/shippingApi';
import { importControlApi } from '../../api/importControlApi';

export default function ShippingControlPage() {
  return (
    <MigratedAppWorkspace
      app="shipping"
      title="Shipping Control"
      subtitle=""
      tabs={SHIPPING_TABS}
      permissionKey="shipping"
      fetchDashboard={shippingApi.dashboard}
      fetchTab={shippingApi.tab}
    />
  );
}

export function ImportControlPage() {
  return (
    <MigratedAppWorkspace
      app="import"
      title="Import Control"
      subtitle=""
      tabs={IMPORT_TABS}
      permissionKey="importControl"
      fetchDashboard={importControlApi.dashboard}
      fetchTab={importControlApi.tab}
    />
  );
}
