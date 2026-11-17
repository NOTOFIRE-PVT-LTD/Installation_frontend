import { assertNavAppBoundaries } from './appPathOwners';
import { NAV_ITEMS_ATTENDANCE_LOGISTICS } from './navItemsAttendanceLogistics';
import { NAV_ITEMS_BACK_OFFICE } from './navItemsBackOffice';
import { NAV_ITEMS_SALESPERSON } from './navItemsSalesperson';
import { NAV_ITEMS_WORKSPACE } from './navItemsWorkspace';

// permission: null means "no admin permission required"
// superAdminOnly: true means only visible on Super Admin's sidebar
export const NAV_ITEMS = [
  ...NAV_ITEMS_WORKSPACE,
  ...NAV_ITEMS_ATTENDANCE_LOGISTICS,
  ...NAV_ITEMS_SALESPERSON,
  ...NAV_ITEMS_BACK_OFFICE,
];

if (import.meta.env.DEV) assertNavAppBoundaries(NAV_ITEMS);