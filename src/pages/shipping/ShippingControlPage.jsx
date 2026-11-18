import MigratedAppWorkspace from './MigratedAppWorkspace';
import { SHIPPING_TABS, IMPORT_TABS } from './companionTabs';
import { shippingApi } from '../../api/shippingApi';
import { importControlApi } from '../../api/importControlApi';

export default function ShippingControlPage() {
  return (
    <MigratedAppWorkspace
      app="shipping"
      title="Shipping Control"
      subtitle="Dashboard, dispatches, shipments, bills, and masters in one place"
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
      subtitle="Dashboard, imports, inbox, payments, and masters in one place"
      tabs={IMPORT_TABS}
      permissionKey="importControl"
      fetchDashboard={importControlApi.dashboard}
      fetchTab={importControlApi.tab}
    />
  );
}
